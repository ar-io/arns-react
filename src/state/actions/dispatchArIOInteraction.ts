import {
  ANT,
  ANTRegistry,
  ANT_REGISTRY_ID,
  AOProcess,
  AoARIOWrite,
  AoClient,
  AoMessageResult,
  ContractSigner,
  DEFAULT_SCHEDULER_ID,
  FundFrom,
  createAoSigner,
  spawnANT,
} from '@ar.io/sdk/web';
import { TransactionAction } from '@src/state/reducers/TransactionReducer';
import {
  ARNS_INTERACTION_TYPES,
  AoAddress,
  ContractInteraction,
} from '@src/types';
import { createAntStateForOwner, lowerCaseDomain, sleep } from '@src/utils';
import { WRITE_OPTIONS } from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import { queryClient } from '@src/utils/network';
import { Dispatch } from 'react';

export default async function dispatchArIOInteraction({
  payload,
  workflowName,
  owner,
  arioContract,
  processId,
  dispatch,
  signer,
  ao,
  antAo,
  scheduler = DEFAULT_SCHEDULER_ID,
  fundFrom,
}: {
  payload: Record<string, any>;
  workflowName: ARNS_INTERACTION_TYPES;
  owner: AoAddress;
  arioContract?: AoARIOWrite;
  processId: string;
  dispatch: Dispatch<TransactionAction>;
  signer?: ContractSigner;
  ao?: AoClient;
  antAo?: AoClient;
  scheduler?: string;
  fundFrom?: FundFrom;
}): Promise<ContractInteraction> {
  let result: AoMessageResult | undefined = undefined;
  const aoCongestedTimeout = setTimeout(
    () => {
      eventEmitter.emit('network:ao:congested', true);
    }, // if it is taking longer than 10 seconds, consider the network congested
    1000 * 10,
  );
  try {
    if (!arioContract) throw new Error('ArIO provider is not defined');
    if (!signer) throw new Error('signer is not defined');
    dispatch({
      type: 'setSigning',
      payload: true,
    });
    switch (workflowName) {
      case ARNS_INTERACTION_TYPES.BUY_RECORD: {
        const { name, type, years } = payload;
        let antProcessId: string = payload.processId;

        if (antProcessId === 'atomic') {
          const state =
            payload.state ||
            createAntStateForOwner(
              owner.toString(),
              payload.targetId?.toString(),
            );
          antProcessId = await spawnANT({
            state,
            signer: createAoSigner(signer),
            ao: ao,
            scheduler: scheduler,
            module: payload.antModuleId,
          });
          const antRegistry = ANTRegistry.init({
            signer,
            process: new AOProcess({
              processId: ANT_REGISTRY_ID,
              ao,
            }),
          });
          let antRegistryUpdated = false;
          let retries = 0;
          const maxRetries = 10;
          // We need to wait for the registration to get cranked
          while (!antRegistryUpdated && retries <= maxRetries) {
            await sleep(2000 * retries);
            const aclRes = await antRegistry.accessControlList({
              address: owner.toString(),
            });

            const antIdSet = new Set([...aclRes.Controlled, ...aclRes.Owned]);
            antRegistryUpdated = antIdSet.has(antProcessId);
            retries++;
          }
          if (!antRegistryUpdated) {
            throw new Error('Failed to register ANT, please try again later.');
          }
        }

        const buyRecordResult = await arioContract.buyRecord({
          name: lowerCaseDomain(name),
          type,
          years,
          processId: antProcessId,
          fundFrom,
        });

        payload.processId = antProcessId;

        result = buyRecordResult;
        break;
      }
      case ARNS_INTERACTION_TYPES.EXTEND_LEASE:
        result = await arioContract.extendLease(
          {
            name: lowerCaseDomain(payload.name),
            years: payload.years,
            fundFrom,
          },
          WRITE_OPTIONS,
        );
        break;
      case ARNS_INTERACTION_TYPES.INCREASE_UNDERNAMES:
        result = await arioContract.increaseUndernameLimit(
          {
            name: lowerCaseDomain(payload.name),
            increaseCount: payload.qty,
            fundFrom,
          },
          WRITE_OPTIONS,
        );
        break;
      case ARNS_INTERACTION_TYPES.PRIMARY_NAME_REQUEST: {
        dispatch({
          type: 'setSigningMessage',
          payload: 'Confirming Primary Name 1/2',
        });
        const existingPrimaryNameRequest = await arioContract
          .getPrimaryNameRequest({
            initiator: owner.toString(),
          })
          .catch((e) => {
            console.error(e);
            return undefined;
          });

        if (
          !existingPrimaryNameRequest ||
          existingPrimaryNameRequest.name !== payload.name
        ) {
          await arioContract
            .requestPrimaryName({
              name: payload.name,
              fundFrom,
            })
            .catch((e) => {
              throw new Error('Unable to request Primary name: ' + e.message);
            });
        }
        // UX sleep between transactions
        await sleep(2000);

        const antProcess = ANT.init({
          signer,
          process: new AOProcess({
            ao: antAo,
            processId: payload.antProcessId,
          }),
        });

        dispatch({
          type: 'setSigningMessage',
          payload: 'Confirming Primary Name 2/2',
        });
        await sleep(2000);
        result = await antProcess.approvePrimaryNameRequest({
          name: payload.name,
          address: owner.toString(),
          arioProcessId: payload.arioProcessId,
        });

        break;
      }
      case ARNS_INTERACTION_TYPES.UPGRADE_NAME: {
        dispatch({
          type: 'setSigningMessage',
          payload: 'Upgrading Name to Permabuy',
        });
        result = await arioContract.upgradeRecord({
          name: payload.name,
          fundFrom,
        });
        break;
      }
      default:
        throw new Error(`Unsupported workflow name: ${workflowName}`);
    }
  } catch (error) {
    eventEmitter.emit('error', error);
  } finally {
    dispatch({
      type: 'setSigning',
      payload: false,
    });
    clearTimeout(aoCongestedTimeout);
    queryClient.invalidateQueries({
      queryKey: ['turbo-credit-balance'],
    });
  }
  if (!result) {
    throw new Error('Failed to dispatch ArIO interaction');
  }

  const interaction: ContractInteraction = {
    deployer: owner.toString(),
    processId: processId.toString(),
    id: result.id,
    type: 'interaction',
    payload,
  };

  dispatch({
    type: 'setWorkflowName',
    payload: workflowName,
  });
  dispatch({
    type: 'setInteractionResult',
    payload: interaction,
  });
  return interaction;
}
