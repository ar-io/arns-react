import { Tooltip } from '@src/components/data-display';
import { useArIoPrice } from '@src/hooks/useArIOPrice';
import { useGlobalState } from '@src/state';
import { DollarSign, Gavel, TrendingDown, XIcon } from 'lucide-react';
import { Tabs } from 'radix-ui';
import { useState } from 'react';

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
  const [{ arioTicker }] = useGlobalState();
  const { data: arIoPrice } = useArIoPrice();

  const [listingType, setListingType] = useState<ListingType>('fixed');
  const [panelState, setPanelState] = useState<PanelStates>('configure');
  const [listingPrice, setListingPrice] = useState<number>(0);

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
                </div>
              }
            />
          </span>
          <button onClick={handleClose}>
            <XIcon className="size-5" />
          </button>
        </div>

        {/* Domain Name Display */}
        <div className="flex px-6 pt-2">
          <div className="flex items-center gap-2 text-white">
            <span className="text-sm text-grey">Listing:</span>
            <span className="font-medium">{domainName}</span>
          </div>
        </div>

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
                onNext={() => setPanelState('confirm')}
                disableNext={listingPrice <= 0}
              />
            )}
          </Tabs.Content>

          {/* Confirm Panel - TODO: Implement */}
          <Tabs.Content
            value="confirm"
            className={`flex flex-col rounded h-full data-[state=inactive]:size-0 data-[state=active]:size-full data-[state=inactive]:opacity-0 transition-all duration-300 ease-in-out`}
          >
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <h3 className="text-lg font-medium mb-4">Confirm Listing</h3>
              <p className="text-grey mb-6">
                Listing confirmation panel coming soon...
              </p>
              <button
                className="bg-white text-black px-6 py-2 rounded hover:bg-gray-200 transition-colors"
                onClick={() => setPanelState('configure')}
              >
                Back to Configure
              </button>
            </div>
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
                className="bg-white text-black px-6 py-2 rounded hover:bg-gray-200 transition-colors"
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
