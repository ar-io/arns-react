import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';

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
    <Spin
      tip={message}
      style={{ fontSize: '18px', color: color }}
      indicator={
        <LoadingOutlined
          style={{ fontSize: size, margin: '15px', ...wrapperStyle }}
        />
      }
    />
  );
}
