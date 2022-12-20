import { Oval } from 'react-loader-spinner';

export default function Loader({ size }: { size: number }) {
  return (
    // TODO: this is a simple loading component - eventually replace with one that matches the design system
    <Oval
      height={size}
      width={size}
      color={'white'}
      visible={true}
      secondaryColor="transparent"
      strokeWidth={3}
      strokeWidthSecondary={3}
    />
  );
}
