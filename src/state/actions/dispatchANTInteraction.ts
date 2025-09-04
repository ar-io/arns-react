import {
  ANT,
  AOProcess,
  ARIO,
  AoClient,
  AoMessageResult,
  ContractSigner,
  UpgradeAntProgressEvent,
  createAoSigner,
} from '@ar.io/sdk/web';
import { TransactionAction } from '@src/state/reducers/TransactionReducer';
import { ANT_INTERACTION_TYPES, ContractInteraction } from '@src/types';
import { lowerCaseDomain, sleep } from '@src/utils';
import { WRITE_OPTIONS } from '@src/utils/constants';
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
        const arioContract = ARIO.init({ processId: payload.arioProcessId });

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
              stepCallback('Fetching affiliated names');
            } else if (step === 'checking-version') {
              stepCallback('Checking version of existing ANT');
            } else if (step === 'spawning-ant') {
              stepCallback('Spawning new ANT with latest version');
            } else if (step === 'verifying-state') {
              stepCallback('Validating state of new ANT');
            } else if (step === 'registering-ant') {
              stepCallback('Registering new ANT to the registry');
            } else if (step === 'reassigning-name') {
              const reassigningNamePayload =
                stepPayload as UpgradeAntProgressEvent['reassigning-name'];
              stepCallback(`Reassigning name ${reassigningNamePayload.name}`);
            }
          },
        });

        result = { id: nameReassignment.forkedProcessId };

        // invalidate all the domainInfo queries for the reassigned names
        await Promise.all(
          nameReassignment.reassignedNames.map((name) =>
            queryClient.invalidateQueries({
              predicate: ({ queryKey }) =>
                queryKey.includes('domainInfo') && queryKey[1] === name,
              exact: false,
            }),
          ),
        );
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
