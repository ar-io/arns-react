import { ContractSigner } from '@ar.io/sdk/web';
import { ArweaveAppError } from '@src/utils/errors';
import { InjectedEthereumSigner } from 'arbundles';
import { PermissionType } from 'arconnect';
import { ApiConfig } from 'arweave/node/lib/api';
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

export const ARCONNECT_WALLET_PERMISSIONS: PermissionType[] = [
  'ACCESS_ADDRESS',
  'ACCESS_ALL_ADDRESSES',
  'ACCESS_PUBLIC_KEY',
  'SIGN_TRANSACTION',
  'ACCESS_ARWEAVE_CONFIG',
];

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
    this.contractSigner = signer;
  }

  async connect(): Promise<void> {
    // confirm they have the extension installed
    try {
      localStorage.setItem('walletType', WALLET_TYPES.ETHEREUM);

      // await this._wallet.connect({
      //   name: 'ARNS - ar.io',
      // });
    } catch (error) {
      localStorage.removeItem('walletType');
      throw new ArweaveAppError('User cancelled authentication.');
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
