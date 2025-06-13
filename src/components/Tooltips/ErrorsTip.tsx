import { XCircleIcon } from 'lucide-react';
import { ReactNode } from 'react';

import Tooltip from './Tooltip';

function ErrorsTip({
  errors,
  icon = <XCircleIcon width={'18px'} height={'18px'} className="text-error" />,
  tooltipOverrides,
}: {
  errors: Error[];
  icon?: ReactNode;
  tooltipOverrides?: Parameters<typeof Tooltip>[0]['tooltipOverrides'];
}) {
  const uniqueErrors = new Set(errors);
  return (
    <>
      <Tooltip
        message={
          <div className="flex fit-content flex-col gap-2">
            {[...uniqueErrors].map((e, i) => (
              <div
                key={i}
                className="flex flex-col border-b border-grey whitespace-nowrap py-1"
              >
                <span className="text-[1rem]">{e.name}:</span>
                <span className="text-error">{e.message}</span>
              </div>
            ))}
          </div>
        }
        {...tooltipOverrides}
        icon={icon}
      />
    </>
  );
}

export default ErrorsTip;
