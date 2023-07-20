import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useIsMobile } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { PDNSDomain, PDNSMapping } from '../../../types';
import { DEFAULT_EXPIRATION } from '../../../utils/constants';
import { ExternalLinkIcon, PDNSDefault as pdnsDefaultImage } from '../../icons';
import './styles.css';

const protocol = 'https';

function PDNSCard({ domain, contractTxId }: PDNSMapping) {
  const [{ gateway }] = useGlobalState();
  const isMobile = useIsMobile();
  const [pdntDetails, setPDNTDetails] = useState<PDNSDomain>({
    domain,
    contractTxId,
    image: pdnsDefaultImage,
    expiration: DEFAULT_EXPIRATION, // TODO: don't default
  });

  useEffect(() => {
    getPDNTDetailsFromName(domain);
  }, [isMobile]);

  async function getPDNTDetailsFromName(domain: string) {
    const image = await getMetaImage();
    setPDNTDetails({
      ...pdntDetails,
      domain,
      image,
    });
  }

  async function getMetaImage() {
    try {
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
      return pdnsDefaultImage;
    }
  }

  return (
    <Link
      target="_blank"
      to={`${protocol}://${domain}.${gateway}`}
      className="pdns-card hover"
      rel="noreferrer"
    >
      <img
        className="pdns-preview"
        src={pdntDetails.image}
        key={pdntDetails.image}
        alt={`${domain}.${gateway}`}
      />
      <div
        className="flex flex-column link"
        style={{
          gap: 3,
          padding: 10,
          boxSizing: 'border-box',
          textDecoration: 'unset',
        }}
      >
        <div className="flex flex-row flex-space-between">
          <span className="flex text white bold">{`${pdntDetails.domain}.${gateway}`}</span>
          <ExternalLinkIcon
            height={25}
            width={25}
            viewBox={'0 -3 5 20'}
            fill={'var(--text-white)'}
          />
        </div>
        <span className="text-small white">
          Exp.{' '}
          {new Intl.DateTimeFormat('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }).format(pdntDetails.expiration)}
        </span>
      </div>
    </Link>
  );
}

export default PDNSCard;
