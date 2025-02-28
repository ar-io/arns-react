import {
  ANT,
  AOS_MODULE_ID as ANT_MODULE_ID,
  AOProcess,
  ARIO,
  AoClient,
  AoMessageResult,
  ContractSigner,
  createAoSigner,
  spawnANT,
} from '@ar.io/sdk/web';
import { TransactionAction } from '@src/state/reducers/TransactionReducer';
import { ANT_INTERACTION_TYPES, ContractInteraction } from '@src/types';
import { lowerCaseDomain, sleep } from '@src/utils';
import eventEmitter from '@src/utils/events';
import { queryClient } from '@src/utils/network';
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
  // this can allow for waiting on promise resolution for UI input on individual steps
  stepCallback = async (step) => {
    if (typeof step === 'string') {
      dispatchTransactionState({
        type: 'setSigningMessage',
        payload: step,
      });
    }
  },
}: {
  payload: Record<string, any>;
  workflowName: ANT_INTERACTION_TYPES;
  signer: ContractSigner;
  owner: string;
  processId: string;
  dispatchTransactionState: Dispatch<TransactionAction>;
  dispatchArNSState: Dispatch<ArNSAction>;
  ao: AoClient;
  stepCallback?: (step?: Record<string, string> | string) => Promise<void>;
}): Promise<ContractInteraction> {
  let result: AoMessageResult | undefined = undefined;
  const aoCongestedTimeout = setTimeout(
    () => {
      eventEmitter.emit('network:ao:congested', true);
    }, // if it is taking longer than 10 seconds, consider the network congested
    1000 * 10,
  );
  const antProcess = ANT.init({
    process: new AOProcess({ processId, ao }),
    signer,
  });

  try {
    if (!antProcess) throw new Error('ANT provider is not defined');

    switch (workflowName) {
      case ANT_INTERACTION_TYPES.SET_NAME:
        stepCallback('Setting Name, please wait...');
        result = await antProcess.setName({ name: payload.name });
        break;
      case ANT_INTERACTION_TYPES.SET_TARGET_ID:
        stepCallback('Setting Target ID, please wait...');
        result = await antProcess.setRecord({
          undername: '@',
          transactionId: payload.transactionId,
          ttlSeconds: payload.ttlSeconds,
        });
        break;
      case ANT_INTERACTION_TYPES.SET_TTL_SECONDS:
        stepCallback('Setting TTL Seconds, please wait...');
        result = await antProcess.setRecord({
          undername: '@',
          transactionId: payload.transactionId,
          ttlSeconds: payload.ttlSeconds,
        });
        break;
      case ANT_INTERACTION_TYPES.SET_TICKER:
        stepCallback('Setting Ticker, please wait...');
        result = await antProcess.setTicker({ ticker: payload.ticker });
        break;
      case ANT_INTERACTION_TYPES.SET_CONTROLLER:
        stepCallback('Setting Controller, please wait...');
        result = await antProcess.addController({
          controller: payload.controller,
        });
        break;
      case ANT_INTERACTION_TYPES.REMOVE_CONTROLLER:
        stepCallback('Removing Controller, please wait...');
        result = await antProcess.removeController({
          controller: payload.controller,
        });
        break;
      case ANT_INTERACTION_TYPES.TRANSFER:
        stepCallback('Transferring Ownership, please wait...');
        if (payload.arnsDomain && payload.arioProcessId) {
          stepCallback('Clearing Primary Names associated with ANT...');
          await antProcess
            .removePrimaryNames({
              names: [payload.arnsDomain],
              arioProcessId: payload.arioProcessId,
            })
            .catch((e) => eventEmitter.emit('error', e));
          queryClient.resetQueries({ queryKey: ['primary-name'] });
        }
        result = await antProcess.transfer({ target: payload.target });

        break;
      case ANT_INTERACTION_TYPES.SET_RECORD:
        stepCallback('Setting Undername, please wait...');
        result = await antProcess.setRecord({
          undername: lowerCaseDomain(payload.subDomain),
          transactionId: payload.transactionId,
          ttlSeconds: payload.ttlSeconds,
        });
        break;
      case ANT_INTERACTION_TYPES.EDIT_RECORD:
        stepCallback('Editing Undername, please wait...');
        result = await antProcess.setRecord({
          undername: lowerCaseDomain(payload.subDomain),
          transactionId: payload.transactionId,
          ttlSeconds: payload.ttlSeconds,
        });
        break;
      case ANT_INTERACTION_TYPES.REMOVE_RECORD:
        stepCallback('Removing Undername, please wait...');
        result = await antProcess.removeRecord({
          undername: lowerCaseDomain(payload.subDomain),
        });
        break;

      case ANT_INTERACTION_TYPES.RELEASE_NAME: {
        stepCallback('Releasing ArNS Name, please wait...');
        const arioContract = ARIO.init({ processId: payload.arioProcessId });

        result = await antProcess.releaseName({
          name: payload.name,
          arioProcessId: payload.arioProcessId,
        });
        stepCallback('Verifying Release, please wait...');
        const released = await arioContract
          .getArNSRecord({ name: payload.name })
          .catch((e: Error) => e);

        if (released instanceof Error) {
          throw new Error('Failed to release ArNS Name: ' + released.message);
        }
        break;
      }
      case ANT_INTERACTION_TYPES.REASSIGN_NAME: {
        let newAntProcessId = payload.newAntProcessId;
        if (!newAntProcessId) {
          stepCallback('Spawning new ANT, please wait... 1/2');
          newAntProcessId = await spawnANT({
            ao,
            signer: createAoSigner(signer),
            state: payload.previousState,
            luaCodeTxId: payload.luaCodeTxId,
          });
        }
        stepCallback(
          'Reassigning ArNS name, please wait... ' +
            (payload.newAntProcessId ? '' : '2/2'),
        );
        // for UX so the user sees the signing message
        await sleep(2000);
        result = await antProcess.reassignName({
          name: payload.name,
          arioProcessId: payload.arioProcessId,
          antProcessId: newAntProcessId,
        });
        break;
      }
      case ANT_INTERACTION_TYPES.SET_LOGO:
        stepCallback('Setting Logo, please wait...');
        result = await antProcess.setLogo({
          txId: payload.logo,
        });
        break;
      case ANT_INTERACTION_TYPES.SET_DESCRIPTION:
        stepCallback('Setting Description, please wait...');
        result = await antProcess.setDescription({
          description: payload.description,
        });
        break;
      case ANT_INTERACTION_TYPES.SET_KEYWORDS:
        stepCallback('Setting Keywords, please wait...');
        result = await antProcess.setKeywords({
          keywords: payload.keywords,
        });
        break;
      case ANT_INTERACTION_TYPES.APPROVE_PRIMARY_NAME:
        stepCallback('Approving Primary Name request, please wait...');
        result = await antProcess.approvePrimaryNameRequest({
          name: payload.name,
          address: owner.toString(),
          arioProcessId: payload.arioProcessId,
        });
        break;
      case ANT_INTERACTION_TYPES.REMOVE_PRIMARY_NAMES:
        stepCallback('Removing Primary Name, please wait...');

        result = await antProcess.removePrimaryNames({
          names: payload.names,
          arioProcessId: payload.arioProcessId,
        });
        break;

      case ANT_INTERACTION_TYPES.UPGRADE_ANT: {
        stepCallback('Upgrading ANT, please wait...');
        const state = payload.state;
        // spawn new ANT with previous state
        const newAntId = await spawnANT({
          signer: createAoSigner(signer),
          module: ANT_MODULE_ID,
          ao,
          state,
          stateContractTxId: processId,
        });
        stepCallback('Validating state migration...');
        // validate new ANT is a valid ANT
        const newAnt = ANT.init({
          process: new AOProcess({
            processId: newAntId,
            ao,
          }),
          signer,
        });
        await sleep(3000); // allow some time for the spawn to propagate
        // This will verify that the ANT is compatible with the ANT registry, so even if other features don't work, its fixable and will appear in the assets
        const newAntState = await newAnt
          .getState({ strict: true })
          .catch((e) => {
            throw new Error('State migration unsuccessful: ', e.message);
          });
        // reassign name to new ant
        stepCallback('Reassigning ArNS Name...');
        const reassignRes = await antProcess.reassignName({
          name: payload.name,
          arioProcessId: payload.arioProcessId,
          antProcessId: newAntId,
        });
        // verify outputs
        const ario = ARIO.init({
          process: new AOProcess({
            processId: payload.arioProcessId,
            ao,
          }),
        });
        // poll for update on registry to update record
        let record = undefined;
        let retries = 0;
        const maxRetries = 10;
        while (record?.processId !== newAntId && retries < maxRetries) {
          await sleep(5000);
          record = await ario
            .getArNSRecord({ name: payload.name })
            .catch((e) => {
              console.error(e);
            });
          retries++;
        }

        if (record?.processId !== newAntId)
          throw new Error(`Failed to reassign name to upgraded ANT process`);
        // finally, set result as the reassignment result
        result = reassignRes;
        // handle state mutations
        queryClient.resetQueries({ queryKey: ['domainInfo', payload.name] });
        // overwrite the existing domain with the updated record (only the process id should have changed)
        dispatchArNSState({
          type: 'addDomains',
          payload: { [payload.name]: record },
        });
        // add the new ANT to the state
        dispatchArNSState({
          type: 'addAnts',
          payload: {
            [newAntId]: {
              state: newAntState,
              handlers: null,
              processMeta: null,
            },
          },
        });

        break;
      }
      default:
        throw new Error(`Unsupported workflow name: ${workflowName}`);
    }
  } catch (error) {
    eventEmitter.emit('error', error);
  } finally {
    stepCallback(undefined);
    clearTimeout(aoCongestedTimeout);
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
