import { NETWORK_DEFAULTS } from '@src/utils/constants';
import { Link } from 'react-router-dom';

import { ARNSMapping } from '../../../types';

const protocol = 'https';

function ARNSCard({
  domain,
  gateway = NETWORK_DEFAULTS.ARNS.HOST,
  imageUrl,
}: Omit<ARNSMapping, 'processId'> & { gateway?: string; imageUrl: string }) {
  return (
    <Link
      target="_blank"
      to={`${protocol}://${domain}.${gateway}`}
      className="flex flex-col items-start gap-0 p-0 w-[245px] min-w-[200px] max-w-[250px] bg-foreground shadow-[0_0_1px_#0d0d0d,0_8px_16px_rgba(13,13,13,0.9)] rounded hover:no-underline"
      rel="noreferrer"
    >
      <img
        className="flex w-full h-fit rounded-t fade-in overflow-hidden"
        src={imageUrl}
        key={imageUrl}
        alt={`${domain}.${gateway}`}
      />

      <div className="flex flex-col gap-2 p-[13px] text-[13px] justify-center">
        <span className="text-white">{`${domain}.${gateway}`}</span>
      </div>
    </Link>
  );
}

export default ARNSCard;
