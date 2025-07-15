import { useWayfinderUrl } from '@ar.io/wayfinder-react';
import { Loader } from '@src/components/layout';
import { Link } from 'react-router-dom';

import { ARNSMapping } from '../../../types';
import './styles.css';

function ARNSCard({
  domain,
  imageUrl,
}: Omit<ARNSMapping, 'processId'> & { imageUrl: string }) {
  const {
    resolvedUrl = `https://${domain}.ar.io`,
    isLoading,
    error,
  } = useWayfinderUrl({
    arnsName: domain,
  });

  if (error) {
    console.error(error);
  }

  return (
    <Link
      target="_blank"
      to={resolvedUrl?.toString() ?? `https://${domain}.ar.io`}
      className="arns-card hover"
      rel="noreferrer"
    >
      {isLoading ? (
        <img
          className="arns-preview fade-in"
          src={imageUrl}
          key={imageUrl}
          alt={`${domain}`}
          width={'100%'}
          height={'100%'}
        />
      ) : (
        <Loader size={40} />
      )}

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
