import TransactionSuccessCard from '@src/components/cards/TransactionSuccessCard/TransactionSuccessCard';
import DomainSettings from '@src/components/forms/DomainSettings/DomainSettings';
import { useGlobalState } from '@src/state';
import { useTransactionState } from '@src/state/contexts/TransactionState';
import eventEmitter from '@src/utils/events';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { decodeDomainToASCII } from '../../../utils';
import { HamburgerOutlineIcon } from '../../icons';
import './styles.css';

function AntLogoIcon({ id, className }: { id?: string; className?: string }) {
  const [{ gateway }] = useGlobalState();
  const [logoImage, setLogoImage] = useState<string | undefined>();

  useEffect(() => {
    async function updateImage(imageId: string) {
      try {
        const imageRes = await fetch(`https://${gateway}/${imageId}`);
        const imageData = await imageRes.blob();

        const fileUrl = URL.createObjectURL(imageData);

        setLogoImage(fileUrl);
      } catch (error) {
        eventEmitter.emit('error', error);
      }
    }
    if (id) {
      updateImage(id);
    }
  }, [id, gateway]);

  return (
    <>
      {logoImage ? (
        <img
          className={className ?? 'w-[30px]'}
          src={logoImage}
          alt="ant-logo"
        />
      ) : (
        <HamburgerOutlineIcon
          width={'20px'}
          height={'20px'}
          fill="var(--text-white)"
        />
      )}
    </>
  );
}

function ManageDomain() {
  const { name } = useParams();
  const navigate = useNavigate();

  const [{ workflowName, interactionResult }, dispatchTransactionState] =
    useTransactionState();

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
          </h2>
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
