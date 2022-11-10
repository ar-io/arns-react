import { ArnsCard } from '../../cards';
import './styles.css';

function FeaturedDomains() {
  return (
    <div className="featuredDomains">
      <span className="sectionHeader">Featured Domains</span>
      <div className="cardContainer">
        <ArnsCard name="ardrive" />
        <ArnsCard name="arwiki" />
        <ArnsCard name="pages" />
      </div>
      <span className="buttonLink">see more</span>
    </div>
  );
}

export default FeaturedDomains;
