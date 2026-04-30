import {
  ANT,
  AoARIOWrite,
  AoMessageResult,
  AoPrimaryName,
  FundFrom,
  MessageResult,
  SetPrimaryNameProgressEvents,
} from '@ar.io/sdk/web';
import { TurboArNSClient } from '@src/services/turbo/TurboArNSClient';
import { TransactionAction } from '@src/state/reducers/TransactionReducer';
import {
  ARNS_INTERACTION_TYPES,
  AoAddress,
  ArNSWalletConnector,
  ContractInteraction,
} from '@src/types';
import { lowerCaseDomain, sleep } from '@src/utils';
import { APP_NAME, WRITE_OPTIONS } from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import { queryClient } from '@src/utils/network';
import { arioContractCacheKey } from '@src/utils/sdk-init';
import {
  SOLANA_PROGRAM_IDS,
  getSolanaRpc,
  getSolanaRpcSubscriptions,
} from '@src/utils/solana';
import { Dispatch } from 'react';

export default async function dispatchArIOInteraction({
  payload,
  workflowName,
  owner,
  arioContract,
  processId,
  dispatch,
  wallet,
  fundFrom,
  paidBy,
  // `promoCode` was used by the legacy Stripe-funded ArNS purchase
  // path (`TurboArNSClient.executeArNSIntent`), which is currently
  // disabled — accept and ignore so call sites don't have to change.
  promoCode: _promoCode,
}: {
  payload: Record<string, any>;
  workflowName: ARNS_INTERACTION_TYPES;
  owner: AoAddress;
  arioContract?: AoARIOWrite;
  processId: string;
  dispatch: Dispatch<TransactionAction>;
  /**
   * Connected Solana wallet — provides the kit signer used for ANT spawning
   * and on-chain ArNS purchase instructions.
   */
  wallet?: ArNSWalletConnector;
  fundFrom?: FundFrom | 'fiat';
  paidBy?: string[];
  promoCode?: string;
  // Legacy AO/Turbo args — accepted but ignored to soften the cross-phase
  // landing. `signer` (AO ContractSigner), `ao` (AoClient), `scheduler`,
  // `hyperbeamUrl`, `turboArNSClient` were used by the AO-spawn + Stripe-ArNS
  // paths that are gone after de-AO.
  signer?: unknown;
  ao?: unknown;
  scheduler?: string;
  hyperbeamUrl?: string;
  turboArNSClient?: TurboArNSClient;
}): Promise<ContractInteraction> {
  let result: AoMessageResult<MessageResult | unknown> | undefined = undefined;
  try {
    if (!arioContract) throw new Error('ArIO provider is not defined');
    if (wallet?.tokenType !== 'solana' || !wallet.solanaSigner) {
      throw new Error(
        'A connected Solana wallet with a signer is required for ArIO interactions.',
      );
    }
    // The Stripe-funded ArNS purchase flow (`executeArNSIntent`) is currently
    // AO-coupled and disabled on Solana — see `TurboArNSClient.ts`. Surface a
    // clear error if anyone reaches the `'fiat'` branch despite the UI gate.
    if (fundFrom === 'fiat') {
      throw new Error(
        'Credit-card payments for ArNS purchases are temporarily unavailable on Solana. The Turbo payment service needs Solana support before this flow can be re-enabled. Top up Turbo credits with SOL/ARIO and use `fundFrom: "turbo"` instead.',
      );
    }
    const originalFundFrom = fundFrom as FundFrom;
    dispatch({ type: 'setSigning', payload: true });
    switch (workflowName) {
      case ARNS_INTERACTION_TYPES.BUY_RECORD: {
        const { name, type, years } = payload;

        // Spawn the ANT first. On Solana this mints a Metaplex Core asset
        // and bootstraps the ACL atomically.
        let antProcessId: string;
        if (payload.processId) {
          antProcessId = payload.processId;
        } else {
          dispatch({
            type: 'setSigningMessage',
            payload: `Spawning new ANT for new ArNS name '${name}'`,
          });
          const spawnResult = await ANT.spawn({
            backend: 'solana',
            rpc: getSolanaRpc(),
            rpcSubscriptions: getSolanaRpcSubscriptions(),
            signer: wallet.solanaSigner,
            antProgramId: SOLANA_PROGRAM_IDS.antProgramId,
            state: {
              name,
              transactionId: payload.targetId,
            },
          });
          antProcessId = spawnResult.processId;
        }

        const buyRecordResult = await arioContract.buyRecord({
          name: lowerCaseDomain(name),
          type,
          years,
          processId: antProcessId,
          fundFrom: originalFundFrom,
          referrer: APP_NAME,
          paidBy,
        });
        result = buyRecordResult;
        payload.processId = antProcessId;
        dispatch({
          type: 'setSigningMessage',
          payload: `Successfully purchased '${name}'`,
        });
        break;
      }
      case ARNS_INTERACTION_TYPES.EXTEND_LEASE:
        result = await arioContract.extendLease(
          {
            name: lowerCaseDomain(payload.name),
            years: payload.years,
            fundFrom: originalFundFrom,
            referrer: APP_NAME,
            paidBy,
          },
          WRITE_OPTIONS,
        );
        break;
      case ARNS_INTERACTION_TYPES.INCREASE_UNDERNAMES:
        result = await arioContract.increaseUndernameLimit(
          {
            name: lowerCaseDomain(payload.name),
            increaseCount: payload.qty,
            fundFrom: originalFundFrom,
            referrer: APP_NAME,
            paidBy,
          },
          WRITE_OPTIONS,
        );
        break;
      case ARNS_INTERACTION_TYPES.PRIMARY_NAME_REQUEST: {
        result = await arioContract.setPrimaryName(
          { name: payload.name },
          {
            ...WRITE_OPTIONS,
            onSigningProgress: (
              step: keyof SetPrimaryNameProgressEvents,
              progressPayload: SetPrimaryNameProgressEvents[keyof SetPrimaryNameProgressEvents],
            ) => {
              if (step === 'requesting-primary-name') {
                dispatch({
                  type: 'setSigningMessage',
                  payload: `Requesting primary name '${(progressPayload as any)?.name ?? payload.name}'`,
                });
              } else if (step === 'request-already-exists') {
                dispatch({
                  type: 'setSigningMessage',
                  payload: `Primary name request for '${payload.name}' already exists!`,
                });
              } else if (step === 'approving-request') {
                dispatch({
                  type: 'setSigningMessage',
                  payload: `Approving primary name request for '${payload.name}'`,
                });
              }
            },
          },
        );

        dispatch({
          type: 'setSigningMessage',
          payload: `Confirming primary name has been updated`,
        });

        // wait 3 seconds and check if the primary name is set
        await sleep(3000);
        await queryClient.refetchQueries({
          predicate: ({ queryKey }) =>
            queryKey.includes('primary-name') &&
            queryKey[1] === owner.toString(),
        });
        const updatedPrimaryName = queryClient.getQueryData<AoPrimaryName>([
          'primary-name',
          owner.toString(),
          arioContractCacheKey(arioContract),
        ]);
        if (!updatedPrimaryName || updatedPrimaryName.name !== payload.name) {
          dispatch({
            type: 'setSigningMessage',
            payload: `Primary name updated. It may take a few minutes to reflect due to network delays. Please check back in a few minutes.`,
          });
          await sleep(3000);
        } else {
          dispatch({
            type: 'setSigningMessage',
            payload: `Successfully set primary name '${payload.name}'!`,
          });
        }
        break;
      }
      case ARNS_INTERACTION_TYPES.UPGRADE_NAME: {
        dispatch({
          type: 'setSigningMessage',
          payload: 'Upgrading Name to Permabuy',
        });
        result = await arioContract.upgradeRecord(
          {
            name: payload.name,
            fundFrom: originalFundFrom,
            referrer: APP_NAME,
            paidBy,
          },
          WRITE_OPTIONS,
        );
        break;
      }
      default:
        throw new Error(`Unsupported workflow name: ${workflowName}`);
    }
  } catch (error) {
    eventEmitter.emit('error', error);
  } finally {
    dispatch({ type: 'setSigning', payload: false });
    queryClient.invalidateQueries({
      predicate: ({ queryKey }) =>
        queryKey.includes('io-balance') ||
        queryKey.includes('ario-liquid-balance') ||
        queryKey.includes('ario-delegated-stake') ||
        queryKey.includes('turbo-credit-balance') ||
        queryKey.includes(lowerCaseDomain(payload.name)),
    });
  }
  if (!result) {
    throw new Error('Failed to dispatch ArIO interaction');
  }

  const interaction: ContractInteraction = {
    deployer: owner.toString(),
    processId: processId.toString(),
    id: result.id,
    type: 'interaction',
    payload,
  };

  dispatch({ type: 'setWorkflowName', payload: workflowName });
  dispatch({ type: 'setInteractionResult', payload: interaction });
  return interaction;
}
