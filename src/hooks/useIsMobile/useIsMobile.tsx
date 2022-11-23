import { useEffect, useState } from 'react';

export default function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    window.addEventListener('resize', updateIsMobile);

    updateIsMobile();

    return () => {
      window.removeEventListener('resize', updateIsMobile);
    };
  }, [isMobile]);

  function updateIsMobile(): void {
    setIsMobile(window.innerWidth < 600);
  }

  return isMobile;
}
