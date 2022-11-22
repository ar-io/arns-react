import { useRef } from 'react';

export default function useLongPress(action: () => void) {
  const timerRef = useRef<NodeJS.Timeout | undefined>();
  const isLongPress = useRef<boolean>();

  function startPressTimer() {
    isLongPress.current = false;
    timerRef.current = setInterval(() => {
      isLongPress.current = true;
      action();
    }, 200);
  }

  function handleOnClick() {
    if (isLongPress.current) {
      console.log('Is long press - not continuing.');
      return;
    }
    action();
  }

  function handleOnMouseDown() {
    console.log('handleOnMouseDown');
    startPressTimer();
  }

  function handleOnMouseUp() {
    console.log('handleOnMouseUp');
    clearInterval(timerRef.current);
  }

  function handleOnTouchStart() {
    console.log('handleOnTouchStart');
    startPressTimer();
  }

  function handleOnTouchEnd() {
    clearInterval(timerRef.current);
  }

  return {
    handleOnClick,
    handleOnMouseDown,
    handleOnMouseUp,
    handleOnTouchStart,
    handleOnTouchEnd,
  };
}
