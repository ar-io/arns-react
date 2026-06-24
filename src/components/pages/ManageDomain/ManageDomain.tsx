import { Tooltip } from '@src/components/data-display';
import { AntLogoIcon } from '@src/components/data-display/AntLogoIcon';
import UndernamesTable from '@src/components/data-display/tables/UndernamesTable';
import DomainSettings from '@src/components/forms/DomainSettings/DomainSettings';
import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import { MetaplexAttributesModal } from '@src/components/modals/ant-management/MetaplexAttributesModal/MetaplexAttributesModal';
import SyncOwnershipModal from '@src/components/modals/ant-management/SyncOwnershipModal/SyncOwnershipModal';
import useDomainInfo from '@src/hooks/useDomainInfo';
import { usePrimaryName } from '@src/hooks/usePrimaryName';
import {
  dispatchArNSUpdate,
  useArNSState,
  useGlobalState,
  useModalState,
  useWalletState,
} from '@src/state';
import { useTransactionState } from '@src/state/contexts/TransactionState';
import { AoAddress } from '@src/types';
import { RefreshCw, Sparkles, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { decodeDomainToASCII, lowerCaseDomain } from '../../../utils';
import './styles.css';

function ManageDomain() {
  const { name } = useParams();
  const navigate = useNavigate();
  // arioProcessId was an AO process id used to route ArNS transactions; on
  // Solana the protocol address comes from env-derived program IDs, but the
  // legacy transaction payload schema still expects a string. Pass empty —
  // the dispatcher ignores it for the Solana backend.
  const arioProcessId = '';
  const [{ arioContract }] = useGlobalState();
  const [, dispatchTransactionState] = useTransactionState();
  const [, dispatchModalState] = useModalState();
  const [{ ants }, dispatchArNSState] = useArNSState();
  const { data: primaryNameData } = usePrimaryName();
  const { data: domainData } = useDomainInfo({
    domain: name,
  });
  const [{ walletAddress, wallet }] = useWalletState();
  const isOwner = walletAddress
    ? walletAddress.toString() === domainData?.state?.Owner
    : false;

  // This name's ANT is owned by the wallet on-chain but its ACL owner entry is
  // missing (e.g. an out-of-band transfer) — flagged during the ArNS refresh.
  const needsOwnerSync = domainData?.processId
    ? (ants[domainData.processId]?.needsOwnerSync ?? false)
    : false;

  const [logoId, setLogoId] = useState<string | undefined>();
  const [showMetaplexAttributesModal, setShowMetaplexAttributesModal] =
    useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);

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
        <div className="flex w-full items-center justify-between gap-4 border-b border-dark-grey pb-2">
          <h2 className="flex items-center gap-4 white">
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
                    Token Address:{' '}
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
          <div className="flex shrink-0 items-center justify-end gap-3">
            {needsOwnerSync && domainData?.processId && (
              <Tooltip
                message="You own this ANT on-chain but its ownership isn't recorded in the registry yet. Sync to reconcile it."
                icon={
                  <button
                    className="flex items-center gap-2 max-w-fit rounded border border-warning px-3 py-1 text-[16px] text-warning hover:bg-warning hover:text-black transition-all"
                    onClick={() => setShowSyncModal(true)}
                  >
                    <RefreshCw className="w-[16px]" /> Sync Ownership
                  </button>
                }
              />
            )}
            {domainData?.processId && (
              <Tooltip
                message="View the Metaplex Core attributes stored on this ANT asset"
                icon={
                  <button
                    className="flex text-primary bg-primary-thin max-w-fit rounded border border-primary px-3 py-1 gap-3 text-[16px] items-center"
                    onClick={() => setShowMetaplexAttributesModal(true)}
                  >
                    <Sparkles className="w-[16px]" /> Metaplex Attributes
                  </button>
                }
              />
            )}
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
      <MetaplexAttributesModal
        show={showMetaplexAttributesModal}
        setShow={setShowMetaplexAttributesModal}
        processId={domainData?.processId}
      />
      {showSyncModal && domainData?.processId && (
        <SyncOwnershipModal
          items={[
            {
              mint: domainData.processId.toString(),
              names: name ? [name] : [],
            },
          ]}
          closeModal={() => setShowSyncModal(false)}
          onSynced={() => {
            if (!walletAddress) return;
            dispatchArNSUpdate({
              dispatch: dispatchArNSState,
              walletAddress,
              wallet: wallet ?? undefined,
              arioContract,
            });
          }}
        />
      )}
    </>
  );
}

export default ManageDomain;
