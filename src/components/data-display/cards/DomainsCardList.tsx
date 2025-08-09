import { AoArNSNameData } from '@ar.io/sdk';
import { ExternalLinkIcon, RefreshIcon } from '@src/components/icons';
import ManageAssetButtons from '@src/components/inputs/buttons/ManageAssetButtons/ManageAssetButtons';
import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import UpgradeDomainModal from '@src/components/modals/ant-management/UpgradeDomainModal/UpgradeDomainModal';
import { useLatestANTVersion } from '@src/hooks/useANTVersions';
import { usePrimaryName } from '@src/hooks/usePrimaryName';
import {
  ANTProcessData,
  useArNSState,
  useGlobalState,
  useModalState,
  useTransactionState,
  useWalletState,
} from '@src/state';
import { dispatchANTUpdate } from '@src/state/actions/dispatchANTUpdate';
import { AoAddress } from '@src/types';
import {
  decodeDomainToASCII,
  doAntsRequireUpdate,
  encodeDomainToASCII,
  formatExpiryDate,
  formatForMaxCharCount,
  formatVerboseDate,
  getOwnershipStatus,
  isArweaveTransactionID,
  lowerCaseDomain,
} from '@src/utils';
import {
  MIN_ANT_VERSION,
  NETWORK_DEFAULTS,
  PERMANENT_DOMAIN_MESSAGE,
} from '@src/utils/constants';
import { ANTStateError } from '@src/utils/errors';
import { queryClient } from '@src/utils/network';
import { CircleCheck, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Tooltip } from '..';

interface DomainsCardListProps {
  domainData: {
    names: Record<string, AoArNSNameData>;
    ants: Record<string, ANTProcessData>;
  };
  loading: boolean;
  filter?: string;
  setFilter: (filter: string) => void;
}

interface CardData {
  name: string;
  role: string;
  processId: string;
  targetId: string;
  undernames: { used: number; supported: number };
  expiryDate: number | typeof PERMANENT_DOMAIN_MESSAGE;
  version: number;
  ioCompatible?: boolean | ANTStateError | string;
}

function filterTableData(filter: string, data: CardData[]): CardData[] {
  const results: CardData[] = [];
  data.forEach((d) => {
    let matchFound = false;
    Object.entries(d).forEach(([, v]) => {
      if (typeof v === 'object' && v !== null) {
        const nestedResults = filterTableData(filter, [v as any]);
        if (nestedResults.length > 0) {
          matchFound = true;
        }
      } else if (v?.toString()?.toLowerCase()?.includes(filter.toLowerCase())) {
        matchFound = true;
      }
    });
    if (matchFound) {
      results.push(d);
    }
  });
  return results;
}

const PAGE_SIZE = 5;

