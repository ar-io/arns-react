import TransactionSuccessCard from '@src/components/cards/TransactionSuccessCard/TransactionSuccessCard';
import { AntLogoIcon } from '@src/components/data-display/AntLogoIcon';
import DomainSettings from '@src/components/forms/DomainSettings/DomainSettings';
import useDomainInfo from '@src/hooks/useDomainInfo';
import { usePrimaryName } from '@src/hooks/usePrimaryName';
import { useGlobalState, useModalState, useWalletState } from '@src/state';
import { useTransactionState } from '@src/state/contexts/TransactionState';
import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { decodeDomainToASCII } from '../../../utils';
import './styles.css';

function ManageDomain() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [{ arioProcessId }] = useGlobalState();
  const [{ workflowName, interactionResult }, dispatchTransactionState] =
    useTransactionState();
  const [, dispatchModalState] = useModalState();
  const { data: primaryNameData } = usePrimaryName();
  const { data: domainData } = useDomainInfo({ domain: name });
  const [{ walletAddress }] = useWalletState();

  const isOwner = walletAddress
    ? walletAddress.toString() === domainData?.info?.Owner
    : false;

  const [logoId, setLogoId] = useState<string | undefined>();

  useEffect(() => {
    if (!name) {
      navigate('/manage/names');
      return;
    }
    // Reset transaction state on unmount - clears transaction success banner
    return () => {
      dispatchTransactionState({ type: 'reset' });
    };
  }, [name]);

  return (
    <>
      <div
        className="page"
        style={{ gap: '0px', paddingTop: '10px', paddingBottom: '10px' }}
      >
        {interactionResult && (
          <div className="mb-4 w-full">
            <TransactionSuccessCard
              txId={interactionResult.id}
              title={`${workflowName} completed`}
              close={() => {
                dispatchTransactionState({
                  type: 'reset',
                });
              }}
            />
          </div>
        )}
        <div
          className="flex flex-row"
          style={{
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <h2 className="flex white center" style={{ gap: '16px' }}>
            <AntLogoIcon id={logoId} />
            {decodeDomainToASCII(name!)}
            <Star
              className={
                (name == primaryNameData?.name
                  ? 'text-primary fill-primary'
                  : 'text-grey') + ` w-[18px]`
              }
            />
          </h2>
          {isOwner && (
            <button
              className={
                'flex text-primary bg-primary-thin max-w-fit rounded border border-primary px-3 py-1 gap-3 text-[16px] items-center'
              }
              onClick={() => {
                if (!name) return;
                if (primaryNameData?.name === name) {
                  // remove primary name payload
                  dispatchTransactionState({
                    type: 'setTransactionData',
                    payload: {
                      names: [name],
                      arioProcessId,
                      assetId: '',
                      functionName: 'removePrimaryNames',
                    },
                  });
                } else {
                  dispatchTransactionState({
                    type: 'setTransactionData',
                    payload: {
                      name,
                      arioProcessId,
                      assetId: arioProcessId,
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
              <Star className={`w-[16px]`} />{' '}
              {name == primaryNameData?.name
                ? 'Remove Primary'
                : 'Make Primary'}
            </button>
          )}
        </div>
        <DomainSettings
          domain={name}
          setLogo={(id?: string) => setLogoId(id)}
        />
      </div>
    </>
  );
}

export default ManageDomain;
