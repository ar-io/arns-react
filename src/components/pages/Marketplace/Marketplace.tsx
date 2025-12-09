import { DepositARIOToMarketplaceModal } from '@src/components/modals';
import { useGlobalState } from '@src/state';
import { useState } from 'react';

export default function Marketplace() {
  const [{ arioTicker }] = useGlobalState();

  const [showDepositModal, setShowDepositModal] = useState(false);

  const handleDepositClick = () => {
    setShowDepositModal(true);
  };

  const handleCloseDepositModal = () => {
    setShowDepositModal(false);
  };

  return (
    <div className="page">
      <div className="flex w-full justify-between items-center">
        <h1 className="text-white text-4xl font-bold">Marketplace</h1>
        <button
          className="border-white border text-white px-4 py-2 rounded hover:bg-white hover:text-black transition-colors"
          onClick={handleDepositClick}
        >
          Deposit {arioTicker}
        </button>
      </div>
      <div className="flex flex-col gap-4">{/* TODO: listings */}</div>

      {/* Deposit Modal */}
      <DepositARIOToMarketplaceModal
        show={showDepositModal}
        onClose={handleCloseDepositModal}
      />
    </div>
  );
}
