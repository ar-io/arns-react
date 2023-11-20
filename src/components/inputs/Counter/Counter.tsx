import { CSSProperties } from 'react';

import { useLongPress } from '../../../hooks';
import './styles.css';

function Counter({
  value,
  setValue,
  maxValue,
  minValue,
  title,
  valueName,
  detail,
  valueStyle = {},
  containerStyle = {},
}: {
  value: number;
  setValue: (v: number) => void;
  maxValue: number;
  minValue: number;
  title?: JSX.Element | string;
  valueName?: JSX.Element | string;
  detail?: JSX.Element | string;
  valueStyle?: CSSProperties;
  containerStyle?: CSSProperties;
}) {
  // TODO make this component generic; pass in count and setCount
  const {
    handleOnClick: incHandleOnClick,
    handleOnMouseDown: incHandleOnMouseDown,
    handleOnMouseUp: incHandleOnMouseUp,
    handleOnTouchEnd: incHandleOnTouchEnd,
    handleOnTouchStart: incHandleOnTouchStart,
  } = useLongPress(() => (value < maxValue ? setValue(++value) : null));
  const {
    handleOnClick: decHandleOnClick,
    handleOnMouseDown: decHandleOnMouseDown,
    handleOnMouseUp: decHandleOnMouseUp,
    handleOnTouchEnd: decHandleOnTouchEnd,
    handleOnTouchStart: decHandleOnTouchStart,
  } = useLongPress(() => (value > minValue ? setValue(--value) : null));

  return (
    <div className="counter-container center" style={containerStyle}>
      {title}
      <div className="flex-column center">
        <div className="counter">
          <button
            className={`counter-button ${minValue === value ? '' : 'hover'}`}
            disabled={value == minValue}
            onClick={decHandleOnClick}
            onMouseDown={decHandleOnMouseDown}
            onMouseUp={decHandleOnMouseUp}
            onTouchStart={decHandleOnTouchStart}
            onTouchEnd={decHandleOnTouchEnd}
            onMouseLeave={decHandleOnTouchEnd}
            style={{
              borderColor: minValue === value ? 'var(--disabled-grey)' : '',
              color: minValue === value ? 'var(--disabled-grey)' : 'white',
            }}
          >
            -
          </button>
          <div
            className="flex flex-column flex-center"
            style={{ width: 'fit-content', gap: '0px' }}
          >
            <span
              className="text-large white center"
              style={{
                fontWeight: 500,
                ...valueStyle,
                paddingTop: '5px',
                paddingBottom: '8px',
              }}
            >
              {value} {valueName}
            </span>
            {detail ? (
              <span className="text grey center" style={{ fontSize: '14px' }}>
                {detail}
              </span>
            ) : (
              <></>
            )}
          </div>
          <button
            className={`counter-button ${maxValue === value ? '' : 'hover'}`}
            disabled={value == maxValue}
            onClick={incHandleOnClick}
            onMouseDown={incHandleOnMouseDown}
            onMouseUp={incHandleOnMouseUp}
            onTouchStart={incHandleOnTouchStart}
            onTouchEnd={incHandleOnTouchEnd}
            onMouseLeave={incHandleOnTouchEnd}
            style={{
              borderColor: maxValue === value ? 'var(--disabled-grey)' : '',
              color: maxValue === value ? 'var(--disabled-grey)' : '',
            }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
export default Counter;
