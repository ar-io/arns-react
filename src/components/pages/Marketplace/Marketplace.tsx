import MarketplaceListingsTable from '@src/components/data-display/tables/MarketplaceListingsTable';
import { ManageMarketplaceARIOModal } from '@src/components/modals';
import { useGlobalState } from '@src/state';
import { useState } from 'react';

export default function Marketplace() {
  const [{ arioTicker }] = useGlobalState();

  const [showManageModal, setShowManageModal] = useState(false);

  const handleManageClick = () => {
    setShowManageModal(true);
  };

  const handleCloseManageModal = () => {
    setShowManageModal(false);
  };

  return (
    <div className="page">
      <div className="flex w-full justify-between items-center">
        <h1 className="text-white text-4xl font-bold">Marketplace</h1>
        <button
          className="border-white border text-white px-4 py-2 rounded hover:bg-white hover:text-black transition-colors"
          onClick={handleManageClick}
        >
          Manage {arioTicker}
        </button>
      </div>
      <div className="flex w-full gap-6 mt-8">
        <MarketplaceListingsTable />
      </div>

      {/* Manage Marketplace Balance Modal */}
      <ManageMarketplaceARIOModal
        show={showManageModal}
        onClose={handleCloseManageModal}
      />
    </div>
  );
}
