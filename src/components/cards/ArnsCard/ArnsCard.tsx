import axios from 'axios';
import { useEffect, useState } from 'react';

import useIsMobile from '../../../hooks/useIsMobile/useIsMobile';
import { useStateValue } from '../../../state/state';
import { ArNSDomain, ArNSMapping } from '../../../types';
import { DEFAULT_EXPIRATION } from '../../../utils/constants';
import { ArnsDefault as arnsDefaultImage } from '../../icons';
import './styles.css';

function ArnsCard({ domain, id }: ArNSMapping) {
  const [{ gateway }] = useStateValue();
  const isMobile = useIsMobile();
  const [antDetails, setAntDetails] = useState<ArNSDomain>({
    domain,
    id,
    image: arnsDefaultImage,
    expiration: DEFAULT_EXPIRATION, // TODO: don't default
  });

  useEffect(() => {
    getAntDetailsFromName(domain);
  }, [domain, id, gateway, isMobile]);

  async function getAntDetailsFromName(domain: string) {
    const image = await getMetaImage();
    setAntDetails({
      ...antDetails,
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
      console.debug(error);
      return arnsDefaultImage;
    }
  }

  return (
    <div className="arnsCard hover">
      <img
        className="arnsPreview"
        src={antDetails.image}
        key={antDetails.image}
        alt={`${domain}.${gateway}`}
      />
      <div className="arnsCardFooter">
        <a
          className="text white bold external-link"
          target="_blank"
          href={`https://${antDetails.domain}.${gateway}`}
          rel="noreferrer"
        >{`${antDetails.domain}.${gateway}`}</a>
        <span className="expiryText">
          Exp. {antDetails.expiration?.toDateString()}
        </span>
      </div>
    </div>
  );
}

export default ArnsCard;
