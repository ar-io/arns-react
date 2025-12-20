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
    <ol className="relative">
      {Object.entries(steps).map(([step, { title, description, icon }]) => (
        <li className="mb-10 ms-7" key={step}>
          <span className="absolute flex items-center justify-center w-8 h-8 rounded-full -start-4 ring-4 ring-buffer">
            {icon}
          </span>
          <h3 className="font-medium leading-tight">{title}</h3>
          <p className="text-sm">{description}</p>
        </li>
      ))}
    </ol>
  );
}
