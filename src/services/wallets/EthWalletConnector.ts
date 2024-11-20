import { AoSigner, ContractSigner } from '@ar.io/sdk/web';
import { MetamaskError } from '@src/utils/errors';
import { InjectedEthereumSigner, createData } from 'arbundles';
import { ApiConfig } from 'arweave/node/lib/api';
import { hashMessage, recoverPublicKey, toBytes } from 'viem';
import { Config, Connector } from 'wagmi';
import { connect, disconnect, getAccount, signMessage } from 'wagmi/actions';

import { AoAddress, ArNSWalletConnector, WALLET_TYPES } from '../../types';

export class EthWalletConnector implements ArNSWalletConnector {
  contractSigner?: ContractSigner;
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

    const aoSigner: AoSigner = async ({ data, tags, target }) => {
      if (!signer.publicKey) {
        await signer.setPublicKey();
      }
      const dataItem = createData(data, signer, {
        tags,
        target,
        anchor: Math.round(Date.now() / 1000)
          .toString()
          .padStart(32, Math.floor(Math.random() * 10).toString()),
      });

      const res = await dataItem.sign(signer).then(async () => ({
        id: dataItem.id,
        raw: dataItem.getRaw(),
      }));
      return res;
    };

    this.config = config;
    this.contractSigner = aoSigner;
  }

  async connect(): Promise<void> {
    try {
      localStorage.setItem('walletType', WALLET_TYPES.ETHEREUM);

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
}
