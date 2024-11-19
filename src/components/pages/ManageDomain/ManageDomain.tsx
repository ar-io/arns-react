import TransactionSuccessCard from '@src/components/cards/TransactionSuccessCard/TransactionSuccessCard';
import DomainSettings from '@src/components/forms/DomainSettings/DomainSettings';
import { useGlobalState } from '@src/state';
import { useTransactionState } from '@src/state/contexts/TransactionState';
import eventEmitter from '@src/utils/events';
import { useQuery } from '@tanstack/react-query';
import { ReactNode, useEffect, useState } from 'react';
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

  const { data: logoImage } = useQuery({
    queryKey: ['ant-logo', id, gateway],
    queryFn: async () => {
      try {
        if (!id) return;
        const imageRes = await fetch(`https://${gateway}/${id}`);
        const buffer = await imageRes.arrayBuffer();
        const arr = new Uint8Array(buffer).subarray(0, 4);
        const header = Array.from(arr)
          .map((byte) => byte.toString(16))
          .join('');

        const imageHeaders = {
          '89504e47': 'image/png', // PNG
          '47494638': 'image/gif', // GIF
          ffd8ffe0: 'image/jpeg', // JPEG
          ffd8ffe1: 'image/jpeg', // JPEG
          ffd8ffe2: 'image/jpeg', // JPEG
          ffd8ffe3: 'image/jpeg', // JPEG
          ffd8ffe8: 'image/jpeg', // JPEG
        };

        if (!Object.keys(imageHeaders).includes(header)) {
          console.warn('Invalid image data header:', header);
          return;
        }

        const blob = new Blob([buffer], {
          type: imageHeaders[header as keyof typeof imageHeaders],
        });
        const fileUrl = URL.createObjectURL(blob);

        return fileUrl;
      } catch (error) {
        eventEmitter.emit('error', error);
      }
    },
  });

  useEffect(() => {
    return () => {
      if (logoImage) {
        URL.revokeObjectURL(logoImage);
      }
    };
  }, [logoImage]);

  return (
    <>
      {logoImage ? (
        <img
          className={className ?? 'w-[30px] rounded-full'}
          src={logoImage}
          alt="ant-logo"
        />
      ) : (
        icon
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
