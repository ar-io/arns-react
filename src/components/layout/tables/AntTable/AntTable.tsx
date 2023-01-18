import React from 'react';

import { useIsMobile } from '../../../../hooks';
import {
  BookmarkIcon,
  BorderOuterIcon,
  FileCodeIcon,
  RefreshAlertIcon,
} from '../../../icons';
import AntRow from '../AntRow/AntRow';
import './styles.css';

function AntTable({ antIds }: { antIds: string[] }) {
  const isMobile = useIsMobile();

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
            <td className="assets-table-item center">
              Contract ID&nbsp;
              <FileCodeIcon
                width={'20px'}
                height={'30px'}
                fill={'var(--text-faded)'}
              />
            </td>
            {isMobile ? (
              <></>
            ) : (
              <td className="assets-table-item center">
                Target ID&nbsp;
                <BorderOuterIcon
                  width={'20px'}
                  height={'30px'}
                  fill={'var(--text-faded)'}
                />
              </td>
            )}
            <td className="assets-table-item center">
              Status&nbsp;
              <RefreshAlertIcon
                width={'20px'}
                height={'30px'}
                fill={'var(--text-faded)'}
              />
            </td>
            {isMobile ? <></> : <td className="assets-table-item"></td>}
          </tr>
        </thead>
        <tbody
          className="flex-column center"
          style={{ gap: '.5em', minHeight: 200 }}
        >
          {antIds.map((id, index) => (
            <AntRow
              antId={id}
              bgColor={'#1E1E1E'}
              textColor={'var(--text-white)'}
              key={index}
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
