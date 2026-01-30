import { Spinner } from '@src/components/ui/Spinner';

export default function Loader({
  size = 80,
  color = 'white',
  message = undefined,
  wrapperStyle = {},
}: {
  size?: number;
  color?: string;
  message?: string;
  wrapperStyle?: React.CSSProperties;
}) {
  return (
    <div style={{ margin: '15px', ...wrapperStyle }}>
      <Spinner size={size} color={color} message={message} />
    </div>
  );
}
