import axios from 'axios';
import { useEffect, useState } from 'react';

import { useStateValue } from '../../../state/state.js';
import { ArNSDomain, ArNSMapping } from '../../../types';
import { ArnsDefault as arnsDefaultImage } from '../../icons';
import './styles.css';
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
  }, [domain, id]);

  async function getAntDetailsFromName(domain: string) {
    const expiry = new Date().toDateString();
    const image = await getMetaImage();
    setAntDetails({
      ...antDetails,
      domain,
      image,
      expiry: expiry,
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
          console.log(doc);
          return metaImage;
        });

      console.log(metaImage);

      if (!metaImage) {
        throw Error(`Failed to fetch meta tag for ${domain}.${gateway}.`);
      }

      return metaImage;
    } catch (error) {
      console.log(error);
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
          className="link"
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
