import { useEffect } from 'react';

export default function Redirect({ url }: { url: string }) {
  useEffect(() => {
    window.location.href = url;
  }, [url]);

  return <></>;
}
