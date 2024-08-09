import { ARWEAVE_HOST } from '@src/utils/constants';
import { Link } from 'react-router-dom';

import { ARNSMapping } from '../../../types';
import './styles.css';

const protocol = 'https';

function ARNSCard({
  domain,
  gateway = ARWEAVE_HOST,
  imageUrl,
}: Omit<ARNSMapping, 'processId'> & { gateway?: string; imageUrl: string }) {
  return (
    <Link
      target="_blank"
      to={`${protocol}://${domain}.${gateway}`}
      className="arns-card hover"
      rel="noreferrer"
    >
      <img
        className="arns-preview fade-in"
        src={imageUrl}
        key={imageUrl}
        alt={`${domain}.${gateway}`}
        width={'100%'}
        height={'100%'}
      />

      <div
        className="flex-column link flex"
        style={{
          gap: '10px',
          padding: '13px',
          boxSizing: 'border-box',
          textDecoration: 'unset',
          fontSize: '13px',
          justifyContent: 'center',
        }}
      >
        <span className="white flex">{`${domain}.${gateway}`}</span>
      </div>
    </Link>
  );
}

export default ARNSCard;
