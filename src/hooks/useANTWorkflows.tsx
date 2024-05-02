import {
  ANT,
  ANTWritable,
  ANT_CONTRACT_FUNCTIONS,
  ArconnectSigner,
} from '@ar.io/sdk/web';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { DEFAULT_ARWEAVE } from '@src/utils/constants';

export interface WorkflowProvider {
  interactionProvider: ANTWritable;
  handleWorkflow(params: {
    workflowName: string; // name of the workflow
    args: Record<string, unknown>;
  }): Promise<void>;
}

export default function useANTWorkflows({ id }: { id: ArweaveTransactionID }): {
  workflowProvider: WorkflowProvider;
} {
  const handle = async ({
    provider,
    workflowName,
    args,
  }: {
    provider: ANTWritable;
    workflowName: keyof typeof ANT_CONTRACT_FUNCTIONS;
    args: Record<string, unknown>;
  }) => {
    switch (workflowName) {
      case 'TRANSFER':
        await provider.transfer({
          ...(args as any),
        });
        break;
      default:
        throw new Error('Invalid workflow');
    }
  };

  return {
    workflowProvider: {
      interactionProvider: ANT.init({
        contractTxId: id.toString(),
        signer: new ArconnectSigner(
          window.arweaveWallet,
          DEFAULT_ARWEAVE as any,
        ),
      }),
      async handleWorkflow(params: {
        workflowName: keyof typeof ANT_CONTRACT_FUNCTIONS;
        args: Record<string, unknown>;
      }) {
        return handle({
          provider: this.interactionProvider,
          ...params,
        });
      },
    },
  };
}
