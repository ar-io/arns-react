import { useEffect, useState } from 'react';

import { useIsMobile } from '../../../../hooks';
import { defaultDataProvider } from '../../../../services/arweave';
import { TEST_ANT_BALANCE } from '../../../../utils/constants';
import { getAntConfirmations } from '../../../../utils/searchUtils';
import {
  AlertCircle,
  AlertTriangleIcon,
  BookmarkIcon,
  BorderOuterIcon,
  CircleCheck,
  FileCodeIcon,
  RefreshAlertIcon,
} from '../../../icons';
import Paginator from '../../../inputs/Paginator/Paginator';
import CopyTextButton from '../../../inputs/buttons/CopyTextButton/CopyTextButton';
import ManageAssetButtons from '../../../inputs/buttons/ManageAssetButtons/ManageAssetButtons';
import Loader from '../../Loader/Loader';
import RowItem from '../RowItem/RowItem';
import './styles.css';

function AntTable() {
  const [pageRange, setPageRange] = useState<Array<number>>([0, 10]);
  const [maxItemCount, setMaxItemCount] = useState(10);
  const [tableItems, setTableItems] = useState([<></>]);

  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setLoading(true);
    setTableItems([<></>]);
    updateTableItems().then((items) => {
      setTableItems(items);
      setLoading(false);
    });
  }, [pageRange]);
  // todo: make each row item responsible for loading its state to improve UX, we want to see the row items, and THEN the info they contain

  async function updateTableItems() {
    const items = [];
    for (let i = pageRange[0]; i < pageRange[1]; i++) {
      const dataProvider = defaultDataProvider(TEST_ANT_BALANCE[i]);
      const state = await dataProvider.getContractState(TEST_ANT_BALANCE[i]);
      // todo: get status from arweave transaction manager instead of manual query here
      // todo: get txID's from connected user balance and/or favorited assets
      const confirmations = await getAntConfirmations(TEST_ANT_BALANCE[i]);
      const icon = () => {
        if (confirmations > 0 && confirmations < 50) {
          return (
            <AlertTriangleIcon width={20} height={20} fill={'var(--accent)'} />
          );
        }
        if (confirmations > 49) {
          return (
            <CircleCheck width={20} height={20} fill={'var(--success-green)'} />
          );
        }
        return (
          <AlertCircle width={20} height={20} fill={'var(--text-faded)'} />
        );
      };
      const name = () => {
        if (state.name.length > 20) {
          return `${state.name.slice(0, 10)}...${state.name.slice(-10)}`;
        }
        return state.name;
      };
      items.push(
        <RowItem
          col1={name()}
          col2={
            <CopyTextButton
              displayText={`${TEST_ANT_BALANCE[i].slice(
                0,
                6,
              )}...${TEST_ANT_BALANCE[i].slice(-6)}`}
              copyText={TEST_ANT_BALANCE[i]}
              size={24}
            />
          }
          col3={
            state.records['@'].transactionId ? (
              <CopyTextButton
                displayText={`${state.records['@'].transactionId.slice(
                  0,
                  6,
                )}...${state.records['@'].transactionId.slice(-6)}`}
                copyText={state.records['@'].transactionId}
                size={24}
              />
            ) : (
              'N/A'
            )
          }
          col4={
            <span className="text white bold center">
              {icon()}&nbsp;{!isMobile ? `${confirmations} / 50` : <></>}
            </span>
          }
          col5={
            <ManageAssetButtons asset={TEST_ANT_BALANCE[i]} assetType={'ant'} />
          }
          bgColor={'#1E1E1E'}
          textColor={'var(--text-white)'}
        />,
      );
    }
    return items;
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
          {tableItems ? tableItems : <></>}
          {loading ? <Loader size={100} /> : <></>}
        </tbody>
      </table>
      <Paginator
        itemCount={TEST_ANT_BALANCE.length}
        itemsPerPage={maxItemCount}
        pageRange={pageRange}
        setPageRange={setPageRange}
      />
    </div>
  );
}

export default AntTable;
