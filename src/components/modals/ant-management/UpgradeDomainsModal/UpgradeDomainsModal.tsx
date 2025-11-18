import { ContractSigner, createAoSigner } from '@ar.io/sdk/web';
import AntChangelog from '@src/components/cards/AntChangelog';
import { Tooltip } from '@src/components/data-display';
import { CloseIcon } from '@src/components/icons';
import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import { useLatestANTVersion } from '@src/hooks/useANTVersions';
import { buildDomainInfoQuery } from '@src/hooks/useDomainInfo';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import {
  dispatchArNSUpdate,
  useArNSState,
  useGlobalState,
  useTransactionState,
  useWalletState,
} from '@src/state';
import dispatchANTInteraction from '@src/state/actions/dispatchANTInteraction';
import { ANT_INTERACTION_TYPES } from '@src/types';
import {
  formatForMaxCharCount,
  getAntsRequiringUpdate,
  lowerCaseDomain,
  sleep,
} from '@src/utils';
import eventEmitter from '@src/utils/events';
import { queryClient } from '@src/utils/network';
import { Checkbox } from 'antd';
import Lottie from 'lottie-react';
import { pLimit } from 'plimit-lit';
import { useCallback, useEffect, useState } from 'react';

import arioLoading from '../../../icons/ario-spinner.json';
import './styles.css';

