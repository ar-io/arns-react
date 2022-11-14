import axios from 'axios';
import { useEffect, useState } from 'react';

import { useStateValue } from '../../../state/state';
import { ArNSDomain, ArNSMapping } from '../../../types';
import { ArnsDefault as arnsDefaultImage } from '../../icons';
import './styles.css';

function ArnsCard({ domain, id }: ArNSMapping) {
  const [{ gateway }] = useStateValue();
  const [antDetails, setAntDetails] = useState<ArNSDomain>({
    domain,
    id,
    image: arnsDefaultImage,
    expiry: '',
  });

  useEffect(() => {
    getAntDetailsFromName(domain);
  }, [domain, id, gateway]);

  async function getAntDetailsFromName(domain: string) {
    const expiry = new Date().toDateString();
    const image = await getMetaImage();
    setAntDetails({
      ...antDetails,
      domain,
      image,
      expiry,
    });
  }

  async function getMetaImage() {
    try {
      const metaImage = await axios
        .get(`http://${domain}.${gateway}`)
        .then((res) => res.data)
        .then((html) => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const metaImage = doc
            ?.querySelector("meta[property='og:image']")
            ?.getAttribute('content');

          return metaImage;
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
    <div className="arnsCard">
      <img
        className="arnsPreview"
        src={antDetails.image}
        alt={`${domain}.${gateway}`}
      />
      <div className="arnsCardFooter">
        <a
          className="text white bold"
          target="_blank"
          href={`https://${antDetails.domain}.${gateway}`}
          rel="noreferrer"
        >{`${antDetails.domain}.${gateway}`}</a>
        <span className="expiryText">Exp. {antDetails.expiry}</span>
      </div>
    </div>
  );
}

export default ArnsCard;
