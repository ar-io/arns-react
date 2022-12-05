import { Dispatch, SetStateAction } from 'react';

import './styles.css';

function WorkflowButtons({
  stage,
  isFirstStage,
  isLastStage,
  dispatch,
  showBack,
  showNext,
}: {
  stage: number;
  isFirstStage: boolean;
  isLastStage: boolean;
  dispatch: Dispatch<SetStateAction<any>>;
  showBack?: boolean;
  showNext?: boolean;
}) {
  return (
    <>
      <div className="flex-row center">
        {!isFirstStage && showBack ? (
          <button
            className="hollowButton"
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
