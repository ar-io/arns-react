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
}: {
  stage: number;
  isFirstStage: boolean;
  isLastStage: boolean;
  dispatch: Dispatch<SetStateAction<any>>;
  showBack?: boolean;
  showNext?: boolean;
  disableNext?: boolean;
  disableBack?: boolean;
}) {
  return (
    <>
      <div className="flex-row center">
        {!isFirstStage && showBack ? (
          <button
            className="hollowButton"
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
            className="accentButton"
            disabled={disableNext}
            onClick={() =>
              !isLastStage
                ? dispatch({
                    type: 'setStage',
                    payload: stage + 1,
                  })
                : null
            }
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
