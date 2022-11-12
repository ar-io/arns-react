import { useState } from 'react';
import { ArNSContractState } from '../../../types';
import { ArnsCard } from '../../cards';
import { useStateValue } from '../../../state/state';
import './styles.css';

function FeaturedDomains() {
  console.log("featured domains")
const[{arnsSourceContract}] = useStateValue()

  const DEFAULT_INCREMENT = 3;
  const [displayCount, setDisplayCount] = useState(DEFAULT_INCREMENT);
  function showMore(e: any){
    e.preventDefault();
    setDisplayCount(displayCount + DEFAULT_INCREMENT);
  }
  return (
    <div className="featuredDomains">
      <span className="sectionHeader">Featured Domains</span>
      <div className="cardContainer">
        {
         Object.keys(arnsSourceContract.records).map((domain,i)=>{
         if(i>= displayCount || i >= Object.keys(arnsSourceContract.records).length) return
         return <ArnsCard domain={domain} key={i}/>})
        }
      
    </div>
    { (displayCount < Object.keys(arnsSourceContract.records).length) ?
            <button className="link" onClick={showMore}>see more</button>
          : <></>
        }
    </div>
  );
}
export default FeaturedDomains;