import { AoSigner, ContractSigner } from '@ar.io/sdk/web';
import { MetamaskError } from '@src/utils/errors';
import { InjectedEthereumSigner, createData } from 'arbundles';
import { ApiConfig } from 'arweave/node/lib/api';
import { hashMessage, recoverPublicKey, toBytes } from 'viem';
import {
  Config,
  Connector,
  UseAccountReturnType,
  UseSignMessageReturnType,
} from 'wagmi';
import { DisconnectMutateAsync } from 'wagmi/query';

import {
  AoAddress,
  ArNSWalletConnector,
  EthAddress,
  WALLET_TYPES,
} from '../../types';

export class EthWalletConnector implements ArNSWalletConnector {
  ethAccount: UseAccountReturnType<Config>;
  contractSigner?: ContractSigner;
  address: EthAddress;
  disconnectCallback: DisconnectMutateAsync<unknown>;
  connector: Connector;

  constructor(
    ethAccount: UseAccountReturnType<Config>,
    address: EthAddress,
    disconnectAsync: DisconnectMutateAsync<unknown>,
    signMessage: UseSignMessageReturnType<unknown>,
    connector: Connector,
  ) {
    this.disconnectCallback = disconnectAsync;
    this.address = address;
    this.ethAccount = ethAccount;
    this.connector = connector;

    const provider = {
      getSigner: () => ({
        signMessage: async (message: any) => {
          const arg = message instanceof String ? message : { raw: message };

          return await signMessage.signMessageAsync({
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
      const signature = await signMessage.signMessageAsync({
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

    this.contractSigner = aoSigner;
  }

  async connect(): Promise<void> {
    try {
      localStorage.setItem('walletType', WALLET_TYPES.ETHEREUM);

      await this.connector.connect();
    } catch (error) {
      localStorage.removeItem('walletType');
      throw new MetamaskError('User cancelled authentication.');
    }
  }

  async disconnect(): Promise<void> {
    localStorage.removeItem('walletType');
    await this.disconnectCallback();
  }

  async getWalletAddress(): Promise<AoAddress> {
    return this.address;
  }

  async getGatewayConfig(): Promise<ApiConfig> {
    return {
      host: 'ar-io.dev',
      port: 443,
      protocol: 'https',
    };
  }
}
