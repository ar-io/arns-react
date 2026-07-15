import { TokenType } from '@ardrive/turbo-sdk';
import { InjectedEthereumSigner } from '@dha-team/arbundles';
import { EthereumWalletError } from '@src/utils/errors';
import { hashMessage, parseEther, recoverPublicKey, toBytes } from 'viem';
import { mainnet } from 'viem/chains';
import { Config, Connector } from 'wagmi';
import {
  connect,
  disconnect,
  getAccount,
  sendTransaction,
  signMessage,
} from 'wagmi/actions';

import {
  AoAddress,
  ArNSWalletConnector,
  TransferTransactionResult,
  WALLET_TYPES,
} from '../../types';

/**
 * Ethereum identity connector (wagmi/viem + RainbowKit) restored from the
 * pre-Solana-only build (commit `3f43b85`) for the Model-A custodial credit-buy
 * path.
 *
 * `turboSigner` is an arbundles `InjectedEthereumSigner` driven by the wagmi
 * `signMessage` action, so it plugs straight into
 * `TurboFactory.authenticated({ token: 'ethereum', signer })` — the signer the
 * bundler verifies for the ArNS purchase nonce.
 *
 * NOTE: the ETH path is wired + compiles but is NOT live-validated in this PR —
 * the bundler's ETH request-auth fix is landing separately. Arweave is the
 * validated Model-A identity. The old AO `contractSigner` (client-side ANT
 * writes) is intentionally dropped: Model A never spawns an ANT client-side.
 */
export class EthWalletConnector implements ArNSWalletConnector {
  tokenType: TokenType = 'ethereum';
  turboSigner: InjectedEthereumSigner;
  connector: Connector;
  config: Config;

  constructor(config: Config, connector: Connector) {
    this.connector = connector;

    const provider = {
      getSigner: () => ({
        signMessage: async (message: any) => {
          const arg = message instanceof String ? message : { raw: message };

          const ethAccount = getAccount(config);

          return await signMessage(config, {
            message: arg as any,
            account: ethAccount.address,
            connector: this.connector,
          });
        },
      }),
    };
    const signer = new InjectedEthereumSigner(provider as any);

    this.turboSigner = signer;
    signer.setPublicKey = async () => {
      const message = 'Sign this message to connect to ArNS.app';
      const ethAccount = getAccount(config);

      const signature = await signMessage(config, {
        message: message,
        account: ethAccount.address,
        connector: this.connector,
      });
      const hash = await hashMessage(message);
      const recoveredKey = await recoverPublicKey({
        hash,
        signature,
      });
      signer.publicKey = Buffer.from(toBytes(recoveredKey));
    };

    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      localStorage.setItem('walletType', WALLET_TYPES.ETHEREUM);
      const isConnected = await this.connector.isAuthorized();
      if (isConnected) {
        return;
      }

      await connect(this.config, { connector: this.connector });
    } catch (error: unknown) {
      localStorage.removeItem('walletType');

      // Check for user rejection errors (common patterns across wallets)
      const errorMessage =
        error instanceof Error ? error.message.toLowerCase() : '';
      const isUserRejection =
        errorMessage.includes('user rejected') ||
        errorMessage.includes('user denied') ||
        errorMessage.includes('user cancelled') ||
        errorMessage.includes('rejected the request');

      if (isUserRejection) {
        throw new EthereumWalletError('User cancelled authentication.');
      }

      // For other errors, preserve the original message
      const message =
        error instanceof Error ? error.message : 'Connection failed';
      throw new EthereumWalletError(message);
    }
  }

  async disconnect(): Promise<void> {
    localStorage.removeItem('walletType');
    await disconnect(this.config, { connector: this.connector });
  }

  async getWalletAddress(): Promise<AoAddress> {
    const address = getAccount(this.config).address;
    if (!address) {
      throw new EthereumWalletError('No address found');
    }
    return address as unknown as AoAddress;
  }

  async submitNativeTransaction(
    amount: number,
    toAddress: string,
  ): Promise<TransferTransactionResult> {
    if (!toAddress.startsWith('0x')) {
      throw new Error('Invalid address');
    }

    // switch user to ETH mainnet if not already on it
    if (this.connector.chainId !== mainnet.id) {
      await this.connector?.switchChain?.({ chainId: mainnet.id });
    }

    try {
      const res = await sendTransaction(this.config, {
        account: (await this.getWalletAddress()) as `0x${string}`,
        to: toAddress as `0x${string}`,
        value: parseEther(amount.toString()),
        chainId: mainnet.id, // require that transaction is on ETH mainnet
      });

      return {
        hash: res,
        status: 'success',
      };
    } catch (error) {
      console.error('Transaction failed', error);
      throw error;
    }
  }
}
