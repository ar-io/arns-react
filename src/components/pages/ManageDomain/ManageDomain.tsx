import { Tooltip } from '@src/components/data-display';
import { AntLogoIcon } from '@src/components/data-display/AntLogoIcon';
import UndernamesTable from '@src/components/data-display/tables/UndernamesTable';
import DomainSettings from '@src/components/forms/DomainSettings/DomainSettings';
import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import useDomainInfo from '@src/hooks/useDomainInfo';
import { usePrimaryName } from '@src/hooks/usePrimaryName';
import { useGlobalState, useModalState, useWalletState } from '@src/state';
import { useTransactionState } from '@src/state/contexts/TransactionState';
import { AoAddress } from '@src/types';
import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { decodeDomainToASCII, lowerCaseDomain } from '../../../utils';
import './styles.css';

function ManageDomain() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [{ arioProcessId }] = useGlobalState();
  const [, dispatchTransactionState] = useTransactionState();
  const [, dispatchModalState] = useModalState();
  const { data: primaryNameData } = usePrimaryName();
  const { data: domainData } = useDomainInfo({
    domain: name,
  });
  const [{ walletAddress }] = useWalletState();
  const isOwner = walletAddress
    ? walletAddress.toString() === domainData?.state?.Owner
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
        className="page gap-3"
        style={{ paddingTop: '10px', paddingBottom: '10px' }}
      >
        <div
          className="flex flex-row border-b border-dark-grey pb-2"
          style={{
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <h2 className="flex white center" style={{ gap: '16px' }}>
            <AntLogoIcon id={logoId} />

            <div className="flex flex-col items-start justify-center">
              <div className="flex items-center gap-2">
                {decodeDomainToASCII(name!)}
                <Star
                  className={
                    (name === primaryNameData?.name
                      ? 'text-primary fill-primary'
                      : 'text-grey') + ` w-[18px]`
                  }
                />
              </div>
              {domainData?.processId && (
                <div className="text-sm flex items-center gap-1">
                  <span className="whitespace-nowrap text-sm text-grey">
                    Process ID:{' '}
                  </span>
                  <ArweaveID
                    id={domainData.processId as AoAddress}
                    shouldLink={true}
                    characterCount={16}
                    type={ArweaveIdTypes.CONTRACT}
                  />
                </div>
              )}{' '}
            </div>
          </h2>
          {isOwner && (
            <Tooltip
              message={
                name === primaryNameData?.name
                  ? 'Remove this name from being the primary name for this wallet address'
                  : 'Set this name as this wallet addresses primary name'
              }
              icon={
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
                  {name === primaryNameData?.name
                    ? 'Remove Primary'
                    : 'Set as Primary'}
                </button>
              }
            />
          )}
        </div>
        <div className="w-full ">
          <DomainSettings
            domain={lowerCaseDomain(name || '')}
            setLogo={(id?: string) => setLogoId(id)}
          />
        </div>

        <div className="w-full border-t border-dark-grey pt-4 mt-4">
          <h3 className="text-xl font-semibold text-white mb-5 flex items-center gap-2">
            Undernames
          </h3>
          <div className="border border-dark-grey rounded">
            <UndernamesTable
              undernames={domainData?.records || {}}
              state={domainData?.state}
              arnsRecord={{
                name: lowerCaseDomain(name || ''),
                version: 0,
                undernameLimit: domainData?.arnsRecord?.undernameLimit || 0,
                processId: domainData?.arnsRecord?.processId || '',
              }}
              isLoading={false}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default ManageDomain;
