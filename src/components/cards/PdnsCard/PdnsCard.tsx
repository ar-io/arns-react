import axios from 'axios';
import { useEffect, useState } from 'react';

import { useIsMobile } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { PdnsDomain, PdnsMapping } from '../../../types';
import { DEFAULT_EXPIRATION } from '../../../utils/constants';
import { PdnsDefault as pdnsDefaultImage } from '../../icons';
import './styles.css';

function PdnsCard({ domain, id }: PdnsMapping) {
  const [{ gateway }] = useGlobalState();
  const isMobile = useIsMobile();
  const [pdntDetails, setPdntDetails] = useState<PdnsDomain>({
    domain,
    id,
    image: pdnsDefaultImage,
    expiration: DEFAULT_EXPIRATION, // TODO: don't default
  });

  useEffect(() => {
    getPdntDetailsFromName(domain);
  }, [domain, id, gateway, isMobile]);

  async function getPdntDetailsFromName(domain: string) {
    const image = await getMetaImage();
    setPdntDetails({
      ...pdntDetails,
      domain,
      image,
    });
  }

  async function getMetaImage() {
    try {
      const protocol = process.env.NODE_ENV == 'dev' ? 'http' : 'https';
      const metaImage = await axios
        .get(`${protocol}://${domain}.${gateway}`)
        .then((res) => res.data)
        .then((html) => {
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
            return doc
              ?.querySelector("meta[property='og:image']")
              ?.getAttribute('content');
          }
        });

      if (!metaImage) {
        throw Error(`Failed to fetch meta tag for ${domain}.${gateway}.`);
      }
      //todo:
      //if relative file path detected, change url to query properly
      //add path modification for relative link/permaweb app (arweave manifest)
      if (metaImage[0] == '.') {
        throw Error('Relative path detected, cant get image');
      }
      return metaImage;
    } catch (error) {
      return pdnsDefaultImage;
    }
  }

  return (
    <div className="pdns-card hover">
      <img
        className="pdns-preview"
        src={pdntDetails.image}
        key={pdntDetails.image}
        alt={`${domain}.${gateway}`}
      />
      <div className="pdns-card-footer">
        <a
          className="text white bold external-link"
          target="_blank"
          href={`https://${pdntDetails.domain}.${gateway}`}
          rel="noreferrer"
        >{`${pdntDetails.domain}.${gateway}`}</a>
        <span className="expiry-text">
          Exp. {pdntDetails.expiration?.toDateString()}
        </span>
      </div>
    </div>
  );
}

export default PdnsCard;
