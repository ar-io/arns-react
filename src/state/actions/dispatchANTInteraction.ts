import { ANT, AoARIOWrite, AoMessageResult } from '@ar.io/sdk/web';
import { TransactionAction } from '@src/state/reducers/TransactionReducer';
import {
  ANT_INTERACTION_TYPES,
  ArNSWalletConnector,
  ContractInteraction,
} from '@src/types';
import { lowerCaseDomain } from '@src/utils';
import { WRITE_OPTIONS } from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import {
  getActiveSolanaConfig,
  getSolanaRpc,
  getSolanaRpcSubscriptions,
} from '@src/utils/solana';
import { Dispatch } from 'react';

import { ArNSAction } from '../reducers';

/**
 * Build a Solana ANT instance for the connected wallet. The de-AO refactor
 * eliminated the Lua process backend; only the Solana Metaplex Core NFT
 * backend remains.
 */
async function buildSolanaAnt(wallet: ArNSWalletConnector, processId: string) {
  if (wallet.tokenType !== 'solana' || !wallet.solanaSigner) {
    throw new Error(
      'A connected Solana wallet with a signer is required for ANT interactions.',
    );
  }
  const { programIds } = getActiveSolanaConfig();
  return await ANT.init({
    backend: 'solana',
    processId,
    rpc: getSolanaRpc(),
    rpcSubscriptions: getSolanaRpcSubscriptions(),
    signer: wallet.solanaSigner,
    antProgramId: programIds.antProgramId,
  });
}

