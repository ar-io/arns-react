import { SMARTWEAVE_TAG_SIZE } from '../../../utils/constants';
import ArPrice from '../ArPrice/ArPrice';

function TransactionCost({
  fee,
  info,
}: {
  fee?: { io?: number; ar?: number };
  info?: JSX.Element | string;
}) {
  return (
    <div
      className="flex flex-row"
      style={{
        borderBottom: 'solid 1px var(--text-faded)',
        padding: '20px 0px',
        justifyContent: info ? 'space-between' : 'flex-end',
        alignItems: 'flex-start',
        width: '100%',
      }}
    >
      {info}
      <div
        className="flex flex-row"
        style={{ gap: '1em', alignItems: 'flex-start', width: 'fit-content' }}
      >
        <span className="text white">Cost:</span>
        <div
          className="flex flex-column"
          style={{
            gap: '0.2em',
            alignItems: 'flex-end',
            width: 'fit-content',
          }}
        >
          <span
            className="flex flex-row text white flex-right"
            style={{ gap: '5px', width: 'fit-content' }}
          >
            {fee?.io ? `${fee.io?.toLocaleString()} IO + ` : ''}
            <ArPrice dataSize={SMARTWEAVE_TAG_SIZE} />
          </span>

          {/* TODO: update usd when fiat api available */}
          <span className="text grey">(Approximately 0 USD)</span>
        </div>
      </div>
    </div>
  );
}

export default TransactionCost;
