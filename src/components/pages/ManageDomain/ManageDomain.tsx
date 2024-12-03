import TransactionSuccessCard from '@src/components/cards/TransactionSuccessCard/TransactionSuccessCard';
import DomainSettings from '@src/components/forms/DomainSettings/DomainSettings';
import { usePrimaryName } from '@src/hooks/usePrimaryName';
import { useGlobalState, useModalState } from '@src/state';
import { useTransactionState } from '@src/state/contexts/TransactionState';
import { Star } from 'lucide-react';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { decodeDomainToASCII } from '../../../utils';
import { HamburgerOutlineIcon } from '../../icons';
import './styles.css';

function AntLogoIcon({
  id,
  className,
  icon = (
    <HamburgerOutlineIcon
      width={'20px'}
      height={'20px'}
      fill="var(--text-white)"
    />
  ),
}: {
  id?: string;
  className?: string;
  icon?: ReactNode;
}) {
  const [{ gateway }] = useGlobalState();
  const [validImage, setValidImage] = useState(true);
  const logoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!logoRef.current || !id) return;

    const img = logoRef.current;

    const handleError = () => setValidImage(false);

    img.addEventListener('error', handleError);

    return () => {
      img.removeEventListener('error', handleError);
    };
  }, [logoRef, id]);

  if (!id) return <>{icon}</>;

  return (
    <>
      <img
        ref={logoRef}
        className={className ?? 'w-[30px] rounded-full'}
        src={`https://${gateway}/${id}`}
        alt="ant-logo"
        style={{ display: validImage ? 'block' : 'none' }}
      />
      {!validImage && icon}
    </>
  );
}

function ManageDomain() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [{ ioProcessId }] = useGlobalState();
  const [{ workflowName, interactionResult }, dispatchTransactionState] =
    useTransactionState();
  const [, dispatchModalState] = useModalState();
  const { data: primaryNameData } = usePrimaryName();

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
            <Star className={`w-[16px]`} />{' '}
            {name == primaryNameData?.name ? 'Remove Primary' : 'Make Primary'}
          </button>
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
