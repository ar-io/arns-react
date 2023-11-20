import { CSSProperties } from 'react';

import { useIsMobile } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { SMARTWEAVE_TAG_SIZE } from '../../../utils/constants';
import ArPrice from '../ArPrice/ArPrice';

function TransactionCost({
  fee,
  info,
  showBorder = true,
  ioRequired = false,
  feeWrapperStyle,
}: {
  fee?: { [x: string]: number };
  info?: JSX.Element | string;
  showBorder?: boolean;
  ioRequired?: boolean;
  feeWrapperStyle?: CSSProperties;
}) {
  const isMobile = useIsMobile();
  const [{ ioTicker }] = useGlobalState();

  const feeError = fee?.io && fee.io < 0;

  return (
    <div
      className="flex flex-row"
      style={{
        borderBottom: showBorder ? 'solid 1px var(--text-faded)' : 'none',
        padding: '20px 0px',
        justifyContent: info ? 'space-between' : 'flex-end',
        alignItems: isMobile ? 'center' : 'flex-start',
        width: '100%',
        flexDirection: isMobile ? 'column' : 'row',
      }}
    >
      {info}
      <div
        className="flex flex-row"
        style={{
          gap: '1em',
          width: isMobile ? '100%' : 'fit-content',
          alignItems: 'flex-start',
        }}
      >
        <span className="text white">Cost:</span>
        <div
          className="flex flex-column"
          style={{
            gap: '0.2em',
            alignItems: 'flex-end',
            width: 'fit-content',
            ...feeWrapperStyle,
          }}
        >
          <span
            className="flex flex-row text white flex-right"
            style={{ gap: '5px', width: 'fit-content' }}
          >
            {feeError ? (
              'Unable to calculate fee'
            ) : (
              <>
                {fee?.[ioTicker]
                  ? `${fee?.[ioTicker].toLocaleString()} ${ioTicker} + `
                  : ioRequired
                  ? `Calculating ${ioTicker} + `
                  : ''}
                <ArPrice dataSize={SMARTWEAVE_TAG_SIZE} />
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

export default TransactionCost;