const DomainsCardList = ({
  domainData,
  loading,
  filter = '',
  setFilter,
}: DomainsCardListProps) => {
  const [{ walletAddress }] = useWalletState();
  const [{ arioProcessId, aoNetwork, hyperbeamUrl }] = useGlobalState();
  const [, dispatchArNSState] = useArNSState();
  const { data: antVersion } = useLatestANTVersion();
  const antModuleId = antVersion?.moduleId ?? null;
  const [, dispatchModalState] = useModalState();
  const [, dispatchTransactionState] = useTransactionState();
  const { data: primaryNameData } = usePrimaryName();

  const [cards, setCards] = useState<CardData[]>([]);
  const [filteredCards, setFilteredCards] = useState<CardData[]>([]);
  const [page, setPage] = useState(0);
  const [showUpgradeDomainModal, setShowUpgradeDomainModal] = useState(false);
  const [domainToUpgrade, setDomainToUpgrade] = useState<string | undefined>();

  useEffect(() => {
    if (domainData) {
      const newCards: CardData[] = [];
      Object.entries(domainData.names).forEach(([domain, record]) => {
        const ant = domainData.ants[record.processId];
        const ioCompatible =
          ant?.errors?.find((e) => e instanceof ANTStateError) ??
          (walletAddress && ant?.state && record?.processId
            ? !doAntsRequireUpdate({
                ants: {
                  [record.processId]: {
                    state: ant.state,
                    version: ant.version,
                    processMeta: ant.processMeta,
                  },
                },
                userAddress: walletAddress.toString(),
                currentModuleId: antModuleId,
              })
            : false);
        newCards.push({
          name: domain,
          role:
            getOwnershipStatus(
              ant?.state?.Owner,
              ant?.state?.Controllers,
              walletAddress?.toString(),
            ) ?? 'N/A',
          processId: record.processId,
          targetId: ant?.state?.Records?.['@']?.transactionId ?? 'N/A',
          undernames: {
            used:
              Object.keys(ant?.state?.Records ?? {}).filter((u) => u !== '@')
                ?.length ?? 0,
            supported: record.undernameLimit,
          },
          expiryDate: (record as any).endTimestamp ?? PERMANENT_DOMAIN_MESSAGE,
          version: ant?.version ?? 0,
          ioCompatible,
        });
      });
      setCards(newCards);
    }
  }, [domainData, loading, walletAddress, antModuleId]);

  useEffect(() => {
    const filtered = filterTableData(filter, cards);
    setFilteredCards(filtered);
    setPage(0);
  }, [filter, cards]);

  const paginated = filteredCards.slice(
    page * PAGE_SIZE,
    (page + 1) * PAGE_SIZE,
  );
  const pageCount = Math.ceil(filteredCards.length / PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
      {paginated.map((row) => {
        const { used, supported } = row.undernames;
        return (
          <div
            key={row.processId}
            className="flex flex-col gap-2 border border-dark-grey rounded p-4"
          >
            <div className="flex items-center justify-between">
              <Link
                className="link gap-2 w-fit whitespace-nowrap items-center"
                to={`https://${encodeDomainToASCII(row.name)}.${
                  NETWORK_DEFAULTS.ARNS.HOST
                }`}
                target="_blank"
              >
                {formatForMaxCharCount(decodeDomainToASCII(row.name), 20)}
                <ExternalLinkIcon className="size-3 fill-grey ml-1" />
              </Link>
              <span className="capitalize text-sm">{row.role}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-grey">Process</span>
              <ArweaveID
                id={row.processId as AoAddress}
                shouldLink
                characterCount={8}
                type={ArweaveIdTypes.CONTRACT}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-grey">Target</span>
              {isArweaveTransactionID(row.targetId) ? (
                <ArweaveID
                  id={row.targetId as AoAddress}
                  shouldLink
                  characterCount={8}
                  type={ArweaveIdTypes.TRANSACTION}
                />
              ) : (
                <>{row.targetId}</>
              )}
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-grey">Under_names</span>
              <Link
                className={`${used >= supported ? 'text-warning' : 'link'}`}
                to={`/manage/names/${row.name}/upgrade-undernames`}
              >
                {used} / {supported}
              </Link>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-grey">Expiry</span>
              {row.expiryDate == PERMANENT_DOMAIN_MESSAGE ? (
                <Tooltip
                  message={
                    'This domain is permanently registered and will never expire'
                  }
                  icon={<>Indefinite</>}
                />
              ) : (
                <Tooltip
                  message={
                    'Enters grace period on approximately ' +
                    formatVerboseDate(row.expiryDate)
                  }
                  icon={<>{formatExpiryDate(row.expiryDate as number)}</>}
                />
              )}
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                {row.ioCompatible instanceof ANTStateError && walletAddress ? (
                  <button
                    className="flex whitespace-nowrap justify-center align-center gap-2 text-center text-sm"
                    onClick={async () => {
                      dispatchANTUpdate({
                        processId: row.processId,
                        domain: lowerCaseDomain(row.name),
                        aoNetwork,
                        queryClient,
                        walletAddress,
                        hyperbeamUrl,
                        dispatch: dispatchArNSState,
                      });
                    }}
                  >
                    Retry
                    <RefreshIcon
                      height={16}
                      width={16}
                      fill="var(--text-white)"
                    />
                  </button>
                ) : row.ioCompatible === false && row.role !== 'controller' ? (
                  <button
                    onClick={() => {
                      setDomainToUpgrade(lowerCaseDomain(row.name));
                      setShowUpgradeDomainModal(true);
                    }}
                    className="p-[4px] px-[8px] text-[12px] rounded-[4px] bg-primary-thin hover:bg-primary border hover:border-primary border-primary-thin text-primary hover:text-black transition-all whitespace-nowrap"
                  >
                    Update
                  </button>
                ) : (
                  <CircleCheck className="text-success w-[16px]" />
                )}
              </div>
              <span className="flex gap-3">
                {row.role === 'owner' ? (
                  <Tooltip
                    message={
                      row.version < MIN_ANT_VERSION
                        ? 'Update ANT to access Primary Names workflow'
                        : primaryNameData?.name === row.name
                        ? 'Remove Primary Name'
                        : 'Set Primary Name'
                    }
                    icon={
                      <button
                        disabled={row.version < MIN_ANT_VERSION}
                        onClick={() => {
                          const targetName = row.name;
                          if (primaryNameData?.name === targetName) {
                            dispatchTransactionState({
                              type: 'setTransactionData',
                              payload: {
                                names: [targetName],
                                arioProcessId,
                                assetId: row.processId,
                                functionName: 'removePrimaryNames',
                              },
                            });
                          } else {
                            dispatchTransactionState({
                              type: 'setTransactionData',
                              payload: {
                                name: targetName,
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
                        <Star
                          className={
                            (row.name == primaryNameData?.name
                              ? 'text-primary fill-primary'
                              : 'text-grey') + ' w-[18px]'
                          }
                        />
                      </button>
                    }
                  />
                ) : null}
                <ManageAssetButtons
                  id={lowerCaseDomain(row.name)}
                  assetType="names"
                  disabled={false}
                />
              </span>
            </div>
          </div>
        );
      })}
      {pageCount > 1 && (
        <div className="flex w-full items-center justify-center gap-4">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
          >
            Prev
          </button>
          <span className="text-sm">
            {page + 1} / {pageCount}
          </span>
          <button
            disabled={page + 1 >= pageCount}
            onClick={() => setPage((p) => Math.min(p + 1, pageCount - 1))}
          >
            Next
          </button>
        </div>
      )}
      {filteredCards.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center border border-dark-grey p-6 text-grey">
          No data found.
          {filter && (
            <button
              onClick={() => setFilter('')}
              className="button-secondary center p-[10px] w-fit mt-4"
            >
              Clear filter
            </button>
          )}
        </div>
      )}
      {domainToUpgrade && (
        <UpgradeDomainModal
          domain={domainToUpgrade}
          visible={showUpgradeDomainModal}
          setVisible={(b: boolean) => {
            setShowUpgradeDomainModal(b);
            setDomainToUpgrade(undefined);
          }}
        />
      )}
    </div>
  );
};

export default DomainsCardList;
