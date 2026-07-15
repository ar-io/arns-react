import { ANT } from '@ar.io/sdk/web';
import {
  ArNSSettlementStatus,
  TurboArNSClient,
  TurboArNSIntent,
} from '@src/services/turbo/TurboArNSClient';
import {
  clearPendingArNSPurchase,
  getPendingArNSPurchase,
  savePendingArNSPurchase,
} from '@src/services/turbo/arnsPurchaseResume';
import { resolveCustodyStrategy } from '@src/services/turbo/custodyStrategy';
import { TransactionAction } from '@src/state/reducers/TransactionReducer';
import {
  ARNS_INTERACTION_TYPES,
  AoAddress,
  ArNSWalletConnector,
  ContractInteraction,
} from '@src/types';
import { lowerCaseDomain } from '@src/utils';
import {
  getActiveSolanaConfig,
  getSolanaRpc,
  getSolanaRpcSubscriptions,
} from '@src/utils/solana';
import { createAntStateForOwner } from '@src/utils/transactionUtils/transactionUtils';
import { Dispatch } from 'react';

/**
 * Settle an ArNS purchase (buy / extend / increase-undernames / upgrade) by
 * debiting the connected wallet's **Turbo Credits** through the bundler
 * payment-service, then poll to a terminal state and drive the transaction
 * state's `interactionResult`.
 *
 * This is the credits counterpart to `dispatchArIOInteraction` (which pays ARIO
 * from the wallet). It intentionally does NOT call
 * `@ar.io/sdk buyRecord({ fundFrom: 'turbo' })` — that alias never debits
 * credits. Credit debit + on-chain write happen server-side; here we spawn the
 * user-owned ANT (Model B) and pass its `processId` to the bundler.
 */
export default async function dispatchArNSPurchaseWithCredits({
  turbo,
  workflowName,
  intent,
  payload,
  owner,
  wallet,
  paidBy,
  dispatch,
}: {
  turbo: TurboArNSClient;
  workflowName: ARNS_INTERACTION_TYPES;
  intent: TurboArNSIntent;
  payload: Record<string, any>;
  owner: AoAddress;
  wallet?: ArNSWalletConnector;
  paidBy?: string[];
  dispatch: Dispatch<TransactionAction>;
}): Promise<ContractInteraction> {
  const name: string = payload.name;
  const lowered = lowerCaseDomain(name);

  // Model B (Solana) requires a connected wallet + signer to spawn the ANT and
  // sign the request nonce the bundler verifies.
  if (wallet?.tokenType !== 'solana' || !wallet.solanaSigner) {
    throw new Error(
      'A connected Solana wallet with a signer is required to pay with Turbo Credits.',
    );
  }

  const strategy = resolveCustodyStrategy(wallet.tokenType);
  if (strategy.isStub) {
    // Model A (Arweave / ETH / keyless) — designed, not yet built. Fail loudly.
    throw new Error(
      `Paying with credits for ${wallet.tokenType} wallets is not available yet. ` +
        'Connect a Solana wallet to pay with Turbo Credits.',
    );
  }

  const walletAdapter =
    (typeof window !== 'undefined' ? (window as any).solana : undefined) ??
    (wallet as any).solanaWallet;

  const onStatus = (status: ArNSSettlementStatus) => {
    switch (status.phase) {
      case 'submitting':
        dispatch({
          type: 'setSigningMessage',
          payload: `Paying with Turbo Credits for '${name}'`,
        });
        break;
      case 'resumed':
      case 'submitted':
        dispatch({
          type: 'setSigningMessage',
          payload: `Confirming purchase of '${name}' on-chain`,
        });
        break;
      case 'polling':
        dispatch({
          type: 'setSigningMessage',
          payload: `Waiting for '${name}' to settle on-chain`,
        });
        break;
      case 'success':
        dispatch({
          type: 'setSigningMessage',
          payload: `Successfully purchased '${name}'`,
        });
        break;
    }
  };

  try {
    dispatch({ type: 'setSigning', payload: true });

    // Resume a purchase already in flight for this name (e.g. after a reload):
    // poll the existing nonce instead of re-submitting (no double debit).
    const pending = getPendingArNSPurchase();
    const resumeNonce =
      pending &&
      pending.owner === owner.toString() &&
      lowerCaseDomain(pending.name) === lowered &&
      pending.intent === intent
        ? pending.nonce
        : undefined;

    // Model B: ensure the user owns the ANT the name will resolve to. For a new
    // buy without a supplied ANT, spawn one client-side with the user's signer.
    let processId: string | undefined = payload.processId;
    if (
      !resumeNonce &&
      strategy.requiresClientAntSpawn &&
      intent === 'Buy-Name' &&
      !processId
    ) {
      dispatch({
        type: 'setSigningMessage',
        payload: `Spawning new ANT for new ArNS name '${name}'`,
      });
      const { programIds } = getActiveSolanaConfig();
      const spawnResult = await ANT.spawn({
        rpc: getSolanaRpc(),
        rpcSubscriptions: getSolanaRpcSubscriptions(),
        signer: wallet.solanaSigner,
        antProgramId: programIds.antProgramId,
        state: {
          ...createAntStateForOwner(owner.toString(), payload.targetId),
          name,
        },
      });
      processId = spawnResult.processId;
      payload.processId = processId;
    }

    const result = await turbo.executeArNSIntent({
      intent,
      name: lowered,
      type: payload.type,
      years: payload.years,
      increaseQty: payload.qty,
      processId,
      paidBy,
      walletAdapter,
      resumeNonce,
      onStatus: (status) => {
        // Persist the nonce the instant it exists so a reload can resume.
        if (
          (status.phase === 'submitted' || status.phase === 'resumed') &&
          status.nonce
        ) {
          savePendingArNSPurchase({
            nonce: status.nonce,
            intent,
            name,
            owner: owner.toString(),
            savedAt: Date.now(),
          });
        }
        onStatus(status);
      },
    });

    clearPendingArNSPurchase();

    const interaction: ContractInteraction = {
      deployer: owner.toString(),
      processId: (processId ?? '').toString(),
      id: result.messageId,
      type: 'interaction',
      payload,
    };

    dispatch({ type: 'setWorkflowName', payload: workflowName });
    dispatch({ type: 'setInteractionResult', payload: interaction });
    return interaction;
  } finally {
    dispatch({ type: 'setSigning', payload: false });
  }
}
