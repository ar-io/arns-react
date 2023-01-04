import { Dispatch, SetStateAction } from 'react';

import './styles.css';

function WorkflowButtons({
  stage,
  isFirstStage,
  isLastStage,
  dispatch,
  showBack,
  showNext,
  disableNext,
  disableBack,
  handleNext,
}: {
  stage: number;
  isFirstStage: boolean;
  isLastStage: boolean;
  dispatch: Dispatch<SetStateAction<any>>;
  showBack?: boolean;
  showNext?: boolean;
  disableNext?: boolean;
  disableBack?: boolean;
  handleNext: () => void;
}) {
  return (
    <>
      <div className="flex-row center">
        {!isFirstStage && showBack ? (
          <button
            className="outline-button"
            disabled={disableBack}
            onClick={() =>
              !isFirstStage
                ? dispatch({
                    type: 'setStage',
                    payload: stage - 1,
                  })
                : null
            }
          >
            Back
          </button>
        ) : (
          <></>
        )}
        {!isLastStage && showNext ? (
          <button
            className={
              disableNext ? 'accent-button disabled-button' : 'accent-button'
            }
            disabled={disableNext}
            onClick={handleNext}
          >
            Next
          </button>
        ) : (
          <></>
        )}
      </div>
    </>
  );
}

export default WorkflowButtons;
