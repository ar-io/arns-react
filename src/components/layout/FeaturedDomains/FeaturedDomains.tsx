import AntCard from './cards/AntCard/AntCard';
import previewImage from '../assets/images/antCardPreviewDefault.png';

function FeaturedDomains() {
  return (
    <>
      <p className="sectionHeader">Featured Domains</p>
      <div className="featuredDomains">
        <AntCard
          arnsName={'sam'}
          gateway={'arweave.dev'}
          expiry={1664643782}
          preview={
            <img src={previewImage} alt="" width="100%" height={'100%'} />
          }
        />
        <AntCard
          arnsName={'ipfs'}
          gateway={'arweave.net'}
          expiry={1664243982}
          preview={
            <img src={previewImage} alt="" width="100%" height={'100%'} />
          }
        />
        <AntCard
          arnsName={'arwiki'}
          gateway={'arweave.dev'}
          expiry={1664713182}
          preview={
            <img
              src="https://arweave.net/u5JJ4kgDECvSt5dN1N9RXyHmL_7uJixpiqan0pX4kFo"
              alt={previewImage}
              width="100%"
              height="100%"
              className="antPreviewImage"
            />
          }
        />
        <AntCard
          arnsName={'sam'}
          gateway={'arweave.dev'}
          expiry={1664643782}
          preview={
            <img src={previewImage} alt="" width="100%" height={'100%'} />
          }
        />
        <AntCard
          arnsName={'ipfs'}
          gateway={'arweave.net'}
          expiry={1664243982}
          preview={
            <img src={previewImage} alt="" width="100%" height={'100%'} />
          }
        />
        <AntCard
          arnsName={'arwiki'}
          gateway={'arweave.dev'}
          expiry={1664713182}
          preview={
            <img
              src="https://arweave.net/u5JJ4kgDECvSt5dN1N9RXyHmL_7uJixpiqan0pX4kFo"
              alt={previewImage}
              width="100%"
              height="100%"
              className="antPreviewImage"
            />
          }
        />
        <AntCard
          arnsName={'sam'}
          gateway={'arweave.dev'}
          expiry={1664643782}
          preview={
            <img src={previewImage} alt="" width="100%" height={'100%'} />
          }
        />
        <AntCard
          arnsName={'ipfs'}
          gateway={'arweave.net'}
          expiry={1664243982}
          preview={
            <img src={previewImage} alt="" width="100%" height={'100%'} />
          }
        />
        <AntCard
          arnsName={'arwiki'}
          gateway={'arweave.dev'}
          expiry={1664713182}
          preview={
            <img
              src="https://arweave.net/u5JJ4kgDECvSt5dN1N9RXyHmL_7uJixpiqan0pX4kFo"
              alt={previewImage}
              width="100%"
              height="100%"
              className="antPreviewImage"
            />
          }
        />
      </div>
      <button className="buttonLink">see more</button>
    </>
  );
}
export default FeaturedDomains;
