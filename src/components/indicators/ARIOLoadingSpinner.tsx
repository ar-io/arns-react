import arioLoading from '@src/components/icons/ario-spinner.json';
import Lottie from 'lottie-react';

export default function ARIOLoadingSpinner({
  size = 100,
  className = '',
}: { size?: number; className?: string }) {
  return (
    <div className={className}>
      <Lottie
        animationData={arioLoading}
        loop={true}
        style={{ width: size, height: size }}
      />
    </div>
  );
}
