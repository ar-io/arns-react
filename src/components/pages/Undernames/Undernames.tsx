import UndernamesTable from '@src/components/data-display/tables/UndernamesTable';
import { SearchIcon } from '@src/components/icons';
import useDomainInfo from '@src/hooks/useDomainInfo';
import { useTransactionState } from '@src/state/contexts/TransactionState';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ArweaveTransactionID } from '../../../services/arweave/ArweaveTransactionID';
import { useWalletState } from '../../../state/contexts/WalletState';
import {
  formatForMaxCharCount,
  getOwnershipStatus,
  isArweaveTransactionID,
} from '../../../utils';
import eventEmitter from '../../../utils/events';
import TransactionSuccessCard from '../../cards/TransactionSuccessCard/TransactionSuccessCard';
import './styles.css';

function Undernames() {
  const navigate = useNavigate();
  const { id, name } = useParams();
  const {
    data: { arnsRecord, records, owner, controllers },
    isLoading: isLoadingDomainInfo,
    refetch,
  } = useDomainInfo({
    domain: name,
    antId: isArweaveTransactionID(id) ? id : undefined,
  });
  const [{ walletAddress }] = useWalletState();
  const [{ interactionResult, workflowName }, dispatchTransactionState] =
    useTransactionState();
  const [ownershipStatus, setOwnershipStatus] = useState<
    'controller' | 'owner' | undefined
  >(undefined);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    if (!id && !name) {
      eventEmitter.emit('error', new Error('Missing ANT transaction ID.'));
      navigate('/manage/ants');
      return;
    }
    setOwnershipStatus(
      getOwnershipStatus(owner, controllers, walletAddress?.toString() ?? ''),
    );
  }, [id, name, owner, controllers, walletAddress, isLoadingDomainInfo]);

  return (
    <>
      <div className="px-[100px]">
        <div className="flex-column">
          {interactionResult ? (
            <TransactionSuccessCard
              txId={new ArweaveTransactionID(interactionResult.id)}
              close={() => {
                dispatchTransactionState({
                  type: 'reset',
                });
              }}
              title={`${workflowName} completed`}
            />
          ) : (
            <></>
          )}
          <div className="flex flex-justify-between">
            <div
              className="flex flex-row"
              style={{ justifyContent: 'space-between' }}
            >
              <h2 className="white text-[2rem]">Manage Undernames</h2>
            </div>
          </div>

          <div>
            <div className="flex w-full p-3 border-x-[1px] border-t-[1px] border-dark-grey rounded-t-[5px] relative">
              <SearchIcon
                width={'18px'}
                height={'18px'}
                className="fill-white absolute top-[13.5px] left-[11px]"
              />
              <input
                className="pl-7 flex bg-background w-full focus:outline-none text-white placeholder:text-dark-grey"
                onChange={(e) => setSearch(e.target.value)}
                value={search}
                placeholder={`Search undernames on '${
                  name ?? formatForMaxCharCount(id ?? '', 10)
                }'`}
              />
            </div>
            <UndernamesTable
              undernames={records}
              arnsDomain={name}
              antId={arnsRecord?.processId}
              ownershipStatus={ownershipStatus}
              isLoading={isLoadingDomainInfo}
              filter={search}
              refresh={() => {
                refetch();
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Undernames;
