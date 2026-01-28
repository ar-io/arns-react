import { ArioSpinnerLogo } from '../../icons';

interface ArioSpinnerProps {
  className?: string;
  size?: number;
}

function ArioSpinner({ className = '', size = 100 }: ArioSpinnerProps) {
  return (
    <div
      className={`relative grid place-items-center ${className}`}
      style={{ width: size, height: size }}
    >
      <ArioSpinnerLogo className="h-3/4 w-3/4 animate-ario-pulse text-[#F0F0F0] [grid-area:1/1]" />
      <svg
        viewBox="0 0 1080 1080"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full animate-ario-spin [grid-area:1/1]"
      >
        <circle
          cx="540"
          cy="540"
          r="480"
          stroke="url(#spinner-gradient)"
          strokeWidth="40"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="1200 1800"
        />
        <defs>
          <linearGradient
            id="spinner-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#F0F0F0" stopOpacity="1" />
            <stop offset="100%" stopColor="#F0F0F0" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default ArioSpinner;
