import { useEffect, useState } from 'react';
import { LocalFileSystemDataProvider } from '../../../services/arweave/LocalFilesystemDataProvider.js';
import './styles.css';


const ANT_DETAIL_MAPPINGS: { [x: string]: string} = {
    name: 'Domain',
    id: 'ANT Contract ID',
    leaseDuration: "Lease Duration",
    ttlSeconds: "TTL Seconds"
}

function mapKeyToAttribute(key: string) {
    if (!!ANT_DETAIL_MAPPINGS[key]) {
        return ANT_DETAIL_MAPPINGS[key];
    }
    return key;
}

const PRIMARY_DETAILS: string[] = ["id", "name", "owner", "controller", "ticker", "tier", "nickname"].map(i => mapKeyToAttribute(i));


function AntCard({ contractId }: { contractId: string}) {
  // fetch ant details
  const [antDetails, setAntDetails] = useState<{[x: string]: string}>({})
  const [limitDetails, setLimitDetails] = useState(true)

  useEffect(() => {
    const dataProvider = new LocalFileSystemDataProvider();
    dataProvider.getContractState(contractId).then(antContractState => {
        console.log(antContractState)
        if(!antContractState){
            return;
        }
        const allAntDetails: {[x: string]: any} = {...antContractState, id: contractId, tier: 1, "nickname": "N/A", "ttlSeconds": "60 seconds", "leaseDuration": "N/A", "subdomains": "Up to 100"};
        const replacedKeys = Object.keys(allAntDetails).reduce((obj: any, key: string) => {
            if (typeof allAntDetails[key] !== "string") return;
            obj[mapKeyToAttribute(key)] = allAntDetails[key];
            return obj;
        }, {});
        const sortedAntDetails = Object.keys(replacedKeys).sort().reduce((obj: any, key: string) => {
            obj[key] = replacedKeys[key];
            return obj;
        }, {})
        setAntDetails(sortedAntDetails);
    });
  }, [contractId]);

  function showMore(e: any){
    e.preventDefault();
    setLimitDetails(false)
  }


  return (
    <div className="card">
    {
        antDetails ? Object.entries(antDetails).sort((a: any, b: any) => a[1] - b[1]).map(([key, value]) => {
            if (!PRIMARY_DETAILS.includes(key) && limitDetails){
                return;
            }
            return <span className="detail" key={key}>{key}:&nbsp;<b>{value}</b></span>
        }): <span className="detail">Failed to fetch ANT details.</span>
      }
      {
        limitDetails ? 
        <a onClick={showMore} className='link'>more details...</a> : <></>
      }{
        <button className="buttonLarge">Upgrade</button>
      }
    </div>
  );
}

export default AntCard;
