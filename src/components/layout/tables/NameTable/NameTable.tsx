import { useState } from 'react';

import Paginator from '../../../inputs/Paginator/Paginator';
import './styles.css';

function NameTable({ columns }: { columns: { [x: string]: JSX.Element } }) {
  const [pageRange, setPageRange] = useState<Array<number>>([0, 10]);

  return (
    <div className="flex-column center">
      <table className="assets-table">
        <thead>
          <tr className="assets-table-header">
            {Object.entries(columns).map(([name, icon], index) => (
              <td className="assets-table-item" key={index}>
                {name}&nbsp;
                {icon}
              </td>
            ))}
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
