import {
  CustodialANTNotFoundError,
  CustodyTransferUnauthorizedError,
  TurboArNSClient,
} from '@src/services/turbo/TurboArNSClient';
import { TransactionAction } from '@src/state/reducers/TransactionReducer';
import {
  ANT_INTERACTION_TYPES,
  ArNSWalletConnector,
  ContractInteraction,
} from '@src/types';
import { lowerCaseDomain } from '@src/utils';
import { Dispatch } from 'react';

/**
 * Manage a **custodially-held** (Model A) ArNS name's records by debiting the
 * connected identity's Turbo Credits, instead of the wallet-signed
 * `dispatchANTInteraction` path (which can't work: for a custodial name Turbo
 * owns the ANT, not the user).
 *
 * Routes the credit-paid custody endpoints via `TurboArNSClient`:
 *  - `SET_TARGET_ID` / `SET_TTL_SECONDS` → set the apex `@` record
 *  - `SET_RECORD` / `EDIT_RECORD`        → set an undername record
 *  - `REMOVE_RECORD`                     → remove an undername record
 *
 * Owner-only operations (transfer, controllers, ticker, name, logo, …) are NOT
 * available for a custodial name — the user first claims the ANT out of custody
 * (the claim/exit flow), then manages it wallet-signed as a Model B name.
 */
export default async function dispatchCustodialANTRecordInteraction({
  turbo,
  wallet,
  antId,
  workflowName,
  payload,
  owner,
  dispatchTransactionState,
  stepCallback,
}: {
  turbo: TurboArNSClient;
  /** Connected credit-identity wallet (Arweave / Ethereum / — Model A). */
  wallet?: ArNSWalletConnector;
  /** Custodial ANT id (Solana Metaplex Core asset) whose records to manage. */
  antId: string;
  workflowName: ANT_INTERACTION_TYPES;
  payload: Record<string, any>;
  owner: string;
  dispatchTransactionState: Dispatch<TransactionAction>;
  stepCallback?: (step?: string) => void;
}): Promise<ContractInteraction> {
  if (!wallet) {
    throw new Error('A connected wallet is required to manage this name.');
  }
  if (!antId) {
    throw new Error('This name has no known ANT id, so it cannot be managed.');
  }
  // Model A identities authenticate with the wallet's turbo signer; a Solana
  // identity (defensive — custodial names are non-Solana) would use its adapter.
  const isSolana = wallet.tokenType === 'solana';
  if (!isSolana && !wallet.turboSigner) {
    throw new Error(
      `A connected ${wallet.tokenType} wallet is required to manage this name with credits.`,
    );
  }
  const walletAdapter = isSolana
    ? ((typeof window !== 'undefined' ? (window as any).solana : undefined) ??
      (wallet as any).solanaWallet)
    : undefined;

  const signerParams = {
    tokenType: wallet.tokenType,
    signer: wallet.turboSigner,
    walletAdapter,
  };

  const setSigning = (message?: string) => {
    dispatchTransactionState({ type: 'setSigningMessage', payload: message });
    stepCallback?.(message);
  };

  let result: { messageId: string };
  try {
    dispatchTransactionState({ type: 'setSigning', payload: true });

    switch (workflowName) {
      case ANT_INTERACTION_TYPES.SET_TARGET_ID:
      case ANT_INTERACTION_TYPES.SET_TTL_SECONDS: {
        setSigning('Paying with Turbo Credits to update the target record…');
        result = await turbo.setCustodialArNSRecord({
          antId,
          undername: '@',
          transactionId: payload.transactionId,
          ttlSeconds: payload.ttlSeconds,
          ...signerParams,
        });
        break;
      }
      case ANT_INTERACTION_TYPES.SET_RECORD:
      case ANT_INTERACTION_TYPES.EDIT_RECORD: {
        setSigning('Paying with Turbo Credits to set the undername…');
        result = await turbo.setCustodialArNSRecord({
          antId,
          undername: lowerCaseDomain(payload.subDomain),
          transactionId: payload.transactionId,
          ttlSeconds: payload.ttlSeconds,
          ...signerParams,
        });
        break;
      }
      case ANT_INTERACTION_TYPES.REMOVE_RECORD: {
        setSigning('Paying with Turbo Credits to remove the undername…');
        result = await turbo.removeCustodialArNSRecord({
          antId,
          undername: lowerCaseDomain(payload.subDomain),
          ...signerParams,
        });
        break;
      }
      default:
        throw new Error(
          `Unsupported custodial record interaction: ${workflowName}`,
        );
    }
  } catch (error) {
    // Surface the typed custody errors with safe, non-leaky copy; never echo
    // another owner's name or raw chain internals.
    if (
      error instanceof CustodialANTNotFoundError ||
      error instanceof CustodyTransferUnauthorizedError
    ) {
      throw error;
    }
    throw error instanceof Error ? error : new Error(String(error));
  } finally {
    setSigning(undefined);
    dispatchTransactionState({ type: 'setSigning', payload: false });
  }

  const interaction: ContractInteraction = {
    deployer: owner,
    processId: antId,
    id: result.messageId,
    type: 'interaction',
    payload: { ...payload, custodial: true, custodialAntId: antId },
  };

  dispatchTransactionState({ type: 'setWorkflowName', payload: workflowName });
  dispatchTransactionState({
    type: 'setInteractionResult',
    payload: interaction,
  });
  return interaction;
}
