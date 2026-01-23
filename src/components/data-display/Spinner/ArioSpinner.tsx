import './styles.css';

interface ArioSpinnerProps {
  className?: string;
  size?: number;
}

function ArioSpinner({ className = '', size = 100 }: ArioSpinnerProps) {
  return (
    <div
      className={`ario-spinner ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 1080 1080"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="ario-spinner-logo"
      >
        <path
          d="M540 223.2C363.264 223.2 220 366.464 220 543.2V639.2H316V575.2C316 548.688 337.488 527.2 364 527.2C377.248 527.2 389.248 532.576 397.936 541.264C406.624 549.952 412 561.952 412 575.2V639.2H508V607.2C508 536.512 565.312 479.2 636 479.2C706.688 479.2 764 536.512 764 607.2V639.2H860V543.2C860 366.464 716.736 223.2 540 223.2ZM364 479.2C337.488 479.2 316 457.712 316 431.2C316 404.688 337.488 383.2 364 383.2C390.512 383.2 412 404.688 412 431.2C412 457.712 390.512 479.2 364 479.2Z"
          fill="#F0F0F0"
        />
      </svg>
      <svg
        viewBox="0 0 1080 1080"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="ario-spinner-ring"
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
