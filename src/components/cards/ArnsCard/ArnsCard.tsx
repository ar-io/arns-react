import './styles.css';
import { ArnsDefault } from '../../icons';
import axios from 'axios';
import { useEffect, useState } from 'react';

import { ArNSDomain } from '../../../types';
import './styles.css';

function ArnsCard({domain}: Partial<ArNSDomain>) {
  const [antDetails, setAntDetails] = useState<{name:string|undefined,gateway:string,image:string|undefined,expiry:string }>({
    name: domain,
    gateway: 'arweave.net',
    image: `${ArnsDefault}`,
    expiry: '',
  });

  useEffect(() => {
    getAntDetailsFromName(domain);
  }, []);

  async function getAntDetailsFromName(name: string|undefined) {
    const expiry = new Date().toDateString();
    const imageUrl = await getMetaImage();
    setAntDetails({
      name: name,
      gateway: 'arweave.dev',
      image: `${imageUrl}`,
      expiry: expiry,
    });
  }
  async function getMetaImage() {
    try {
    const img = await axios
      .get(`http://${domain}.arweave.dev`)
      .then((res) => res.data)
      .then((html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const metaImage = doc
          ?.querySelector("meta[property='og:image']")
          ?.getAttribute('content');

        return metaImage;
      });
    const status = await axios
      .get(img!)
      .then((res) => res.status)
      .catch((error) => console.log(error));
    if (status === 200) {
      return `${img}`;
    } else {
      return `${ArnsDefault}`;
    }
  }catch(error){console.log(error)}
  }

  return (
    <div className="arnsCard">
      <img className="arnsPreview" src={antDetails.image} />
      <div className="arnsCardFooter">
      <a className="link" target="_blank" href={`https://${antDetails.name}.${antDetails.gateway}`}>{`${antDetails.name}.${antDetails.gateway}`}</a>
        <span className="expiryText">Exp. {antDetails.expiry}</span>
      </div>
    </div>
  );
}

export default ArnsCard;
