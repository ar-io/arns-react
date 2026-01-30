import { Tooltip } from '@src/components/ui/Tooltip';
import { XCircleIcon } from 'lucide-react';
import { ReactNode } from 'react';

function ErrorsTip({
  errors,
  icon = <XCircleIcon width={'18px'} height={'18px'} className="text-error" />,
}: {
  errors: Error[];
  icon?: ReactNode;
  tooltipOverrides?: Record<string, unknown>;
}) {
  const uniqueErrors = new Set(errors);
  return (
    <Tooltip
      content={
        <div className="flex w-fit flex-col gap-2">
          {[...uniqueErrors].map((e, i) => (
            <div
              key={i}
              className="flex flex-col border-b border-muted whitespace-nowrap py-1"
            >
              <span className="text-[1rem]">{e.name}:</span>
              <span className="text-error">{e.message}</span>
            </div>
          ))}
        </div>
      }
      contentClassName="max-w-md p-4"
    >
      <span className="cursor-pointer inline-flex">{icon}</span>
    </Tooltip>
  );
}

export default ErrorsTip;
