import { ReactNode } from 'react';

export default function VerticalTimelineStepper({
  steps,
}: {
  steps: Record<
    string,
    {
      title: ReactNode;
      description: ReactNode;
      icon: ReactNode;
    }
  >;
}) {
  return (
    <ol className="relative gap-2">
      {Object.entries(steps).map(([, { title, description, icon }], i) => (
        <div key={i}>
          <li className="ms-7">
            <span className="absolute flex items-center justify-center w-8 h-8 rounded-full -start-4 ring-1 ring-dark-grey">
              {icon}
            </span>
            <div className="flex flex-col max-h-8 overflow-visible">
              {' '}
              <h3 className="text-md leading-tight">{title}</h3>
              <p className="text-xs text-grey">{description}</p>
            </div>
          </li>
          <div
            className={
              i === Object.entries(steps).length - 1
                ? ''
                : 'border-l border-dark-grey h-8'
            }
            key={`${i}-divider`}
          />
        </div>
      ))}
    </ol>
  );
}
