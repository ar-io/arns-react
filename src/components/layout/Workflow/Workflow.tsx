import { useEffect, useState } from 'react';

import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import { WorkflowProps } from '../../../types';

function Workflow(props: WorkflowProps) {
  const { stages } = props;
  const [{ stage }] = useRegistrationState();
  const [currentComp, setCurrentComp] = useState(<></>);

  useEffect(() => {
    Object.entries(stages).map(([key, value], index) => {
      if (index === stage) {
        console.log(stage);
        return setCurrentComp(value.component);
      }
    });
  }, [stage]);

  return <>{currentComp}</>;
}

export default Workflow;
