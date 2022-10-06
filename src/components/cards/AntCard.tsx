import { FiExternalLink } from 'react-icons/fi';
import {useState, useEffect} from 'react'
import { link } from 'fs';

type antCard = {
  arnsName: String;
  gateway: String;
  expiry: any;
  preview: any;
};

function AntCard({ arnsName, gateway, expiry, preview }: antCard) {

  const [imagePreview, setImagePreview] = useState()
  const date = new Date(expiry * 1000); //unix timestamp multiplied for JS ms
  const expiryDate = `${date.toDateString()}`;


  useEffect(()=>{
    async function loadHTML(){
    await fetch(`https://${arnsName}.${gateway}/`)
      .then(res => res.text())
      .then(html =>{
        let parser = new DOMParser();
        let doc = parser.parseFromString(html, "text/html");  
          return doc
      })   
  }
    const linkHTML = loadHTML()
   console.log(linkHTML)
  })

  return (
    <div className="antCard">
      <div className="antPreview">{preview}</div>
      <div className="cardFooter alignLeft"> 
        <p className="cardText alignLeft">
          {arnsName}.{gateway}{' '}
          <a href={`http://${arnsName}.${gateway}`} target="_">
            <FiExternalLink color="#9E9E9E" size={'12px'} />
          </a>
        </p>
        <p className="cardTextSmall alignLeft">Exp. {expiryDate}</p>
      </div>
    </div>
  );
}
export default AntCard;
