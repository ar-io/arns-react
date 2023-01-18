import { useIsMobile } from '../../../../hooks';
import {
  BookmarkIcon,
  BorderOuterIcon,
  FileCodeIcon,
  RefreshAlertIcon,
} from '../../../icons';
import AntRow from '../AntRow/AntRow';
import './styles.css';

function AntTable({
  antIds,
  refresh,
}: {
  antIds: string[];
  refresh: () => void;
}) {
  const isMobile = useIsMobile();

  return (
    <div className="flex-column center">
      {antIds.length > 0 ? (
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
      ) : (
        <div
          className="flex-column center"
          style={{ width: '100%', height: '100%', padding: '2em' }}
        >
          <span className="text-large white bold">No ANT's found.</span>
          <button className="outline-button hover" onClick={() => refresh()}>
            Refresh
          </button>
        </div>
      )}
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
