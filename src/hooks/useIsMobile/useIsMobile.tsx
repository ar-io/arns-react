import { useEffect, useState } from 'react';

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    window.addEventListener('resize', updateIsMobile);

    updateIsMobile();

    return () => {
      window.removeEventListener('resize', updateIsMobile);
    };
    // The dependency array is intentionally empty so the listener is only
    // attached once on mount and cleaned up on unmount.
  }, []);

  function updateIsMobile(): void {
    setIsMobile(window.innerWidth < 600);
  }

  return isMobile;
}
