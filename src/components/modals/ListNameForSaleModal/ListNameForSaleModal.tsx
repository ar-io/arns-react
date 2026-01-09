import { Tooltip } from '@src/components/data-display';
import { useANTIntent } from '@src/hooks/useANTIntent';
import { useArIoPrice } from '@src/hooks/useArIOPrice';
import { useMarketplaceInfo } from '@src/hooks/useMarketplaceInfo';
import { useGlobalState, useWalletState } from '@src/state';
import {
  CheckIcon,
  DollarSign,
  Gavel,
  Handshake,
  Loader,
  LucideProps,
  Send,
  TrendingDown,
  XIcon,
} from 'lucide-react';
import { Tabs } from 'radix-ui';
import { ReactNode, useCallback, useMemo, useState } from 'react';

import {
  AOProcess,
  ARIOToken,
  AoARIOWrite,
  AoMessageResult,
  ArNSMarketplaceWrite,
  ListNameForSaleProgressEvent,
  MessageResult,
  calculateListingFee,
  calculateSaleTax,
  createAoSigner,
  mARIOToken,
} from '@ar.io/sdk';
import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import {
  buildMarketplaceUserAssetsQuery,
  useMarketplaceUserAssets,
} from '@src/hooks/useMarketplaceUserAssets';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { sleep } from '@src/utils';
import eventEmitter from '@src/utils/events';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import ConfirmListingPanel from './panels/ConfirmListingPanel';
import FixedPricePanel from './panels/FixedPricePanel';
import ProcessTransactionPanel from './panels/ProcessTransactionPanel';

export type ListingType = 'fixed' | 'dutch' | 'english';

export type PanelStates = 'configure' | 'confirm' | 'processing' | 'success';

interface ListNameForSaleModalProps {
  show: boolean;
  onClose: () => void;
  domainName: string;
  antId?: string;
}

const defaultWorkflowSteps: Record<
  string,
  {
    title: ReactNode;
    description: ReactNode;
    icon: ReactNode;
  }
> = {
  deposit: {
    title: 'Deposit Listing Fee',
    description: 'Deposit the listing fee to the marketplace',
    icon: <DollarSign className="w-4 h-4" />,
  },
  createIntent: {
    title: 'Create Intent',
    description: 'Create an intent to list the name for sale',
    icon: <DollarSign className="w-4 h-4" />,
  },
  transferANT: {
    title: 'Transfer ANT',
    description: 'Transfer the ANT to the marketplace',
    icon: <DollarSign className="w-4 h-4" />,
  },
  complete: {
    title: 'Complete',
    description: 'Name has been listed for sale',
    icon: <CheckIcon className="w-4 h-4" />,
  },
};

