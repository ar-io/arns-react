import AntCard from "./cards/AntCard"
import previewImage from '../images/antCardPreviewDefault.png';


function FeaturedDomains(){
    return (
        <>
        <p className="sectionHeader">Featured Domains</p>
        <div className="featuredDomains">
        <AntCard
        arnsName={"sam"}
        gateway={"arweave.dev"}
        expiry={1664643782}
        preview={<img src={previewImage} alt="" width="100%" height={'100%'}/>}
        />
        <AntCard
        arnsName={"ipfs"}
        gateway={"arweave.net"}
        expiry={1664243982}
        preview={<img src={previewImage} alt="" width="100%" height={'100%'}/>}
        />
        <AntCard
        arnsName={"arwiki"}
        gateway={"arweave.dev"}
        expiry={1664713182}
        preview={<iframe src="http://arwiki.arweave.dev" frameBorder={0} width={'inherit'} height={'inherit'}/>}
        />
        </div>
        <button className="buttonLink">see more</button>
        </>
    )
}
export default FeaturedDomains