import { Loader2 } from 'lucide-react';

export default function Loader({
  size = 80,
  color = 'white',
  message = undefined,
  wrapperStyle = {},
}: {
  size?: number;
  color?: string;
  message?: string;
  wrapperStyle?: any;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ color }}
    >
      <Loader2
        className="animate-spin"
        style={{ fontSize: size, margin: '15px', ...wrapperStyle }}
      />
      {message ? <span className="mt-2 text-sm">{message}</span> : null}
    </div>
  );
}
