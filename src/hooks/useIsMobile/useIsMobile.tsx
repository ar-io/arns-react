import { useEffect, useState } from 'react';

export default function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    updateIsMobile();
    window.addEventListener('resize', updateIsMobile);
  }, [isMobile]);

  function updateIsMobile(): void {
    setIsMobile(window.innerWidth < 600);
  }

  return isMobile;
}
