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
      className="flex flex-column"
      style={{ marginTop: '30px', boxSizing: 'border-box' }}
    >
      {!isAvailable && record && processId && domain ? (
        <>
          <span className="flex flex-row white text-medium flex-left">
            Ownership Details:
          </span>
          <ANTCard
            domain={domain}
            processId={processId}
            record={record}
            compact={true}
            bordered
          />
        </>
      ) : (
        <></>
      )}
    </div>
  );
}
export default SearchBarFooter;