function UpgradeDomainsModal({
  visible,
  setVisible,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}) {
  const [
    {
      antAoClient,
      aoNetwork,
      arioProcessId,
      arioContract,
      hyperbeamUrl,
      antRegistryProcessId,
    },
  ] = useGlobalState();
  const [{ wallet, walletAddress }] = useWalletState();
  const [accepted, setAccepted] = useState(false);
  const [domainsToUpgrade, setDomainsToUpgrade] = useState<string[]>([]);
  const [, dispatchTransactionState] = useTransactionState();
  const [{ ants, domains, loading: arnsLoading }, dispatchArNSState] =
    useArNSState();
  const { data: antVersion } = useLatestANTVersion();
  const antModuleId = antVersion?.moduleId ?? null;
  const luaSourceId = antVersion?.luaSourceId ?? null;
  // 0 or greater means loading, -1 means not loading
  const [progress, setProgress] = useState(-1);
  const isUpdatingAnts = useCallback(() => progress >= 0, [progress]);

  // Track individual domain upgrade status
  const [domainStatuses, setDomainStatuses] = useState<
    Record<
      string,
      {
        status: 'pending' | 'in-progress' | 'completed' | 'failed';
        currentStep?: string;
        error?: string;
      }
    >
  >({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const domainsPerPage = 10;
  const totalPages = Math.ceil(domainsToUpgrade.length / domainsPerPage);
  const startIndex = (currentPage - 1) * domainsPerPage;
  const endIndex = startIndex + domainsPerPage;
  const currentPageDomains = domainsToUpgrade.slice(startIndex, endIndex);

  useEffect(() => {
    if (walletAddress && antModuleId && !arnsLoading) {
      const antsRequiringUpdate = getAntsRequiringUpdate({
        ants,
        userAddress: walletAddress.toString(),
        currentModuleId: antModuleId,
      });
      const domainsNeedingUpgrade = Object.entries(domains).reduce(
        (acc: string[], [domain, record]) => {
          if (antsRequiringUpdate.includes(record.processId)) {
            acc = [...acc, domain];
          }
          return acc;
        },
        [],
      );

      setDomainsToUpgrade(domainsNeedingUpgrade);

      // Initialize domain statuses
      const initialStatuses: Record<
        string,
        {
          status: 'pending' | 'in-progress' | 'completed' | 'failed';
          currentStep?: string;
          error?: string;
        }
      > = {};
      domainsNeedingUpgrade.forEach((domain) => {
        initialStatuses[domain] = { status: 'pending' };
      });
      setDomainStatuses(initialStatuses);
    }
  }, [ants, domains, walletAddress, antModuleId, arnsLoading]);

  function handleClose() {
    setVisible(false);
    setAccepted(false);
    setProgress(-1);
    setDomainStatuses({});
    setCurrentPage(1);
  }

  async function upgradeDomains() {
    if (isUpdatingAnts()) return;
    try {
      setProgress(0);
      if (!wallet?.contractSigner || !walletAddress) {
        throw new Error('No Wander Signer found');
      }
      if (!antModuleId) {
        throw new Error('No ANT Module available, try again later');
      }

      const signer = createAoSigner(wallet?.contractSigner as ContractSigner);
      const failedUpgrades = [];
      const throttle = pLimit(10);

      await Promise.all(
        domainsToUpgrade.map((domain) =>
          throttle(async () => {
            try {
              // Mark domain as in-progress
              setDomainStatuses((prev) => ({
                ...prev,
                [domain]: {
                  status: 'in-progress',
                  currentStep: 'Fetching domain info...',
                },
              }));

              const domainInfo = await queryClient.fetchQuery(
                buildDomainInfoQuery({
                  arioContract,
                  arioProcessId,
                  domain,
                  aoNetwork,
                  hyperbeamUrl,
                  antRegistryProcessId,
                }),
              );

              await dispatchANTInteraction({
                payload: {
                  arioProcessId,
                  name: lowerCaseDomain(domain),
                },
                workflowName: ANT_INTERACTION_TYPES.UPGRADE_ANT,
                processId: domainInfo.processId,
                owner: walletAddress.toString(),
                ao: antAoClient,
                antRegistryProcessId,
                signer,
                dispatchTransactionState,
                dispatchArNSState,
                stepCallback: async (
                  step?: string | Record<string, string>,
                ) => {
                  // Update the current step for this domain
                  const stepText =
                    typeof step === 'string'
                      ? step
                      : step?.message || 'Processing...';
                  setDomainStatuses((prev) => ({
                    ...prev,
                    [domain]: { ...prev[domain], currentStep: stepText },
                  }));
                },
              });

              // Mark domain as completed
              setDomainStatuses((prev) => ({
                ...prev,
                [domain]: { status: 'completed' },
              }));
            } catch (error) {
              failedUpgrades.push(domain);
              // Mark domain as failed
              setDomainStatuses((prev) => ({
                ...prev,
                [domain]: {
                  status: 'failed',
                  error:
                    error instanceof Error ? error.message : 'Unknown error',
                },
              }));
            }
            setProgress((prev) =>
              Math.round(prev + 100 / domainsToUpgrade.length),
            );
          }),
        ),
      );

      if (failedUpgrades.length < domainsToUpgrade.length) {
        eventEmitter.emit('success', {
          message: (
            <div>
              <span>
                Updated {domainsToUpgrade.length - failedUpgrades.length}{' '}
                Domains to Module ID{' '}
                <ArweaveID
                  characterCount={8}
                  shouldLink={true}
                  type={ArweaveIdTypes.TRANSACTION}
                  id={new ArweaveTransactionID(antModuleId)}
                />
              </span>
            </div>
          ),
          name: `${domainsToUpgrade.length - failedUpgrades.length} of ${
            domainsToUpgrade.length
          } Domains successfully updated!'`,
        });
      }
      // slight delay for UX so the stage is visible on shorter updates
      await sleep(3000);
    } catch (error) {
      eventEmitter.emit('error', error);
    } finally {
      dispatchArNSUpdate({
        dispatch: dispatchArNSState,
        walletAddress: walletAddress!,
        arioProcessId: arioProcessId,
        antRegistryProcessId,
        aoNetworkSettings: aoNetwork,
        hyperbeamUrl,
      });
      handleClose();
    }
  }

  if (!visible) return <></>;

  return (
    <div className="modal-container items-center justify-center">
      <div className="flex h-fit max-h-[40rem] w-[35rem] justify-between flex-col rounded-lg bg-[#1B1B1D] shadow-one">
        <div className="flex flex-row justify-between border-b-[1px] border-dark-grey px-8 py-4">
          <h1
            className="flex flex-row text-xl text-white"
            style={{ gap: '10px' }}
          >
            {progress < 0 ? (
              <>Upgrade {domainsToUpgrade.length} of your Domains</>
            ) : (
              <>Upgrading domains... {progress}%</>
            )}
          </h1>
          <button
            disabled={progress >= 0}
            className="text-md text-white"
            onClick={() => handleClose()}
          >
            <CloseIcon width={'20px'} fill={'white'} />
          </button>
        </div>
        {progress < 0 ? (
          <>
            <div className="flex box-border h-full overflow-hidden w-full flex-col px-8 py-4 text-sm text-white">
              {arnsLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <Lottie
                      animationData={arioLoading}
                      loop={true}
                      className="h-[150px]"
                    />
                    <p className="mt-4 text-grey">
                      Loading domains and ANTs...
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex scrollbar h-full min-h-[120px] border-b-[1px] border-dark-grey pb-4 mb-4 overflow-y-scroll scrollbar-thumb-primary-thin scrollbar-thumb-rounded-full scrollbar-w-2">
                    <AntChangelog />
                  </div>
                  <div className="flex flex-col gap-2">
                    <span>
                      This upgrade will result in a new Process ID association
                      for this ArNS Name.
                    </span>
                    <span
                      className="flex flex-row items-center text-sm"
                      style={{ gap: '10px' }}
                    >
                      <Checkbox
                        rootClassName="accept-checkbox"
                        onChange={(checked) =>
                          setAccepted(checked.target.checked)
                        }
                        value={accepted}
                      />
                      I understand and wish to proceed{' '}
                      <Tooltip
                        message={
                          <div className="flex flex-col">
                            <span>
                              This will automatically provision a new ANT
                              Process, copy all previous ANT settings, and
                              conduct a &apos;Reassign&apos; Action to point
                              your ArNS Name to the new, upgraded ANT Process
                              ID.
                            </span>
                            <span className="pt-2 text-primary">
                              View the code:{' '}
                              <a
                                className="text-link"
                                href={`https://arscan.io/tx/${luaSourceId}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {luaSourceId
                                  ? formatForMaxCharCount(luaSourceId, 8)
                                  : 'No source ID found'}
                              </a>
                            </span>
                          </div>
                        }
                      />
                    </span>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex h-full w-full flex-col px-8 py-4">
            {/* Domain count info */}
            {domainsToUpgrade.length > 0 && (
              <div className="mb-4 text-center">
                <span className="text-white text-sm">
                  {domainsToUpgrade.length > domainsPerPage
                    ? `Showing ${startIndex + 1}-${Math.min(
                        endIndex,
                        domainsToUpgrade.length,
                      )} of ${domainsToUpgrade.length} domains`
                    : `${domainsToUpgrade.length} domains to upgrade`}
                </span>
              </div>
            )}

            {/* Domain rows */}
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px] scrollbar scrollbar-thumb-primary-thin scrollbar-thumb-rounded-full scrollbar-w-2">
              {currentPageDomains.map((domain) => {
                const status = domainStatuses[domain] || { status: 'pending' };
                return (
                  <div
                    key={domain}
                    className="flex flex-row justify-between items-center p-3 rounded-md bg-background-secondary border border-dark-grey"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-white font-medium">{domain}</span>
                      {status.currentStep && (
                        <span className="text-xs text-white">
                          {status.currentStep}
                        </span>
                      )}
                      {status.error && (
                        <span className="text-xs text-error">
                          {status.error}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center">
                      {status.status === 'pending' && (
                        <span className="text-white text-sm">Waiting...</span>
                      )}
                      {status.status === 'in-progress' && (
                        <Lottie
                          animationData={arioLoading}
                          loop={true}
                          className="h-6 w-6"
                        />
                      )}
                      {status.status === 'completed' && (
                        <span className="text-success text-sm">
                          ✓ Completed
                        </span>
                      )}
                      {status.status === 'failed' && (
                        <span className="text-error text-sm">✗ Failed</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4 pt-4 border-t border-dark-grey">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className={`px-3 py-1 text-sm rounded ${
                    currentPage === 1
                      ? 'text-grey bg-background cursor-not-allowed'
                      : 'text-white bg-background-secondary hover:bg-primary-thin border border-dark-grey'
                  }`}
                >
                  Previous
                </button>

                {/* Page numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`px-3 py-1 text-sm rounded ${
                          currentPage === pageNumber
                            ? 'text-black bg-primary'
                            : 'text-white bg-background-secondary hover:bg-primary-thin border border-dark-grey'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className={`px-3 py-1 text-sm rounded ${
                    currentPage === totalPages
                      ? 'text-grey bg-background cursor-not-allowed'
                      : 'text-white bg-background-secondary hover:bg-primary-thin border border-dark-grey'
                  }`}
                >
                  Next
                </button>
              </div>
            )}

            <div className="mt-4 text-center">
              <span className="text-white text-sm">
                Overall Progress: {progress}%
              </span>
            </div>
          </div>
        )}

        {/* footer */}
        <div>
          <button
            disabled={!accepted || isUpdatingAnts() || arnsLoading}
            className={`${
              !accepted || arnsLoading
                ? 'bg-background text-grey'
                : `animate-pulse ${
                    progress < 0
                      ? 'bg-primary-thin text-primary'
                      : 'bg-link text-white hover:bg-primary hover:text-black'
                  } `
            } w-full rounded-b-lg p-4 transition-all text-sm`}
            onClick={() => upgradeDomains()}
          >
            {arnsLoading
              ? 'Loading domains...'
              : !accepted && progress < 0
                ? 'Verify you understand before proceeding'
                : progress >= 0
                  ? 'Updating, please wait...'
                  : 'Upgrade'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UpgradeDomainsModal;
