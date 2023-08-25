import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useIsMobile } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { PDNSDomain, PDNSMapping } from '../../../types';
import { getRandomInteger } from '../../../utils';
import { DEFAULT_EXPIRATION } from '../../../utils/constants';
import {
  ElephantOne,
  ElephantThree,
  ElephantTwo,
  PDNSDefault,
} from '../../icons';
import { Loader } from '../../layout';
import './styles.css';

const protocol = 'https';

function PDNSCard({ domain, contractTxId }: PDNSMapping) {
  const [{ gateway }] = useGlobalState();
  const isMobile = useIsMobile();
  const [pdntDetails, setPDNTDetails] = useState<PDNSDomain>({
    domain,
    contractTxId,
    image: PDNSDefault,
    expiration: DEFAULT_EXPIRATION, // TODO: don't default
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPDNTDetailsFromName(domain);
  }, [isMobile, gateway]);

  async function getPDNTDetailsFromName(domain: string) {
    setLoading(true);
    const image = await getMetaImage();
    setPDNTDetails({
      ...pdntDetails,
      domain,
      image,
    });
    setLoading(false);
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
      const index = getRandomInteger(0, 2);
      return [ElephantOne, ElephantTwo, ElephantThree][index];
    }
  }

  return (
    <Link
      target="_blank"
      to={`${protocol}://${domain}.${gateway}`}
      className="pdns-card hover"
      rel="noreferrer"
    >
      {loading ? (
        <div
          className="flex flex-column center"
          style={{ height: '100%', background: 'var(--modal-bg)' }}
        >
          <Loader size={80} color="var(--accent)" />
        </div>
      ) : (
        <img
          className="pdns-preview fade-in"
          src={pdntDetails.image}
          key={pdntDetails.image}
          alt={`${domain}.${gateway}`}
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
        <span className="flex white">{`${pdntDetails.domain}.${gateway}`}</span>

        <span className="grey">
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
