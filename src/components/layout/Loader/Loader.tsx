import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';

export default function Loader({
  size = 80,
  color = 'white',
  percent = undefined,
}: {
  size?: number;
  color?: string;
  percent?: number;
}) {
  return (
    <Spin
      tip={percent ? `${Math.round(percent)}%` : undefined}
      style={{ fontSize: '18px', color: color }}
      indicator={<LoadingOutlined style={{ fontSize: size, margin: '15px' }} />}
    />
  );
}
