import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { ARNSMapping } from '../../../types';
import { NETWORK_DEFAULTS } from '../../../utils/constants';
import './styles.css';

function getBaseGateway(): string {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return NETWORK_DEFAULTS.ARNS.HOST;
  }
  // strip the first subdomain (e.g. "arns.ar.io" -> "ar.io")
  const parts = hostname.split('.');
  if (parts.length > 2) {
    return parts.slice(1).join('.');
  }
  return hostname;
}

function ARNSCard({
  domain,
  imageUrl,
}: Omit<ARNSMapping, 'processId'> & { imageUrl: string }) {
  const baseGateway = useMemo(() => getBaseGateway(), []);

  return (
    <Link
      target="_blank"
      to={`https://${domain}.${baseGateway}`}
      className="arns-card hover"
      rel="noreferrer"
    >
      <img
        className="arns-preview fade-in"
        src={imageUrl}
        key={imageUrl}
        alt={`${domain}`}
        width={'100%'}
        height={'100%'}
      />
      <div
        className="flex flex-column link"
        style={{
          gap: '10px',
          padding: '13px',
          boxSizing: 'border-box',
          textDecoration: 'unset',
          fontSize: '13px',
          justifyContent: 'center',
        }}
      >
        <span className="flex white">{`ar://${domain}`}</span>
      </div>
    </Link>
  );
}

export default ARNSCard;
