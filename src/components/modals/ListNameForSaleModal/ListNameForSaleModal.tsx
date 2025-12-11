import { Tooltip } from '@src/components/data-display';
import { useANTIntent } from '@src/hooks/useANTIntent';
import { useArIoPrice } from '@src/hooks/useArIOPrice';
import { useGlobalState, useWalletState } from '@src/state';
import { DollarSign, Gavel, TrendingDown, XIcon } from 'lucide-react';
import { Tabs } from 'radix-ui';
import { useState } from 'react';

import {
  AOProcess,
  AoARIOWrite,
  ArNSMarketplaceWrite,
  createAoSigner,
} from '@ar.io/sdk';
import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import eventEmitter from '@src/utils/events';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import ConfirmListingPanel from './panels/ConfirmListingPanel';
import FixedPricePanel from './panels/FixedPricePanel';

export type ListingType = 'fixed' | 'dutch' | 'english';

export type PanelStates = 'configure' | 'confirm' | 'success';

interface ListNameForSaleModalProps {
  show: boolean;
  onClose: () => void;
  domainName: string;
  antId?: string;
}

function ListNameForSaleModal({
  show,
  onClose,
  domainName,
  antId,
}: ListNameForSaleModalProps) {
  const [{ arioTicker, aoClient, marketplaceProcessId, arioContract }] =
    useGlobalState();
  const [{ wallet, walletAddress }] = useWalletState();
  const { data: arIoPrice } = useArIoPrice();
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

  // If there's a pending intent, we should prevent listing and show a message
  const hasPendingIntent = hasIntent && !intentLoading;

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
      setIsLoading(true);
      const writeMarketplaceContract = new ArNSMarketplaceWrite({
        process: new AOProcess({
          processId: marketplaceProcessId,
          ao: aoClient,
        }),
        signer: createAoSigner(wallet.contractSigner),
        ario: arioContract as AoARIOWrite,
      });
      let result: Awaited<
        ReturnType<typeof writeMarketplaceContract.listNameForSale>
      >;
      switch (listingType) {
        case 'fixed': {
          result = await writeMarketplaceContract.listNameForSale({
            name: domainName,
            expirationTime: expirationDate.getTime(),
            price: listingPrice.toString(),
            type: 'fixed',
            walletAddress: walletAddress.toString(),
          });

          break;
        }
        default:
          throw new Error('Invalid listing type');
      }
      eventEmitter.emit('success', {
        name: 'List Name for Sale',
        message: (
          <span>
            Listed {domainName} for sale for {listingPrice} {arioTicker}. This
            may take a few minutes to complete.
            <br />
            <br />
            <Link to={`/marketplace/names/${domainName}`} className="text-link">
              View on Marketplace
            </Link>
            <br />
            <br />
            <span>
              View transfer on aolink{' '}
              <ArweaveID
                id={new ArweaveTransactionID(result.antTransferResult?.id)}
                type={ArweaveIdTypes.INTERACTION}
              />
            </span>
          </span>
        ),
      });
      setPanelState('success');
      queryClient.invalidateQueries({ queryKey: ['marketplace'] });
    } catch (error) {
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
              onConfirm={handleConfirmListing}
              onCancel={() => setPanelState('configure')}
              isLoading={isLoading}
            />
          </Tabs.Content>

          {/* Success Panel - TODO: Implement */}
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
