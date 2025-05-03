import {
  AoSigner,
  ContractSigner,
  InjectedEthereumSigner,
  TurboArNSSigner,
} from '@ar.io/sdk/web';
import { TokenType } from '@ardrive/turbo-sdk';
import { createData } from '@dha-team/arbundles';
import { MetamaskError } from '@src/utils/errors';
import { ApiConfig } from 'arweave/node/lib/api';
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

import { AoAddress, ArNSWalletConnector, WALLET_TYPES } from '../../types';

export type TransferTransactionResult = {
  txid: string;
  explorerURL: string;
};

export class EthWalletConnector implements ArNSWalletConnector {
  tokenType: TokenType = 'ethereum';
  contractSigner?: ContractSigner;
  turboSigner: TurboArNSSigner;
  connector: Connector;
  config: Config;

  constructor(config: Config) {
    const connector = config.connectors.find((c) => c.name === 'MetaMask');

    if (!connector) {
      throw new MetamaskError('MetaMask connector not found.');
    }

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

    this.turboSigner = signer as any as TurboArNSSigner;
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

    // eslint-disable-next-line
    // @ts-ignore
    const aoSigner: AoSigner = async ({ data, tags, target }) => {
      if (!signer.publicKey) {
        await signer.setPublicKey();
      }
      const dataItem = createData(data as string, signer, {
        tags,
        target,
        anchor: Math.round(Date.now() / 1000)
          .toString()
          .padStart(32, Math.floor(Math.random() * 10).toString()),
      });

      const res = await dataItem.sign(signer).then(async () => ({
        id: dataItem.id,
        raw: dataItem.getRaw() as any,
      }));
      return res;
    };

    this.config = config;
    this.contractSigner = aoSigner;
  }

  async connect(): Promise<void> {
    try {
      localStorage.setItem('walletType', WALLET_TYPES.ETHEREUM);
      const isConnected = await this.connector.isAuthorized();
      if (isConnected) {
        return;
      }

      await connect(this.config, { connector: this.connector });
    } catch (error) {
      localStorage.removeItem('walletType');
      throw new MetamaskError('User cancelled authentication.');
    }
  }

  async disconnect(): Promise<void> {
    localStorage.removeItem('walletType');
    await disconnect(this.config, { connector: this.connector });
  }

  async getWalletAddress(): Promise<AoAddress> {
    const address = getAccount(this.config).address;
    if (!address) {
      throw new MetamaskError('No address found');
    }
    return address;
  }

  async getGatewayConfig(): Promise<ApiConfig> {
    return {
      host: 'ar-io.dev',
      port: 443,
      protocol: 'https',
    };
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
        txid: res,
        explorerURL: `https://etherscan.io/tx/${res}`,
      };
    } catch (error) {
      console.error('Transaction failed', error);
      throw error;
    }
  }
}
