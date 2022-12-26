import { table } from 'console';
import { useEffect, useState } from 'react';

import { defaultDataProvider } from '../../../../services/arweave';
import { TEST_ANT_BALANCE } from '../../../../utils/constants';
import {
  BookmarkIcon,
  BorderOuterIcon,
  FileCodeIcon,
  RefreshAlertIcon,
} from '../../../icons';
import Paginator from '../../../inputs/Paginator/Paginator';
import RowItem from '../RowItem/RowItem';
import './styles.css';

function AntTable() {
  const [pageRange, setPageRange] = useState<Array<number>>([0, 10]);
  const [maxItemCount, setMaxItemCount] = useState(10);
  const [tableItems, setTableItems] = useState([<></>]);

  // useEffect(()=>{

  //     updateTableItems().then(items => setTableItems(items))

  // },[])

  // async function updateTableItems(){
  //     const items = []
  //     for(let i = pageRange[0]; i < pageRange[1]; i++){
  //         const dataProvider = defaultDataProvider()
  //         const state = await dataProvider.getContractState(TEST_ANT_BALANCE[i])
  //         // todo: get status from arweave transaction manager instead of manual query here
  //         // todo: get txID's from connected user balance and/or favorited assets

  //         items.push(
  //             <RowItem
  //             col1={state?.nickname}
  //             col2={TEST_ANT_BALANCE[i]}
  //             col3={state?.records["@"].transationId}
  //             col4={<span className='text white bold'>STATUS</span>}
  //             col5={<></>}
  //             bgColor={"#1E1E1E"}
  //             textColor={"var(--text-white)"}
  //             />
  //         )
  //     }
  //     return items
  // }

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
        <tbody>{tableItems}</tbody>
      </table>
      <Paginator
        itemCount={50}
        itemsPerPage={10}
        pageRange={pageRange}
        setPageRange={setPageRange}
      />
    </div>
  );
}

export default AntTable;
