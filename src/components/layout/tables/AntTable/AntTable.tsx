import { useEffect, useState } from 'react';

import { defaultDataProvider } from '../../../../services/arweave';
import { useGlobalState } from '../../../../state/contexts/GlobalState';
import { ArweaveTransactionId } from '../../../../types.js';
import {
  BookmarkIcon,
  BorderOuterIcon,
  FileCodeIcon,
  RefreshAlertIcon,
} from '../../../icons';
import CopyTextButton from '../../../inputs/buttons/CopyTextButton/CopyTextButton';
import Loader from '../../Loader/Loader';
import RowItem from '../RowItem/RowItem';
import './styles.css';

type AntMetadata = {
  domain?: string;
  targetID?: string;
  confirmations?: number;
};
type TableData = {
  [x: ArweaveTransactionId]: AntMetadata | undefined;
};
function AntTable({ antIds, reload }: { antIds: string[]; reload?: boolean }) {
  const [{ arweave }] = useGlobalState();
  const [tableItems, setTableItems] = useState<TableData>({});

  useEffect(() => {
    const preloadedItems = antIds.reduce(
      (acc: TableData, id: string) => ({
        ...acc,
        [id]: undefined,
      }),
      {},
    );
    setTableItems(preloadedItems);
    fetchRowDetails(antIds).catch((err: Error) => console.error(err));
  }, [antIds, reload]);
  // todo: make each row item responsible for loading its state to improve UX, we want to see the row items, and THEN the info they contain

  async function fetchRowDetails(ids: string[]) {
    const updatedItems = tableItems;
    const dataProvider = defaultDataProvider(arweave);
    for (const id of ids) {
      const state = await dataProvider.getContractState(id);
      const fetchedItem = {
        domain: state.name,
        targetID: state.records['@'] ?? 'N/A',
        confirmations: await dataProvider.getContractConfirmations(id),
      };
      updatedItems[id] = fetchedItem;
    }
    //  TODO: bulk update rows for now, move to above to individually resolve rows without jitter
    setTableItems(updatedItems);
  }

  return (
    <div className="flex-column center">
      <table className="assets-table">
        <thead>
          <tr className="assets-table-header">
            <td className="assets-table-item">
              Nickname&nbsp;
              <BookmarkIcon
                width={'20px'}
                height={'30px'}
                fill={'var(--text-faded)'}
              />
            </td>
            <td className="assets-table-item">
              Contract ID&nbsp;
              <FileCodeIcon
                width={'20px'}
                height={'30px'}
                fill={'var(--text-faded)'}
              />
            </td>
            <td className="assets-table-item">
              Target ID&nbsp;
              <BorderOuterIcon
                width={'20px'}
                height={'30px'}
                fill={'var(--text-faded)'}
              />
            </td>
            <td className="assets-table-item">
              Status&nbsp;
              <RefreshAlertIcon
                width={'20px'}
                height={'30px'}
                fill={'var(--text-faded)'}
              />
            </td>
          </tr>
        </thead>
        <tbody
          className="flex-column center"
          style={{ gap: '.5em', minHeight: 200 }}
        >
          {Object.entries(tableItems).map(([id, details]) => (
            <RowItem
              key={id}
              details={{
                1: details?.domain ? details.domain : <Loader size={20} />,
                2: (
                  <CopyTextButton
                    displayText={`${id.slice(0, 6)}...${id.slice(-6)}`}
                    copyText={id}
                    size={24}
                  />
                ),
                3: details?.targetID ? (
                  <CopyTextButton
                    displayText={`${details.targetID.slice(
                      0,
                      6,
                    )}...${details.targetID.slice(-6)}`}
                    copyText={details.targetID}
                    size={24}
                  />
                ) : (
                  <Loader size={24} />
                ),
                4: details?.confirmations ? (
                  `${details.confirmations} / 50`
                ) : (
                  <Loader size={24} />
                ),
              }}
              bgColor={'#1E1E1E'}
              textColor={'var(--text-white)'}
            />
          ))}
        </tbody>
      </table>
      {/* <Paginator
        itemCount={antIds?.length}
        itemsPerPage={maxItemCount}
        pageRange={pageRange}
        setPageRange={setPageRange}
      /> */}
    </div>
  );
}

export default AntTable;
