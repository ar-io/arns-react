import TransactionSuccessCard from '@src/components/cards/TransactionSuccessCard/TransactionSuccessCard';
import DomainSettings from '@src/components/forms/DomainSettings/DomainSettings';
import { usePrimaryName } from '@src/hooks/usePrimaryName';
import { useGlobalState, useModalState } from '@src/state';
import { useTransactionState } from '@src/state/contexts/TransactionState';
import { Star } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { decodeDomainToASCII } from '../../../utils';
import { HamburgerOutlineIcon } from '../../icons';
import './styles.css';

function ManageDomain() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [{ ioProcessId }] = useGlobalState();
  const [{ workflowName, interactionResult }, dispatchTransactionState] =
    useTransactionState();
  const [, dispatchModalState] = useModalState();
  const { data: primaryNameData } = usePrimaryName();

  useEffect(() => {
    // Reset transaction state on unmount - clears transaction success banner
    return () => {
      dispatchTransactionState({ type: 'reset' });
    };
  }, []);

  useEffect(() => {
    if (!name) {
      navigate('/manage/names');
      return;
    }
  }, [name]);

  return (
    <>
      <div
        className="page"
        style={{ gap: '0px', paddingTop: '10px', paddingBottom: '10px' }}
      >
        {interactionResult ? (
          <TransactionSuccessCard
            txId={interactionResult.id}
            title={`${workflowName} completed`}
            close={() => {
              dispatchTransactionState({
                type: 'reset',
              });
            }}
          />
        ) : (
          <></>
        )}
        <div
          className="flex flex-row"
          style={{
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <h2 className="flex white center" style={{ gap: '16px' }}>
            <HamburgerOutlineIcon
              width={'20px'}
              height={'20px'}
              fill="var(--text-white)"
            />
            {decodeDomainToASCII(name!)}
            <Star
              className={
                (name == primaryNameData?.name ? 'text-primary' : 'text-grey') +
                ` w-[18px]`
              }
            />
          </h2>
          <button
            className={
              'flex flex-row text-primary rounded border border-primary px-4 py-3 gap-3'
            }
            onClick={() => {
              if (!name) return;
              if (primaryNameData?.name === name) {
                // remove primary name payload
                dispatchTransactionState({
                  type: 'setTransactionData',
                  payload: {
                    names: [name],
                    ioProcessId,
                    assetId: '',
                    functionName: 'removePrimaryNames',
                  },
                });
              } else {
                dispatchTransactionState({
                  type: 'setTransactionData',
                  payload: {
                    name,
                    ioProcessId,
                    assetId: ioProcessId,
                    functionName: 'primaryNameRequest',
                  },
                });
              }

              dispatchModalState({
                type: 'setModalOpen',
                payload: { showPrimaryNameModal: true },
              });
            }}
          >
            <Star className={`w-[18px]`} />{' '}
            {name == primaryNameData?.name ? 'Remove Primary' : 'Make Primary'}
          </button>
        </div>
        <DomainSettings domain={name} />
      </div>
    </>
  );
}

export default ManageDomain;
