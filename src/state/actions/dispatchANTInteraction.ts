import {
  ANT,
  AOProcess,
  ARIO,
  AoANTState,
  AoArNSNameData,
  AoClient,
  AoMessageResult,
  ContractSigner,
  UpgradeAntProgressEvent,
  createAoSigner,
} from '@ar.io/sdk/web';
import { buildArNSRecordQuery } from '@src/hooks/useArNSRecord';
import { TransactionAction } from '@src/state/reducers/TransactionReducer';
import { ANT_INTERACTION_TYPES, ContractInteraction } from '@src/types';
import { lowerCaseDomain, sleep } from '@src/utils';
import { WRITE_OPTIONS } from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import {
  buildAntStateQuery,
  buildAntVersionQuery,
  queryClient,
} from '@src/utils/network';
import { Dispatch } from 'react';

import { ArNSAction } from '../reducers';

export default async function dispatchANTInteraction({
  payload,
  workflowName,
  processId,
  signer,
  owner,
  dispatchTransactionState,
  dispatchArNSState,
  ao,
  hyperbeamUrl,
  antRegistryProcessId,
  // this can allow for waiting on promise resolution for UI input on individual steps
  stepCallback,
}: {
  // TODO: this should be typed with specific ANT payloads vs. open ended, it's impossible to understand what is expected or exists here
  payload: Record<string, any>;
  workflowName: ANT_INTERACTION_TYPES;
  signer: ContractSigner;
  owner: string;
  processId: string;
  antRegistryProcessId: string;
  dispatchTransactionState: Dispatch<TransactionAction>;
  dispatchArNSState: Dispatch<ArNSAction>;
  ao: AoClient;
  hyperbeamUrl?: string;
  stepCallback?: (step?: Record<string, string> | string) => Promise<void>;
}): Promise<ContractInteraction> {
  stepCallback ??= async (step) => {
    if (!step || typeof step === 'string') {
      dispatchTransactionState({
        type: 'setSigningMessage',
        payload: step,
      });
    }
  };

  let result: AoMessageResult | undefined = undefined;
  const antProcess = ANT.init({
    hyperbeamUrl,
    process: new AOProcess({ processId, ao }),
    signer,
  });

  try {
    if (!antProcess) throw new Error('ANT provider is not defined');

    switch (workflowName) {
      case ANT_INTERACTION_TYPES.SET_NAME:
        await stepCallback('Setting Name, please wait...');
        result = await antProcess.setName(
          {
            name: payload.name,
          },
          WRITE_OPTIONS,
        );
        break;
      case ANT_INTERACTION_TYPES.SET_TARGET_ID:
        await stepCallback('Setting Target ID, please wait...');
        result = await antProcess.setRecord(
          {
            undername: '@',
            transactionId: payload.transactionId,
            ttlSeconds: payload.ttlSeconds,
          },
          WRITE_OPTIONS,
        );
        break;
      case ANT_INTERACTION_TYPES.SET_TTL_SECONDS:
        await stepCallback('Setting TTL Seconds, please wait...');
        result = await antProcess.setRecord(
          {
            undername: '@',
            transactionId: payload.transactionId,
            ttlSeconds: payload.ttlSeconds,
          },
          WRITE_OPTIONS,
        );
        break;
      case ANT_INTERACTION_TYPES.SET_TICKER:
        await stepCallback('Setting Ticker, please wait...');
        result = await antProcess.setTicker(
          { ticker: payload.ticker },
          WRITE_OPTIONS,
        );
        break;
      case ANT_INTERACTION_TYPES.SET_CONTROLLER:
        await stepCallback('Setting Controller, please wait...');
        result = await antProcess.addController(
          {
            controller: payload.controller,
          },
          WRITE_OPTIONS,
        );
        break;
      case ANT_INTERACTION_TYPES.REMOVE_CONTROLLER:
        await stepCallback('Removing Controller, please wait...');
        result = await antProcess.removeController(
          {
            controller: payload.controller,
          },
          WRITE_OPTIONS,
        );
        break;
      case ANT_INTERACTION_TYPES.TRANSFER:
        await stepCallback('Transferring Ownership, please wait...');
        if (payload.arnsDomain && payload.arioProcessId) {
          await stepCallback('Clearing Primary Names associated with ANT...');
          await antProcess
            .removePrimaryNames(
              {
                names: [payload.arnsDomain],
                arioProcessId: payload.arioProcessId,
              },
              WRITE_OPTIONS,
            )
            .catch((e) => eventEmitter.emit('error', e));
          queryClient.resetQueries({ queryKey: ['primary-name'] });
        }
        result = await antProcess.transfer(
          { target: payload.target },
          WRITE_OPTIONS,
        );

        break;
      case ANT_INTERACTION_TYPES.SET_RECORD:
        await stepCallback('Setting Undername, please wait...');
        result = await antProcess.setRecord(
          {
            undername: lowerCaseDomain(payload.subDomain),
            transactionId: payload.transactionId,
            ttlSeconds: payload.ttlSeconds,
          },
          WRITE_OPTIONS,
        );
        break;
      case ANT_INTERACTION_TYPES.EDIT_RECORD:
        await stepCallback('Editing Undername, please wait...');
        result = await antProcess.setRecord(
          {
            undername: lowerCaseDomain(payload.subDomain),
            transactionId: payload.transactionId,
            ttlSeconds: payload.ttlSeconds,
          },
          WRITE_OPTIONS,
        );
        break;
      case ANT_INTERACTION_TYPES.REMOVE_RECORD:
        await stepCallback('Removing Undername, please wait...');
        result = await antProcess.removeRecord(
          {
            undername: lowerCaseDomain(payload.subDomain),
          },
          WRITE_OPTIONS,
        );
        break;

      case ANT_INTERACTION_TYPES.RELEASE_NAME: {
        await stepCallback('Releasing ArNS Name, please wait...');
        const arioContract = ARIO.init({
          process: new AOProcess({
            processId: payload.arioProcessId,
            ao,
          }),
          hyperbeamUrl,
        });

        result = await antProcess.releaseName(
          {
            name: payload.name,
            arioProcessId: payload.arioProcessId,
          },
          WRITE_OPTIONS,
        );
        await stepCallback('Verifying Release, please wait...');
        const released = await arioContract
          .getArNSRecord({ name: payload.name })
          .catch((e: Error) => e);

        if (released instanceof Error) {
          throw new Error('Failed to release ArNS Name: ' + released.message);
        }
        break;
      }
      case ANT_INTERACTION_TYPES.REASSIGN_NAME: {
        // TODO: use native upgrade + reassign flow from ar-io-sdk when it is available
        let newAntProcessId = payload.newAntProcessId;
        if (!newAntProcessId) {
          await stepCallback('Spawning new ANT, please wait... 1/2');
          newAntProcessId = await ANT.spawn({
            ao,
            signer: createAoSigner(signer),
            state: payload.previousState,
            luaCodeTxId: payload.luaCodeTxId,
            module: payload.antModuleId,
            hyperbeamUrl,
          });
        }
        await stepCallback(
          'Reassigning ArNS name, please wait... ' +
            (payload.newAntProcessId ? '' : '2/2'),
        );
        // for UX so the user sees the signing message
        await sleep(2000);
        result = await antProcess.reassignName(
          {
            name: payload.name,
            arioProcessId: payload.arioProcessId,
            antProcessId: newAntProcessId,
          },
          WRITE_OPTIONS,
        );
        break;
      }
      case ANT_INTERACTION_TYPES.SET_LOGO:
        await stepCallback('Setting Logo, please wait...');
        result = await antProcess.setLogo(
          {
            txId: payload.logo,
          },
          WRITE_OPTIONS,
        );
        break;
      case ANT_INTERACTION_TYPES.SET_DESCRIPTION:
        await stepCallback('Setting Description, please wait...');
        result = await antProcess.setDescription(
          {
            description: payload.description,
          },
          WRITE_OPTIONS,
        );
        break;
      case ANT_INTERACTION_TYPES.SET_KEYWORDS:
        await stepCallback('Setting Keywords, please wait...');
        result = await antProcess.setKeywords(
          {
            keywords: payload.keywords,
          },
          WRITE_OPTIONS,
        );
        break;
      case ANT_INTERACTION_TYPES.APPROVE_PRIMARY_NAME:
        await stepCallback('Approving Primary Name request, please wait...');
        result = await antProcess.approvePrimaryNameRequest(
          {
            name: payload.name,
            address: owner.toString(),
            arioProcessId: payload.arioProcessId,
          },
          WRITE_OPTIONS,
        );
        break;
      case ANT_INTERACTION_TYPES.REMOVE_PRIMARY_NAMES:
        await stepCallback('Removing Primary Name, please wait...');

        result = await antProcess.removePrimaryNames(
          {
            names: payload.names,
            arioProcessId: payload.arioProcessId,
          },
          WRITE_OPTIONS,
        );
        break;

      case ANT_INTERACTION_TYPES.UPGRADE_ANT: {
        console.log('UPGRADE_ANT', antProcess);
        /**
         * For now, we will reassign just the single name, but in the future we will reassign all names affiliated with the process id
         * using reassignAllAffiliatedNames = true on this call.
         */
        const nameReassignment = await antProcess.upgrade({
          names: [payload.name],
          arioProcessId: payload.arioProcessId,
          antRegistryId: antRegistryProcessId,
          onSigningProgress: (
            step: keyof UpgradeAntProgressEvent,
            stepPayload: UpgradeAntProgressEvent[keyof UpgradeAntProgressEvent],
          ) => {
            if (step === 'fetching-affiliated-names') {
              stepCallback?.('Fetching affiliated names');
            } else if (step === 'checking-version') {
              stepCallback?.('Checking version of existing ANT');
            } else if (step === 'spawning-ant') {
              stepCallback?.('Spawning new ANT with latest version');
            } else if (step === 'verifying-state') {
              stepCallback?.('Validating state of new ANT');
            } else if (step === 'registering-ant') {
              stepCallback?.('Registering new ANT to the registry');
            } else if (step === 'reassigning-name') {
              const reassigningNamePayload =
                stepPayload as UpgradeAntProgressEvent['reassigning-name'];
              stepCallback?.(`Reassigning name ${reassigningNamePayload.name}`);
            }
          },
        });

        result = { id: nameReassignment.forkedProcessId };

        // invalidate all the queries for the names, processId, and forkedProcessId
        await Promise.all(
          [
            ...Object.keys(nameReassignment.reassignedNames),
            nameReassignment.forkedProcessId,
            processId,
          ].map((name) =>
            queryClient.invalidateQueries({
              predicate: ({ queryKey }) => queryKey.includes(name),
              refetchType: 'all',
            }),
          ),
        );

        /**
         * Just some thoughts about this pattern:
         *
         * We are storing ant metadata and domain information in global state, while also trying to leverage tanstack query to efficiently cache, expire and keep it in sync.
         *
         * Ensuring the actual data and the cached data are in sync is brutal to understand and maintain, and a pattern we should move away from.
         *
         * To do so, we should look into leveraging `useMutation` for each interaction to properly send messages, handle retries and callback on success or failure
         * and remove storing any state related to ArNS (records AND ants) in global state entirely. Let tanstack manage the caching of those values, and use all components that require it should
         * leverage the `useQuery` hook to fetch the data they need.
         *
         */

        const [record, newAntState, newAntVersion] = await Promise.all([
          queryClient.fetchQuery<AoArNSNameData>(
            buildArNSRecordQuery({
              name: payload.name,
              arioContract: ARIO.init({
                process: new AOProcess({
                  processId: payload.arioProcessId,
                  ao,
                }),
                hyperbeamUrl,
              }),
            }),
          ),
          queryClient.fetchQuery<AoANTState>(
            buildAntStateQuery({
              processId: nameReassignment.forkedProcessId,
              ao: ao,
              hyperbeamUrl,
            }),
          ),
          queryClient.fetchQuery(
            buildAntVersionQuery({
              processId: nameReassignment.forkedProcessId,
              ao: ao,
              hyperbeamUrl,
              antRegistryId: antRegistryProcessId,
            }),
          ),
        ]);
        // override the old domain with the new one in global state
        dispatchArNSState({
          type: 'addDomains',
          payload: { [payload.name]: record },
        });

        // override the old ant with the new one in global state
        dispatchArNSState({
          type: 'addAnts',
          payload: {
            [nameReassignment.forkedProcessId]: {
              state: newAntState,
              version: parseInt(newAntVersion),
              processMeta: null, // TODO: remove this once we have a better way to handle this
            },
          },
        });

        // remove the old ant from global state - again this is brutal
        dispatchArNSState({
          type: 'removeAnts',
          payload: [processId],
        });

        break;
      }
      default:
        throw new Error(`Unsupported workflow name: ${workflowName}`);
    }
  } catch (error) {
    eventEmitter.emit('error', error);
  } finally {
    await stepCallback(undefined);
  }
  if (!result) {
    throw new Error('Failed to dispatch ANT interaction');
  }

  const interaction: ContractInteraction = {
    deployer: owner,
    processId: processId.toString(),
    id: result.id,
    type: 'interaction',
    payload,
  };

  dispatchTransactionState({
    type: 'setWorkflowName',
    payload: workflowName,
  });
  dispatchTransactionState({
    type: 'setInteractionResult',
    payload: interaction,
  });
  return interaction;
}
