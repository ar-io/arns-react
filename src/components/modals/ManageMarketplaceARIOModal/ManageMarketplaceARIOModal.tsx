import { ArrowDownIcon, ArrowUpIcon, XIcon } from 'lucide-react';
import { Tabs } from 'radix-ui';
import { useState } from 'react';

import DepositPanel from './panels/DepositPanel';
import WithdrawPanel from './panels/WithdrawPanel';

export type TabType = 'deposit' | 'withdraw';

interface ManageMarketplaceARIOModalProps {
  show: boolean;
  onClose: () => void;
}

function ManageMarketplaceARIOModal({
  show,
  onClose,
}: ManageMarketplaceARIOModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('deposit');

  if (!show) return null;

  return (
    <div className="modal-container relative">
      <div className="flex flex-col rounded bg-metallic-grey border border-dark-grey gap-2 w-[30rem] overflow-hidden">
        {/* Header */}
        <div className="flex w-full p-6 py-4 text-white border-b border-dark-grey justify-between">
          <span className="flex gap-2 text-lg">Manage Marketplace Balance</span>
          <button onClick={onClose}>
            <XIcon className="size-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex px-4 pt-4">
          <div className="flex bg-dark-grey rounded-lg p-1 w-full">
            <button
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'deposit'
                  ? 'bg-white text-black'
                  : 'text-grey hover:text-white'
              }`}
              onClick={() => setActiveTab('deposit')}
            >
              <ArrowDownIcon className="w-4 h-4" />
              Deposit
            </button>
            <button
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'withdraw'
                  ? 'bg-white text-black'
                  : 'text-grey hover:text-white'
              }`}
              onClick={() => setActiveTab('withdraw')}
            >
              <ArrowUpIcon className="w-4 h-4" />
              Withdraw
            </button>
          </div>
        </div>

        {/* Panel Content */}
        <Tabs.Root value={activeTab} className="flex h-full w-full text-white">
          {/* Deposit Panel */}
          <Tabs.Content
            value="deposit"
            className={`flex flex-col rounded h-full data-[state=inactive]:size-0 data-[state=active]:size-full data-[state=inactive]:opacity-0 transition-all duration-300 ease-in-out`}
          >
            <DepositPanel onClose={onClose} />
          </Tabs.Content>

          {/* Withdraw Panel */}
          <Tabs.Content
            value="withdraw"
            className={`flex flex-col rounded h-full data-[state=inactive]:size-0 data-[state=active]:size-full data-[state=inactive]:opacity-0 transition-all duration-300 ease-in-out`}
          >
            <WithdrawPanel onClose={onClose} />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}

export default ManageMarketplaceARIOModal;
