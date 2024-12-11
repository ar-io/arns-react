import WarningCard from '@src/components/cards/WarningCard/WarningCard';
import ValidationInput from '@src/components/inputs/text/ValidationInput/ValidationInput';
import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import {
  dispatchArNSUpdate,
  useArNSState,
  useGlobalState,
  useTransactionState,
  useWalletState,
} from '@src/state';
import dispatchANTInteraction from '@src/state/actions/dispatchANTInteraction';
import { ANT_INTERACTION_TYPES, VALIDATION_INPUT_TYPES } from '@src/types';
import { isArweaveTransactionID } from '@src/utils';
import eventEmitter from '@src/utils/events';
import { useQueryClient } from '@tanstack/react-query';
import { TriangleAlert, XIcon } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DialogModal from '../../DialogModal/DialogModal';

enum REASSIGN_NAME_WORKFLOWS {
  EXISTING = 'Use Existing ANT',
  NEW = 'Create new ANT',
  NEW_BLANK = 'New with blank slate configuration.',
  NEW_EXISTING = 'New with existing configuration.',
}

export function ReassignNameModal({
  show,
  setShow,
  processId,
  name,
}: {
  show: boolean;
  setShow: (b: boolean) => void;
  processId: string;
  name: string;
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [{ arioProcessId }] = useGlobalState();
  const [{ arnsEmitter }, dispatchArNSState] = useArNSState();
  const [{ signing }, dispatchTransactionState] = useTransactionState();
  const [{ wallet, walletAddress }] = useWalletState();

  const [workflow, setWorkflow] = useState<REASSIGN_NAME_WORKFLOWS | undefined>(
    undefined,
  );
  const [toAddress, setToAddress] = useState<string>('');
  const [isValidAddress, setIsValidAddress] = useState<boolean>();

  function handleClose() {
    setToAddress('');
    setIsValidAddress(undefined);
    setShow(false);
  }

  async function handleReassign() {
    try {
      if (!wallet?.contractSigner) {
        throw new Error('No ArConnect Signer found');
      }
      if (!walletAddress)
        throw new Error('Must connect to reassign the domain');

      const result = await dispatchANTInteraction({
        signer: wallet.contractSigner,
        payload: {
          name,
          arioProcessId,
        },
        processId,
        workflowName: ANT_INTERACTION_TYPES.REASSIGN_NAME,
        dispatch: dispatchTransactionState,
        owner: walletAddress.toString(),
      });
      eventEmitter.emit('success', {
        message: (
          <div>
            <span>
              Reassign Name completed with transaction ID:{' '}
              <ArweaveID
                characterCount={8}
                shouldLink={true}
                type={ArweaveIdTypes.INTERACTION}
                id={new ArweaveTransactionID(result.id)}
              />
            </span>
          </div>
        ),
        name: ANT_INTERACTION_TYPES.REASSIGN_NAME,
      });
      queryClient.resetQueries({
        queryKey: ['handlers', processId],
      });
      queryClient.resetQueries({
        queryKey: ['domainInfo', processId],
      });

      dispatchArNSUpdate({
        walletAddress: walletAddress,
        arioProcessId,
        dispatch: dispatchArNSState,
        emitter: arnsEmitter,
      });
      setShow(false);
      navigate('/manage');
    } catch (error) {
      eventEmitter.emit('error', error);
    }
  }

  if (!show) return <></>;

  if (!workflow) {
    return (
      <div className="modal-container">
        <div className="flex flex-col rounded-md border border-dark-grey bg-foreground p-8 w-[475px] gap-8 text-white">
          <div className="flex flex-row justify-between items-center">
            <h2 className="text-[24px]">Name Reassignment</h2>
            <button onClick={() => handleClose()}>
              <XIcon className="text-white" width={'24px'} height={'24px'} />
            </button>
          </div>
          <span className="text-[14px]">
            You are about to reassign your name registration from one ANT
            (Arweave Name Token) to another.
          </span>
          <div className="flex flex-row w-full items-center justify-center">
            <button
              className="bg-primary-thin p-3 rounded"
              onClick={() => setWorkflow(REASSIGN_NAME_WORKFLOWS.NEW)}
            >
              {REASSIGN_NAME_WORKFLOWS.NEW}
            </button>
            <button
              className="bg-primary-thin p-3 rounded"
              onClick={() => setWorkflow(REASSIGN_NAME_WORKFLOWS.EXISTING)}
            >
              {REASSIGN_NAME_WORKFLOWS.EXISTING}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (workflow === REASSIGN_NAME_WORKFLOWS.EXISTING)
    return (
      <div className="modal-container">
        <DialogModal
          title={<h1 className="text-2xl text-white">Name Reassignment</h1>}
          body={
            <div className="flex flex-col text-white max-w-[32rem] max-h-[40rem] gap-8 pb-4">
              <span>
                You are about to reassign your name registration from one ANT
                (Arweave Name Token) to another. Once completed:
              </span>
              <ul className="flex flex-col gap-2 pl-6 list-disc">
                <li>
                  Ownership of the name will be fully reassigned to the new ANT.
                </li>
                <li>
                  The name&apos;s existing purchase type and undername
                  allocation will remain as-is.
                </li>
                <li>Associated controllers will not be carried over.</li>
                <li>
                  Associated undername configurations and data pointers will
                  also not be carried over.
                </li>
              </ul>

              <div className="flex flex-col gap-4">
                <span className="grey">Enter destination ANT Process ID:</span>
                <ValidationInput
                  inputClassName="name-token-input white"
                  inputCustomStyle={{ paddingLeft: '10px', fontSize: '16px' }}
                  wrapperCustomStyle={{
                    position: 'relative',
                    border: '1px solid var(--text-faded)',
                    borderRadius: 'var(--corner-radius)',
                  }}
                  showValidationIcon={true}
                  showValidationOutline={true}
                  showValidationChecklist={true}
                  validationListStyle={{ display: 'none' }}
                  maxCharLength={43}
                  value={toAddress}
                  setValue={(t) => {
                    setToAddress(t);
                    if (!t.length) setIsValidAddress(undefined);
                  }}
                  validityCallback={(validity: boolean) =>
                    setIsValidAddress(validity)
                  }
                  validationPredicates={{
                    [VALIDATION_INPUT_TYPES.ARWEAVE_ID]: {
                      fn: async (id: string) => {
                        if (!isArweaveTransactionID(id)) {
                          throw new Error('Invalid Process ID');
                        }
                      },
                    },
                  }}
                />
                {isValidAddress === false ? (
                  <span className="text-error h-[10px]">
                    Invalid ANT Configuration
                  </span>
                ) : (
                  <span className="h-[10px]"></span>
                )}
              </div>
              <WarningCard
                customIcon={<TriangleAlert size={'18px'} />}
                text={
                  <div className="flex flex-row size-full">
                    <span>
                      Make sure that the destination ANT can handle the
                      name&apos;s functions, and that you have securely verified
                      the ANT owner&apos;s address and details before
                      proceeding. This action is irreversible.
                    </span>
                  </div>
                }
              />
            </div>
          }
          cancelText="Cancel"
          nextText="Next"
          onCancel={!signing ? () => handleClose() : undefined}
          onClose={!signing ? () => handleClose() : undefined}
          onNext={isValidAddress ? () => handleReassign() : undefined}
          footerClass={'py-11'}
        />
      </div>
    );

  return <></>;
}