export default async function dispatchANTInteraction({
  payload,
  workflowName,
  processId,
  owner,
  wallet,
  arioContract,
  dispatchTransactionState,
  // Kept in the signature for caller compat; no longer consumed after
  // UPGRADE_ANT removal.
  dispatchArNSState: _dispatchArNSState,
  stepCallback,
}: {
  payload: Record<string, any>;
  workflowName: ANT_INTERACTION_TYPES;
  owner: string;
  processId: string;
  /** Connected Solana wallet — required (no AO fallback). */
  wallet?: ArNSWalletConnector;
  /**
   * Active ARIO writeable client. Required for `RELEASE_NAME`/`REASSIGN_NAME`
   * because those instructions live on `ario-arns`, not the ANT program.
   */
  arioContract?: AoARIOWrite;
  dispatchTransactionState: Dispatch<TransactionAction>;
  dispatchArNSState: Dispatch<ArNSAction>;
  stepCallback?: (step?: Record<string, string> | string) => Promise<void>;
  // Legacy AO args — accepted but ignored to soften the cross-phase landing.
  signer?: unknown;
  ao?: unknown;
  hyperbeamUrl?: string;
  antRegistryProcessId?: string;
}): Promise<ContractInteraction> {
  stepCallback ??= async (step) => {
    if (!step || typeof step === 'string') {
      dispatchTransactionState({
        type: 'setSigningMessage',
        payload: step,
      });
    }
  };

  if (!wallet) throw new Error('Wallet is required');
  let result: AoMessageResult | undefined = undefined;
  const antProcess = await buildSolanaAnt(wallet, processId);

  // `APPROVE_PRIMARY_NAME` is not modeled on Solana — the protocol auto-
  // approves on `setPrimaryName`. The corresponding modal/menu actions are
  // removed in Phase 6; this guard catches any stragglers.
  if (
    workflowName === ANT_INTERACTION_TYPES.APPROVE_PRIMARY_NAME ||
    workflowName === ANT_INTERACTION_TYPES.REMOVE_PRIMARY_NAMES
  ) {
    throw new Error(
      `${workflowName} is not modeled on Solana — the protocol auto-approves and there is no removable approval to clear.`,
    );
  }

  try {
    if (!antProcess) throw new Error('ANT provider is not defined');

    switch (workflowName) {
      case ANT_INTERACTION_TYPES.SET_NAME:
        await stepCallback('Setting Name, please wait...');
        result = await antProcess.setName(
          { name: payload.name },
          WRITE_OPTIONS,
        );
        break;
      case ANT_INTERACTION_TYPES.SET_TARGET_ID:
        await stepCallback('Setting Target ID, please wait...');
        result = await antProcess.setRecord(
          {
            undername: '@',
            transactionId: payload.transactionId,
            ttlSeconds: payload.ttlSeconds,
          },
          WRITE_OPTIONS,
        );
        break;
      case ANT_INTERACTION_TYPES.SET_TTL_SECONDS:
        await stepCallback('Setting TTL Seconds, please wait...');
        result = await antProcess.setRecord(
          {
            undername: '@',
            transactionId: payload.transactionId,
            ttlSeconds: payload.ttlSeconds,
          },
          WRITE_OPTIONS,
        );
        break;
      case ANT_INTERACTION_TYPES.SET_TICKER:
        await stepCallback('Setting Ticker, please wait...');
        result = await antProcess.setTicker(
          { ticker: payload.ticker },
          WRITE_OPTIONS,
        );
        break;
      case ANT_INTERACTION_TYPES.SET_CONTROLLER:
        await stepCallback('Setting Controller, please wait...');
        result = await antProcess.addController(
          { controller: payload.controller },
          WRITE_OPTIONS,
        );
        break;
      case ANT_INTERACTION_TYPES.REMOVE_CONTROLLER:
        await stepCallback('Removing Controller, please wait...');
        result = await antProcess.removeController(
          { controller: payload.controller },
          WRITE_OPTIONS,
        );
        break;
      case ANT_INTERACTION_TYPES.TRANSFER:
        await stepCallback('Transferring Ownership, please wait...');
        result = await antProcess.transfer(
          { target: payload.target },
          WRITE_OPTIONS,
        );
        break;
      case ANT_INTERACTION_TYPES.SET_RECORD:
        await stepCallback('Setting Undername, please wait...');
        result = await antProcess.setRecord(
          {
            undername: lowerCaseDomain(payload.subDomain),
            transactionId: payload.transactionId,
            ttlSeconds: payload.ttlSeconds,
          },
          WRITE_OPTIONS,
        );
        break;
      case ANT_INTERACTION_TYPES.EDIT_RECORD:
        await stepCallback('Editing Undername, please wait...');
        result = await antProcess.setRecord(
          {
            undername: lowerCaseDomain(payload.subDomain),
            transactionId: payload.transactionId,
            ttlSeconds: payload.ttlSeconds,
          },
          WRITE_OPTIONS,
        );
        break;
      case ANT_INTERACTION_TYPES.REMOVE_RECORD:
        await stepCallback('Removing Undername, please wait...');
        result = await antProcess.removeRecord(
          { undername: lowerCaseDomain(payload.subDomain) },
          WRITE_OPTIONS,
        );
        break;

      case ANT_INTERACTION_TYPES.RELEASE_NAME: {
        // On Solana, releaseName lives on the ARIO program (ario-arns),
        // not on the ANT. The ANT only proves ownership; the ARIO program
        // is what removes the name from the registry.
        if (!arioContract) {
          throw new Error(
            'releaseName requires the active ARIO writeable client — pass `arioContract` from `useGlobalState()`.',
          );
        }
        await stepCallback('Releasing ArNS Name, please wait...');
        // `releaseName`/`reassignName` are Solana-only ARIO methods (live on
        // `SolanaARIOWriteable`, not on the cross-backend `AoARIOWrite`
        // interface). Cast to access — Phase 7 should hoist them onto the
        // shared interface.
        result = await (arioContract as any).releaseName(
          { name: payload.name },
          WRITE_OPTIONS,
        );
        await stepCallback('Verifying Release, please wait...');
        const released = await arioContract
          .getArNSRecord({ name: payload.name })
          .catch((e: Error) => e);
        if (!(released instanceof Error)) {
          throw new Error('Failed to release ArNS Name: name still exists.');
        }
        break;
      }
      case ANT_INTERACTION_TYPES.REASSIGN_NAME: {
        if (!arioContract) {
          throw new Error(
            'reassignName requires the active ARIO writeable client — pass `arioContract` from `useGlobalState()`.',
          );
        }
        await stepCallback('Reassigning ArNS name, please wait...');
        const newAntProcessId = payload.newAntProcessId;
        if (!newAntProcessId) {
          throw new Error(
            'reassignName requires `newAntProcessId` (Solana mint pubkey of the target ANT). The legacy AO "spawn-then-reassign" flow has been removed.',
          );
        }
        // `reassignName` is Solana-only — see comment on releaseName above.
        result = await (arioContract as any).reassignName(
          { name: payload.name, processId: newAntProcessId },
          WRITE_OPTIONS,
        );
        break;
      }
      case ANT_INTERACTION_TYPES.SET_LOGO:
        await stepCallback('Setting Logo, please wait...');
        result = await antProcess.setLogo(
          { txId: payload.logo },
          WRITE_OPTIONS,
        );
        break;
      case ANT_INTERACTION_TYPES.SET_DESCRIPTION:
        await stepCallback('Setting Description, please wait...');
        result = await antProcess.setDescription(
          { description: payload.description },
          WRITE_OPTIONS,
        );
        break;
      case ANT_INTERACTION_TYPES.SET_KEYWORDS:
        await stepCallback('Setting Keywords, please wait...');
        result = await antProcess.setKeywords(
          { keywords: payload.keywords },
          WRITE_OPTIONS,
        );
        break;

      default:
        throw new Error(`Unsupported workflow name: ${workflowName}`);
    }
  } catch (error) {
    eventEmitter.emit('error', error);
  } finally {
    await stepCallback(undefined);
  }
  if (!result) {
    throw new Error('Failed to dispatch ANT interaction');
  }

  const interaction: ContractInteraction = {
    deployer: owner,
    processId: processId.toString(),
    id: result.id,
    type: 'interaction',
    payload,
  };

  dispatchTransactionState({
    type: 'setWorkflowName',
    payload: workflowName,
  });
  dispatchTransactionState({
    type: 'setInteractionResult',
    payload: interaction,
  });
  return interaction;
}
