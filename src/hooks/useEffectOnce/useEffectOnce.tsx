import { EffectCallback, useEffect, useRef } from 'react';

/** Hook for ensuring an effect is run only once for a component on first mount.
 * Will not be run on subsequent unmount/remounts of the component. Should only be used
 * for effects where cleanup code (i.e., the return Destructor value from the EffectCallback)
 * is not needed.
 *
 * @param effect The effect to run once.
 */
export const useEffectOnce = (effect: EffectCallback) => {
  const initializationOccuredRef = useRef(false);

  useEffect(() => {
    if (initializationOccuredRef.current === false) {
      initializationOccuredRef.current = true;
      effect();
    }
  });
};
