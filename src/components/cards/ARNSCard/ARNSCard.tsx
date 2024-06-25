import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useIsMobile } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { ARNSDomain, ARNSMapping } from '../../../types';
import { getRandomInteger } from '../../../utils';
import {
  ARNSDefault,
  ElephantOne,
  ElephantThree,
  ElephantTwo,
} from '../../icons';
import { Loader } from '../../layout';
import './styles.css';

const protocol = 'https';

function ARNSCard({ domain, processId }: ARNSMapping) {
  const [{ gateway }] = useGlobalState();
  const isMobile = useIsMobile();
  const [antDetails, setANTDetails] = useState<ARNSDomain>({
    domain,
    processId,
    image: ARNSDefault,
  });
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    getANTDetailsFromName(domain);
  }, [isMobile, gateway]);

  async function getANTDetailsFromName(domain: string) {
    setLoading(true);

    const image = await queryClient.fetchQuery({
      queryKey: ['meta-image', domain],
      queryFn: getMetaImage,
      staleTime: Infinity,
    });
    setANTDetails({
      ...antDetails,
      domain,
      image,
    });
    setLoading(false);
  }

  async function getMetaImage() {
    try {
      // TODO: replace with fetch
      const metaImage = await axios
        .get(`${protocol}://${domain}.${gateway}`)
        .then((res) => res.data)
        .then(async (html) => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');

          if (isMobile) {
            const faviconPath = doc
              ?.querySelector('link[rel~="icon"]')
              ?.getAttribute('href');

            // return if its a full url
            if (faviconPath?.match(/^http(s):\/\//)) {
              return faviconPath;
            }
            return faviconPath
              ? `${protocol}://${domain}.${gateway}/${faviconPath}`
              : undefined;
          } else {
            const imagePath = doc
              ?.querySelector("meta[property='og:image']")
              ?.getAttribute('content');

            if (imagePath?.match(/^http(s):\/\//)) {
              return imagePath;
            }
            if (imagePath && (imagePath[0] === '.' || imagePath[0] === '/')) {
              const relativePath = imagePath.slice(
                imagePath[0] === '.' ? 2 : 1,
              );
              const fullImageURL = `${protocol}://${domain}.${gateway}/${relativePath}`;

              // TODO: replace with fetch
              const { status } = await axios.get(fullImageURL);
              if (status === 200) {
                return fullImageURL;
              }
            }
          }
        });

      if (!metaImage) {
        throw Error(`Failed to fetch meta tag for ${domain}.${gateway}.`);
      }
      return metaImage;
    } catch (error) {
      const index = getRandomInteger(0, 2);
      return [ElephantOne, ElephantTwo, ElephantThree][index];
    }
  }

  return (
    <Link
      target="_blank"
      to={`${protocol}://${domain}.${gateway}`}
      className="arns-card hover"
      rel="noreferrer"
    >
      {loading ? (
        <div
          className="flex flex-column center"
          style={{ height: '100%', background: 'var(--modal-bg)' }}
        >
          <Loader size={isMobile ? 50 : 80} color="var(--accent)" />
        </div>
      ) : (
        <img
          className="arns-preview fade-in"
          src={antDetails.image}
          key={antDetails.image}
          alt={`${domain}.${gateway}`}
          width={'100%'}
          height={'100%'}
        />
      )}
      <div
        className="flex flex-column link"
        style={{
          gap: '10px',
          padding: '13px',
          boxSizing: 'border-box',
          textDecoration: 'unset',
          fontSize: '13px',
        }}
      >
        <span className="flex white">{`${antDetails.domain}.${gateway}`}</span>
      </div>
    </Link>
  );
}

export default ARNSCard;
