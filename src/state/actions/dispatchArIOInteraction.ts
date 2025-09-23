import {
  ANT,
  AoARIOWrite,
  AoClient,
  AoMessageResult,
  AoPrimaryName,
  ContractSigner,
  DEFAULT_SCHEDULER_ID,
  FundFrom,
  MessageResult,
  SetPrimaryNameProgressEvents,
  SpawnAntProgressEvent,
  createAoSigner,
} from '@ar.io/sdk/web';
import { TurboArNSClient } from '@src/services/turbo/TurboArNSClient';
import { TransactionAction } from '@src/state/reducers/TransactionReducer';
import {
  ARNS_INTERACTION_TYPES,
  AoAddress,
  ContractInteraction,
} from '@src/types';
import { createAntStateForOwner, lowerCaseDomain, sleep } from '@src/utils';
import { APP_NAME, WRITE_OPTIONS } from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import { queryClient } from '@src/utils/network';
import { Dispatch } from 'react';

export default async function dispatchArIOInteraction({
  payload,
  workflowName,
  owner,
  arioContract,
  processId,
  dispatch,
  signer,
  ao,
  scheduler = DEFAULT_SCHEDULER_ID,
  fundFrom,
  turboArNSClient,
  paidBy,
  promoCode,
}: {
  payload: Record<string, any>;
  workflowName: ARNS_INTERACTION_TYPES;
  owner: AoAddress;
  arioContract?: AoARIOWrite;
  processId: string;
  dispatch: Dispatch<TransactionAction>;
  signer?: ContractSigner;
  ao?: AoClient;
  hyperbeamUrl?: string;
  scheduler?: string;
  fundFrom?: FundFrom | 'fiat';
  turboArNSClient?: TurboArNSClient;
  paidBy?: string[];
  promoCode?: string;
}): Promise<ContractInteraction> {
  let result: AoMessageResult<MessageResult | unknown> | undefined = undefined;
  try {
    if (!arioContract) throw new Error('ArIO provider is not defined');
    if (!signer) throw new Error('signer is not defined');
    if (fundFrom === 'fiat' && !turboArNSClient) {
      throw new Error('Turbo ArNS Client is not defined');
    }
    // TODO: should be able to remove this once we have a fiat payment flow for all workflows
    const originalFundFrom = fundFrom as FundFrom;
    dispatch({
      type: 'setSigning',
      payload: true,
    });
    switch (workflowName) {
      case ARNS_INTERACTION_TYPES.BUY_RECORD: {
        const { name, type, years, paymentMethodId, email } = payload;
        const state =
          payload.state ||
          createAntStateForOwner(
            owner.toString(),
            payload.targetId?.toString(),
          );
        // spawn creates the new ant, registers it to the ant registry, validates the state and returns the processId
        const antProcessId: string =
          payload.processId ||
          (await ANT.spawn({
            state,
            signer: createAoSigner(signer),
            ao: ao,
            scheduler: scheduler,
            module: payload.antModuleId,
            antRegistryId: payload.antRegistryId,
            onSigningProgress: (step: keyof SpawnAntProgressEvent) => {
              if (step === 'spawning-ant') {
                dispatch({
                  type: 'setSigningMessage',
                  payload: `Spawning new ANT for new ArNS name '${name}'`,
                });
              } else if (step === 'verifying-state') {
                dispatch({
                  type: 'setSigningMessage',
                  payload: `Validating state of new ANT`,
                });
              } else if (step === 'registering-ant') {
                dispatch({
                  type: 'setSigningMessage',
                  payload: `Adding ANT to the registry`,
                });
              }
            },
          }));
        if (fundFrom === 'fiat') {
          if (!turboArNSClient) {
            throw new Error('Turbo ArNS Client is not defined');
          }
          const buyRecordResult = await turboArNSClient.executeArNSIntent({
            address: owner.toString(),
            name: lowerCaseDomain(name),
            type,
            years,
            processId: antProcessId,
            paymentMethodId,
            email,
            intent: 'Buy-Record',
          });
          result = buyRecordResult;
        } else {
          const buyRecordResult = await arioContract.buyRecord({
            name: lowerCaseDomain(name),
            type,
            years,
            processId: antProcessId,
            fundFrom,
            referrer: APP_NAME,
            paidBy,
          });
          result = buyRecordResult;
        }
        payload.processId = antProcessId;
        // TODO: add some cool ass animation here to get the dopamine hit
        dispatch({
          type: 'setSigningMessage',
          payload: `Successfully purchased '${name}'`,
        });
        break;
      }
      case ARNS_INTERACTION_TYPES.EXTEND_LEASE:
        if (fundFrom === 'fiat') {
          if (!turboArNSClient) {
            throw new Error('Turbo ArNS Client is not defined');
          }
          result = await turboArNSClient.executeArNSIntent({
            address: owner.toString(),
            name: lowerCaseDomain(payload.name),
            years: payload.years,
            intent: 'Extend-Lease',
            paymentMethodId: payload.paymentMethodId,
            email: payload.email,
          });
        } else {
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
        }
        break;
      case ARNS_INTERACTION_TYPES.INCREASE_UNDERNAMES:
        if (fundFrom === 'fiat') {
          if (!turboArNSClient) {
            throw new Error('Turbo ArNS Client is not defined');
          }
          result = await turboArNSClient.executeArNSIntent({
            address: owner.toString(),
            name: lowerCaseDomain(payload.name),
            increaseQty: payload.qty,
            intent: 'Increase-Undername-Limit',
            paymentMethodId: payload.paymentMethodId,
            email: payload.email,
          });
        } else {
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
        }
        break;
      case ARNS_INTERACTION_TYPES.PRIMARY_NAME_REQUEST: {
        result = await arioContract.setPrimaryName(
          {
            name: payload.name,
          },
          {
            ...WRITE_OPTIONS,
            onSigningProgress: (
              step: keyof SetPrimaryNameProgressEvents,
              payload: SetPrimaryNameProgressEvents[keyof SetPrimaryNameProgressEvents],
            ) => {
              if (step === 'requesting-primary-name') {
                dispatch({
                  type: 'setSigningMessage',
                  payload: `Requesting primary name '${payload.name}'`,
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

        // wait 3 seconds and check if the primary name is set, if not show a warning saying due to cranking the primary name may take a few minutes
        await sleep(3000);
        await queryClient.refetchQueries({
          predicate: ({ queryKey }) =>
            queryKey.includes('primary-name') &&
            queryKey[1] === owner.toString(),
        });
        const updatedPrimaryName = queryClient.getQueryData<AoPrimaryName>([
          'primary-name',
          owner.toString(),
          arioContract?.process.processId,
        ]);
        if (!updatedPrimaryName || updatedPrimaryName.name !== payload.name) {
          dispatch({
            type: 'setSigningMessage',
            payload: `Primary name updated. It may take a few minutes to reflect due to network delays. Please check back in a few minutes.`,
          });
          await sleep(3000); // show this message for 3 seconds
        } else {
          // send a final confirmation message
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
        if (fundFrom === 'fiat') {
          if (!turboArNSClient) {
            throw new Error('Turbo ArNS Client is not defined');
          }
          result = await turboArNSClient.executeArNSIntent({
            address: owner.toString(),
            name: lowerCaseDomain(payload.name),
            intent: 'Upgrade-Name',
            paymentMethodId: payload.paymentMethodId,
            email: payload.email,
            promoCode,
          });
        } else {
          result = await arioContract.upgradeRecord(
            {
              name: payload.name,
              fundFrom: originalFundFrom,
              referrer: APP_NAME,
              paidBy,
            },
            WRITE_OPTIONS,
          );
        }
        break;
      }
      default:
        throw new Error(`Unsupported workflow name: ${workflowName}`);
    }
  } catch (error) {
    eventEmitter.emit('error', error);
  } finally {
    dispatch({
      type: 'setSigning',
      payload: false,
    });
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

  dispatch({
    type: 'setWorkflowName',
    payload: workflowName,
  });
  dispatch({
    type: 'setInteractionResult',
    payload: interaction,
  });
  return interaction;
}
