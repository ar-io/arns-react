import { isArray } from 'lodash';

import {
  ArweaveTransactionID,
  ContractInteraction,
  TransactionCache,
} from '../../types';
import { jsonSerialize } from '../../utils';
import { PDNTContract } from '../arweave/PDNTContract';
import { LocalStorageCache } from './LocalStorageCache';

export class ContractInteractionCache
  extends LocalStorageCache
  implements TransactionCache
{
  constructor() {
    super();
  }
  getCachedNameTokens(address?: ArweaveTransactionID): PDNTContract[] {
    const cachedTokens = Object.entries(window.localStorage)
      .map(([contractTxId, interactions]) => {
        const parsedInteractions = jsonSerialize(interactions) ?? interactions;

        if (isArray(parsedInteractions)) {
          const deployment = parsedInteractions.find(
            (interaction) =>
              interaction.type === 'deploy' &&
              (address ? interaction.deployer === address.toString() : true),
          );

          if (!deployment) {
            return;
          }

          return new PDNTContract(
            JSON.parse(deployment.payload.initState),
            new ArweaveTransactionID(contractTxId),
          );
        }
      })
      .filter((contract) => contract !== undefined);

    return cachedTokens as PDNTContract[];
  }

  getCachedInteractions(
    contractTxId: ArweaveTransactionID,
  ): ContractInteraction[] {
    const cachedInteractions = this.get(contractTxId.toString());

    if (isArray(cachedInteractions)) {
      return cachedInteractions.filter(
        (interaction: ContractInteraction) =>
          interaction.type === 'interaction',
      );
    }
    return [];
  }
}