function ListNameForSaleModal({
  show,
  onClose,
  domainName,
  antId,
}: ListNameForSaleModalProps) {
  const [{ arioTicker, marketplaceProcessId, arioContract, aoClient }] =
    useGlobalState();
  const [{ wallet, walletAddress }] = useWalletState();
  const { data: arIoPrice } = useArIoPrice();
  const { data: marketplaceInfo } = useMarketplaceInfo();
  const { data: userAssets } = useMarketplaceUserAssets();
  const queryClient = useQueryClient();

  const [listingType, setListingType] = useState<ListingType>('fixed');
  const [panelState, setPanelState] = useState<PanelStates>('configure');
  const [listingPrice, setListingPrice] = useState<number>(0);
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(
    new Date(Date.now() + 60 * 60 * 1000), // Default to 1 hour from now (current day)
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // Check for existing intents - if there's an intent, we should show a warning
  const { hasIntent, isLoading: intentLoading } = useANTIntent(antId);

  // Calculate marketplace fees
  const feeDetails = useMemo(() => {
    if (!marketplaceInfo?.fees || !expirationDate) {
      return {
        listingFee: 0,
        saleTax: 0,
        totalFees: 0,
        youWillReceive: listingPrice,
      };
    }
    const expirationTime = expirationDate.getTime();
    const listingFee = calculateListingFee({
      listingFeePerHour: marketplaceInfo.fees.listingFeePerHour.toString(),
      endTimestamp: expirationTime,
    });
    const saleTax = calculateSaleTax({
      saleAmount: new ARIOToken(listingPrice).toMARIO().valueOf().toString(),
      saleTaxNumerator: marketplaceInfo.fees.saleTaxNumerator,
      saleTaxDenominator: marketplaceInfo.fees.saleTaxDenominator,
    });
    const totalFees = new mARIOToken(Number(listingFee + saleTax))
      .toARIO()
      .valueOf();

    // Only deduct sale tax from received amount - listing fee is paid upfront
    const youWillReceive =
      listingPrice - new mARIOToken(Number(saleTax)).toARIO().valueOf();

    return {
      listingFee: new mARIOToken(Number(listingFee.valueOf()))
        .toARIO()
        .valueOf(),
      saleTax: new mARIOToken(Number(saleTax.valueOf())).toARIO().valueOf(),
      totalFees,
      youWillReceive,
    };
  }, [listingPrice, expirationDate, marketplaceInfo?.fees]);

  // If there's a pending intent, we should prevent listing and show a message
  const hasPendingIntent = hasIntent && !intentLoading;

  const hasSufficientListingBalance = useMemo(() => {
    const liquidBalance = userAssets?.balances.balance
      ? new mARIOToken(Number(userAssets.balances.balance ?? 0))
          .toARIO()
          .valueOf()
      : 0;
    const listingFee = feeDetails.listingFee;
    return liquidBalance >= listingFee;
  }, [userAssets?.balances.balance, feeDetails.listingFee]);

  const [workflowSteps, setWorkflowSteps] =
    useState<
      Record<
        string,
        {
          title: ReactNode;
          description: ReactNode;
          icon: ReactNode;
        }
      >
    >(defaultWorkflowSteps);
  const [workflowComplete, setWorkflowComplete] = useState(false);
  const [workflowError, setWorkflowError] = useState(false);

  const updateWorkflowSteps = useCallback(
    ({
      step,
      status,
      description,
    }: {
      step: 'deposit' | 'createIntent' | 'transferANT' | 'complete';
      status: 'pending' | 'processing' | 'success' | 'error';
      description?: string;
    }) => {
      const DepositIcon = DollarSign;
      const IntentIcon = Handshake;
      const TransferIcon = Send;
      const CompleteIcon = CheckIcon;
      const ErrorIcon = XIcon;

      let CurrentIcon: React.ForwardRefExoticComponent<
        Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
      >;
      switch (step) {
        case 'deposit': {
          CurrentIcon = DepositIcon;
          break;
        }
        case 'createIntent': {
          CurrentIcon = IntentIcon;
          break;
        }
        case 'transferANT': {
          CurrentIcon = TransferIcon;
          break;
        }
        case 'complete': {
          CurrentIcon = CompleteIcon;
          break;
        }
        default: {
          CurrentIcon = ErrorIcon;
          break;
        }
      }
      switch (status) {
        case 'pending': {
          setWorkflowSteps((prev) => ({
            ...prev,
            [step]: {
              ...prev[step],
              icon: <CurrentIcon className="w-4 h-4 text-grey" />,
              description: description ?? prev[step].description,
            },
          }));
          break;
        }
        case 'processing': {
          setWorkflowSteps((prev) => ({
            ...prev,
            [step]: {
              ...prev[step],
              icon: <Loader className="w-4 h-4 animate-spin text-white" />,
              description: description ?? prev[step].description,
            },
          }));
          break;
        }
        case 'success': {
          setWorkflowSteps((prev) => ({
            ...prev,
            [step]: {
              ...prev[step],
              icon: <CurrentIcon className="w-4 h-4 text-success" />,
              description: description ?? prev[step].description,
            },
          }));
          break;
        }
        case 'error': {
          setWorkflowSteps((prev) => ({
            ...prev,
            [step]: {
              ...prev[step],
              icon: <CurrentIcon className="w-4 h-4 text-error" />,
              description: description ?? prev[step].description,
            },
          }));
          break;
        }
        default: {
          setWorkflowSteps((prev) => ({
            ...prev,
            [step]: {
              ...prev[step],
              icon: <CurrentIcon className="w-4 h-4 text-warning" />,
              title: 'Unknown Status',
              description:
                description ?? prev[step].description ?? 'Unknown Status',
            },
          }));
        }
      }
    },
    [],
  );

  if (!show) return null;

  function handleClose() {
    if (panelState === 'confirm') {
      if (window.confirm('Are you sure you want to cancel this listing?')) {
        onClose();
      }
    } else {
      onClose();
    }
  }

  function handleListingTypeChange(type: ListingType) {
    setListingType(type);
    setPanelState('configure');
  }

  const showListingTabs = panelState === 'configure';

  async function handleConfirmListing() {
    try {
      if (!wallet?.contractSigner) {
        throw new Error('Wallet not found');
      }
      if (!walletAddress) {
        throw new Error('Wallet address not found');
      }

      if (!expirationDate) {
        throw new Error('Expiration date is required');
      }
      if (expirationDate.getTime() < Date.now()) {
        throw new Error('Expiration date must be in the future');
      }
      if (expirationDate.getTime() > Date.now() + 1000 * 60 * 60 * 24 * 30) {
        throw new Error('Expiration date must be within next 30 days');
      }
      if (!userAssets) {
        throw new Error('User assets not found');
      }
      setIsLoading(true);
      setWorkflowComplete(false);
      setWorkflowError(false);

      // Reset workflow steps to default state and switch to processing panel
      setWorkflowSteps(defaultWorkflowSteps);
      setPanelState('processing');

      const shouldDeposit = !hasSufficientListingBalance;
      const writeMarketplaceContract = new ArNSMarketplaceWrite({
        process: new AOProcess({
          processId: marketplaceProcessId,
          ao: aoClient,
        }),
        signer: createAoSigner(wallet.contractSigner),
        ario: arioContract as AoARIOWrite,
      });

      // Step 1: Deposit listing fee (if needed)
      if (shouldDeposit) {
        updateWorkflowSteps({ step: 'deposit', status: 'processing' });

        // we need to calculate from the existing balance and deposit the difference
        const existingBalance = userAssets.balances.balance
          ? new mARIOToken(Number(userAssets.balances.balance ?? 0))
              .toARIO()
              .valueOf()
          : 0;
        // if we should deposit the listing fee is greater than the existing balance, we need to deposit the difference. 1 ARIO is the minimum deposit
        const difference = Math.max(
          1,
          Math.round(feeDetails.listingFee - existingBalance),
        ).toString();

        try {
          await writeMarketplaceContract.depositArIO({
            amount: new ARIOToken(Number(difference))
              .toMARIO()
              .valueOf()
              .toString(),
          });

          let newARIOBalance = 0;
          let tries = 0;
          const maxTries = 10;
          while (newARIOBalance < feeDetails.listingFee) {
            try {
              const userBalanceResult =
                await writeMarketplaceContract.getMarketplaceBalance({
                  address: walletAddress.toString(),
                });

              newARIOBalance = new mARIOToken(
                Number(userBalanceResult?.balance ?? 0),
              )
                .toARIO()
                .valueOf();
              console.log({
                newARIOBalance,
                listingFee: feeDetails.listingFee,
                tries,
                maxTries,
              });
              if (
                tries >= maxTries ||
                newARIOBalance <= feeDetails.listingFee
              ) {
                throw new Error('Failed to deposit enough ARIO');
              }
            } catch (error) {
              tries++;
              console.error(error);
              if (tries >= maxTries) {
                throw error;
              }
              // allow for cranking time for message passing
              await sleep(7000);
            }
          }

          updateWorkflowSteps({
            step: 'deposit',
            status: 'success',
            description: `Deposited ${difference} ${arioTicker}`,
          });
        } catch (error) {
          updateWorkflowSteps({
            step: 'deposit',
            status: 'error',
            description: 'Failed to deposit listing fee',
          });
          throw error;
        }
      } else {
        // Mark deposit as success if no deposit needed
        updateWorkflowSteps({
          step: 'deposit',
          status: 'success',
          description: 'Sufficient balance available',
        });
      }

      // Step 2: Create intent and transfer ANT
      updateWorkflowSteps({ step: 'createIntent', status: 'processing' });

      let result: Awaited<
        ReturnType<typeof writeMarketplaceContract.listNameForSale>
      >;

      try {
        switch (listingType) {
          case 'fixed': {
            // Mark intent as processing, then transfer
            updateWorkflowSteps({
              step: 'createIntent',
              status: 'processing',
              description: 'Creating listing intent...',
            });

            result = await writeMarketplaceContract.listNameForSale({
              name: domainName,
              expirationTime: expirationDate.getTime(),
              price: listingPrice.toString(),
              type: 'fixed',
              walletAddress: walletAddress.toString(),
              onProgress: (event: ListNameForSaleProgressEvent) => {
                console.log('event', event);
                switch (event.step) {
                  case 'transferring-ant': {
                    // Intent created successfully
                    updateWorkflowSteps({
                      step: 'createIntent',
                      status: 'success',
                      description: 'Intent created',
                    });
                    updateWorkflowSteps({
                      step: 'transferANT',
                      status: 'processing',
                      description: 'Transferring ANT to marketplace...',
                    });
                    break;
                  }
                  default: {
                    return;
                  }
                }
              },
            });
            if (result.intent) {
              updateWorkflowSteps({
                step: 'createIntent',
                status: 'success',
                description: 'Intent created',
              });
            }

            // Step 3: Transfer ANT
            if (result.antTransferResult?.id) {
              updateWorkflowSteps({
                step: 'transferANT',
                status: 'success',
                description: 'ANT transferred to marketplace',
              });
            } else {
              updateWorkflowSteps({
                step: 'transferANT',
                status: 'error',
                description: 'Failed to transfer ANT',
              });
            }

            // we need to reset the query states for orders and ant state.
            queryClient.resetQueries({
              predicate: (query) =>
                query.queryKey.some(
                  (key: unknown) =>
                    typeof key === 'string' && key.startsWith('marketplace'),
                ),
            });
            queryClient.resetQueries({
              predicate: (query) =>
                query.queryKey.some(
                  (key: unknown) =>
                    (typeof key === 'string' && key.includes(domainName)) ||
                    (typeof key === 'string' && key.includes(antId ?? '')),
                ),
            });

            break;
          }
          default:
            throw new Error('Invalid listing type');
        }
      } catch (error) {
        updateWorkflowSteps({
          step: 'createIntent',
          status: 'error',
          description: 'Failed to create listing',
        });
        throw error;
      }

      // Step 4: Complete
      if (result.antTransferResult?.id) {
        updateWorkflowSteps({
          step: 'complete',
          status: 'success',
          description: 'Listing complete!',
        });

        setWorkflowComplete(true);
        setWorkflowError(false);

        eventEmitter.emit('success', {
          name: 'List Name for Sale',
          message: (
            <span>
              Listed {domainName} for sale for {listingPrice} {arioTicker}. This
              may take a few minutes to complete.
              <br />
              <Link
                to={`/marketplace/names/${domainName}`}
                className="text-link"
              >
                View on Marketplace
              </Link>
              <br />
              <span>
                View transfer on aolink{' '}
                <ArweaveID
                  id={new ArweaveTransactionID(result.antTransferResult.id)}
                  type={ArweaveIdTypes.INTERACTION}
                  shouldLink
                  characterCount={8}
                />
              </span>
            </span>
          ),
        });
      } else {
        updateWorkflowSteps({
          step: 'complete',
          status: 'error',
          description: 'Listing failed',
        });

        setWorkflowComplete(true);
        setWorkflowError(true);

        eventEmitter.emit('error', {
          name: 'Listing Failed',
          message: 'Failed to transfer ANT to marketplace',
        });
      }

      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey?.[0]?.toString().includes('marketplace') ?? false,
      });
    } catch (error) {
      setWorkflowComplete(true);
      setWorkflowError(true);
      eventEmitter.emit('error', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Don't show the modal if there's a pending intent
  if (hasPendingIntent) {
    return null; // The intent should be handled through the domains table workflow
  }

  return (
    <div className="modal-container relative">
      <div className="flex flex-col rounded bg-metallic-grey border border-dark-grey gap-2 w-[32rem] overflow-hidden">
        {/* Header */}
        <div className="flex w-full p-6 py-4 text-white border-b border-dark-grey justify-between">
          <span className="flex gap-2 text-lg">
            List Name for Sale{' '}
            <Tooltip
              tooltipOverrides={{
                overlayInnerStyle: {
                  border: '1px solid var(--text-faded)',
                },
              }}
              message={
                <div className="text-sm text-light-grey flex flex-col gap-2 p-2">
                  List your ArNS name on the marketplace for other users to
                  purchase. You will retain ownership until the sale is
                  completed.
                  <Link
                    className="underline w-full flex text-link justify-end"
                    to="https://docs.ar.io/build/guides/arns-marketplace"
                    target="_blank"
                  >
                    Learn more
                  </Link>
                </div>
              }
            />
          </span>
          <button onClick={handleClose}>
            <XIcon className="size-5" />
          </button>
        </div>

        {/* Domain Name Display - Only show on configure screen */}
        {showListingTabs && (
          <div className="flex px-6 pt-2">
            <div className="flex items-center gap-2 text-white">
              <span className="text-sm text-grey">Name:</span>
              <span className="font-medium">{domainName}</span>
            </div>
          </div>
        )}

        {/* Listing Type Tabs - Only show on configure screen */}
        {showListingTabs && (
          <div className="flex px-6 pt-4">
            <div className="flex bg-dark-grey rounded-lg p-1 w-full">
              <button
                className={`flex-1 flex items-center justify-center gap-2 px-2 py-1 rounded-md text-sm font-medium transition-all ${
                  listingType === 'fixed'
                    ? 'bg-white text-black'
                    : 'text-grey hover:text-white'
                }`}
                onClick={() => handleListingTypeChange('fixed')}
              >
                <DollarSign className="w-4 h-4" />
                Fixed Price
              </button>
              <Tooltip
                tooltipOverrides={{
                  color: 'var(--text-faded)',
                  autoAdjustOverflow: true,
                  placement: 'top',
                }}
                message="Coming Soon"
                icon={
                  <button
                    className="flex-1 flex items-center justify-center gap-2 px-2 py-1 rounded-md text-sm font-medium text-grey opacity-50 cursor-not-allowed"
                    disabled
                  >
                    <TrendingDown className="w-4 h-4" />
                    Dutch Auction
                  </button>
                }
              />

              <Tooltip
                tooltipOverrides={{
                  color: 'var(--text-faded)',
                  autoAdjustOverflow: true,
                  placement: 'top',
                }}
                message="Coming Soon"
                icon={
                  <button
                    className="flex-1 flex items-center justify-center gap-2 px-2 py-1 rounded-md text-sm font-medium text-grey opacity-50 cursor-not-allowed"
                    disabled
                  >
                    <Gavel className="w-4 h-4" />
                    English Auction
                  </button>
                }
              />
            </div>
          </div>
        )}

        {/* Panel Content */}
        <Tabs.Root value={panelState} className="flex h-full w-full text-white">
          {/* Fixed Price Panel */}
          <Tabs.Content
            value="configure"
            className={`flex flex-col rounded h-full data-[state=inactive]:size-0 data-[state=active]:size-full data-[state=inactive]:opacity-0 transition-all duration-300 ease-in-out`}
          >
            {listingType === 'fixed' && (
              <FixedPricePanel
                domainName={domainName}
                antId={antId}
                listingPrice={listingPrice}
                setListingPrice={setListingPrice}
                arIoPrice={arIoPrice}
                arioTicker={arioTicker}
                expirationDate={expirationDate}
                setExpirationDate={setExpirationDate}
                onNext={() => {
                  setPanelState('confirm');
                }}
                disableNext={listingPrice <= 0 || !expirationDate}
              />
            )}
          </Tabs.Content>

          {/* Confirm Panel */}
          <Tabs.Content
            value="confirm"
            className={`flex flex-col rounded h-full data-[state=inactive]:size-0 data-[state=active]:size-full data-[state=inactive]:opacity-0 transition-all duration-300 ease-in-out`}
          >
            <ConfirmListingPanel
              domainName={domainName}
              antId={antId}
              listingType={listingType}
              listingPrice={listingPrice}
              arioTicker={arioTicker}
              arIoPrice={arIoPrice}
              expirationDate={expirationDate}
              listingFee={feeDetails.listingFee}
              saleTax={feeDetails.saleTax}
              youWillReceive={feeDetails.youWillReceive}
              onConfirm={handleConfirmListing}
              onCancel={() => setPanelState('configure')}
              isLoading={isLoading}
            />
          </Tabs.Content>

          {/* Processing Panel */}
          <Tabs.Content
            value="processing"
            className={`flex flex-col rounded h-full data-[state=inactive]:size-0 data-[state=active]:size-full data-[state=inactive]:opacity-0 transition-all duration-300 ease-in-out`}
          >
            <ProcessTransactionPanel
              domainName={domainName}
              workflowSteps={workflowSteps}
              isComplete={workflowComplete}
              hasError={workflowError}
              onClose={onClose}
            />
          </Tabs.Content>

          {/* Success Panel - kept for backwards compatibility */}
          <Tabs.Content
            value="success"
            className={`flex flex-col rounded h-full data-[state=inactive]:size-0 data-[state=active]:size-full data-[state=inactive]:opacity-0 transition-all duration-300 ease-in-out`}
          >
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <h3 className="text-lg font-medium mb-4">Listing Successful</h3>
              <p className="text-grey mb-6">
                Your name has been listed on the marketplace.
              </p>
              <button
                className="bg-primary text-black px-6 py-2 rounded hover:bg-primary-dark transition-colors"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}

export default ListNameForSaleModal;
