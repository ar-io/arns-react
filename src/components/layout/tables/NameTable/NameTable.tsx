import { useState } from 'react';

import {
  CalendarTimeIcon,
  LinkIcon,
  PriceTagIcon,
  RefreshAlertIcon,
} from '../../../icons';
import Paginator from '../../../inputs/Paginator/Paginator';
import './styles.css';

function NameTable() {
  const [pageRange, setPageRange] = useState<Array<number>>([0, 10]);

  return (
    <div className="flex-column center">
      <table className="assets-table">
        <thead>
          <tr className="assets-table-header">
            <td className="assets-table-item">
              Name&nbsp;
              <LinkIcon
                width={'20px'}
                height={'30px'}
                fill={'var(--text-faded)'}
              />
            </td>
            <td className="assets-table-item">
              Tier&nbsp;
              <PriceTagIcon
                width={'20px'}
                height={'30px'}
                fill={'var(--text-faded)'}
              />
            </td>
            <td className="assets-table-item">
              Expiry Date&nbsp;
              <CalendarTimeIcon
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
        <tbody></tbody>
      </table>
      <Paginator
        itemCount={500}
        itemsPerPage={20}
        pageRange={pageRange}
        setPageRange={setPageRange}
      />
    </div>
  );
}

export default NameTable;
