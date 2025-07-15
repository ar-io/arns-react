import { useWayfinder } from '@ar.io/wayfinder-react';
import { Loader } from '@src/components/layout';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { ARNSMapping } from '../../../types';
import './styles.css';

function ARNSCard({
  domain,
  imageUrl,
}: Omit<ARNSMapping, 'processId'> & { imageUrl: string }) {
  const { wayfinder } = useWayfinder();
  const [wayfinderUrl, setWayfinderUrl] = useState<string | null>(null);
  useEffect(() => {
    wayfinder
      .resolveUrl({ arnsName: domain })
      .then((url) => {
        setWayfinderUrl(url.toString());
      })
      .catch((error) => {
        console.error(error);
        setWayfinderUrl(`https://${domain}.ar.io`);
      });
  }, [wayfinder, domain]);

  if (!wayfinderUrl) return <Loader />;

  return (
    <Link
      target="_blank"
      to={wayfinderUrl.toString()}
      className="arns-card hover"
      rel="noreferrer"
    >
      {wayfinderUrl ? (
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
