import { Accordion as AccordionUI } from '@src/components/ui/Accordion';
import { ReactNode } from 'react';

import './styles.css';

function Accordion({
  children,
  title,
}: {
  children: ReactNode;
  title: ReactNode;
  bordered?: boolean;
}) {
  return (
    <AccordionUI
      title={title}
      className="w-full"
      triggerClassName="text-foreground font-bold"
      contentClassName="w-full"
    >
      {children}
    </AccordionUI>
  );
}

export default Accordion;
