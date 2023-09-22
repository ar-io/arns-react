import { useRef } from 'react';

export function useLongPress(action: () => void) {
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
      return;
    }
    action();
  }

  function handleOnMouseDown() {
    startPressTimer();
  }

  function handleOnMouseUp() {
    clearInterval(timerRef.current);
  }

  function handleOnTouchStart() {
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
