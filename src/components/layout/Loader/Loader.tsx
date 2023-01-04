import { Oval } from 'react-loader-spinner';

export default function Loader({
  size,
  color,
}: {
  size: number;
  color?: string;
}) {
  return (
    // TODO: this is a simple loading component - eventually replace with one that matches the design system
    <Oval
      height={size}
      width={size}
      color={color ? color : 'white'}
      visible={true}
      secondaryColor="transparent"
      strokeWidth={3}
      strokeWidthSecondary={3}
    />
  );
}
