import { SearchBarFooterProps } from '../../../types';
import ANTCard from '../../cards/ANTCard/ANTCard';
import './styles.css';

function SearchBarFooter({
  domain,
  record,
  processId,
  isAvailable,
}: SearchBarFooterProps): JSX.Element {
  return (
    <div
      className="flex-column flex"
      style={{ marginTop: '20px', boxSizing: 'border-box' }}
    >
      {!isAvailable && record && processId && domain ? (
        <>
          <span className="white text-medium flex-left flex flex-row">
            Ownership Details:
          </span>
          <ANTCard
            domain={domain}
            processId={processId}
            record={record}
            compact={true}
            bordered
            primaryDefaultKeys={[
              'processId',
              'domain',
              'leaseDuration',
              'owner',
            ]}
          />
        </>
      ) : (
        <></>
      )}
    </div>
  );
}
export default SearchBarFooter;
