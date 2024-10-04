import { defaultLogger } from '@src/utils/constants';
import { useEffect, useState } from 'react';

export function useIsFocused(id: string) {
  // helpful when you need to modify the style of a seperate element when another element is focused
  const [isFocused, setIsFocused] = useState<boolean>(false);

  useEffect(() => {
    if (!id) {
      return;
    }
    const element = document.getElementById(id);

    if (!element) {
      defaultLogger.info(`Element with id ${id} not found`);
      return;
    }

    const onFocus = () => setIsFocused(true);
    const onBlur = () => setIsFocused(false);

    element.addEventListener('focus', onFocus);
    element.addEventListener('blur', onBlur);

    return () => {
      element.removeEventListener('focus', onFocus);
      element.removeEventListener('blur', onBlur);
    };
  }, [id]);

  return isFocused;
}
