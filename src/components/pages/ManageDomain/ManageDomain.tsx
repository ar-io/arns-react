import TransactionSuccessCard from '@src/components/cards/TransactionSuccessCard/TransactionSuccessCard';
import DomainSettings from '@src/components/forms/DomainSettings/DomainSettings';
import { useTransactionState } from '@src/state/contexts/TransactionState';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { decodeDomainToASCII } from '../../../utils';
import { HamburgerOutlineIcon } from '../../icons';
import './styles.css';

function ManageDomain() {
  const { name } = useParams();
  const navigate = useNavigate();

  const [{ workflowName, interactionResult }, dispatchTransactionState] =
    useTransactionState();

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
          </h2>
        </div>
        <DomainSettings domain={name} />
      </div>
    </>
  );
}

export default ManageDomain;
