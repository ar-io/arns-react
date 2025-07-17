import { useWayfinderUrl } from '@ar.io/wayfinder-react';
import { useGlobalState } from '@src/state';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { ARNSMapping } from '../../../types';
import './styles.css';

function ARNSCard({
  domain,
  imageUrl,
}: Omit<ARNSMapping, 'processId'> & { imageUrl: string }) {
  const [{ gateway }] = useGlobalState();
  const arnsName = useMemo(() => ({ arnsName: domain }), [domain]);
  const { resolvedUrl, error } = useWayfinderUrl(arnsName);

  if (error) {
    console.error(error);
  }

  return (
    <Link
      target="_blank"
      to={resolvedUrl?.toString() ?? `https://${domain}.${gateway}`}
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
