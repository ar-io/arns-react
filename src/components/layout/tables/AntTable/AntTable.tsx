import { useEffect, useState } from 'react';

import {
  BookmarkIcon,
  BorderOuterIcon,
  FileCodeIcon,
  RefreshAlertIcon,
} from '../../../icons';
import AntRow from '../AntRow/AntRow';
import './styles.css';

function AntTable({ antIds, reload }: { antIds: string[]; reload: boolean }) {
  // eslint-disable-next-line
  const [tableItems, setTableItems] = useState([<></>]);

  useEffect(() => {
    updateTableItems()
      .then((items) => setTableItems(items))
      .catch((err: Error) => console.error(err));
  }, [antIds, reload]);

  async function updateTableItems() {
    const items = [];
    for (const id of antIds) {
      items.push(
        <AntRow
          antId={id}
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
