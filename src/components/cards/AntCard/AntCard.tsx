import { useEffect, useState } from 'react';
import { startCase } from 'lodash';
import { LocalFileSystemDataProvider } from '../../../services/arweave/LocalFilesystemDataProvider';
import { AntCardProps } from '../../../types';
import './styles.css';

const ANT_DETAIL_MAPPINGS: { [x: string]: string } = {
  name: 'Domain',
  id: 'ANT Contract ID',
  leaseDuration: 'Lease Duration',
  ttlSeconds: 'TTL Seconds',
};

function mapKeyToAttribute(key: string) {
  if (!!ANT_DETAIL_MAPPINGS[key]) {
    return ANT_DETAIL_MAPPINGS[key];
  }
  return startCase(key);
}

const PRIMARY_DETAILS: string[] = [
  'id',
  'name',
  'owner',
  'controller',
  'ticker',
  'tier',
  'nickname',
].map((i) => mapKeyToAttribute(i));
const DEFAULT_ATTRIBUTES = {
  tier: 1,
  nickname: 'N/A',
  ttlSeconds: 60 * 60,
  leaseDuration: 'N/A',
  subdomains: 'Up to 100',
};

function AntCard(props: AntCardProps) {
  const { contractId } = props;
  const [antDetails, setAntDetails] = useState<{ [x: string]: string }>({});
  const [limitDetails, setLimitDetails] = useState(true);

  useEffect(() => {
    const dataProvider = new LocalFileSystemDataProvider();
    dataProvider.getContractState(contractId).then((antContractState) => {
      if (!antContractState) {
        return;
      }
      const allAntDetails: { [x: string]: any } = {
        ...antContractState,
        id: contractId,
        ...DEFAULT_ATTRIBUTES,
      };
      // TODO: consolidate this logic that sorts and updates key values
      const replacedKeys = Object.keys(allAntDetails).sort().reduce(
        (obj: any, key: string) => {
          // TODO: flatten recursive objects like subdomains, filter out for now
          if (typeof allAntDetails[key] === 'object') return obj;
          obj[mapKeyToAttribute(key)] = allAntDetails[key];
          return obj;
        },
        {},
      )
      setAntDetails(replacedKeys);
    });
  }, [contractId]);

  function showMore(e: any) {
    e.preventDefault();
    setLimitDetails(false);
  }

  // TODO: update this logic
  function handleClick(e: any) {
    console.log('Coming soon!');
  }

  return (
    <div className="card">
      {antDetails ? (
        Object.entries(antDetails).map(([key, value]) => {
          if (!PRIMARY_DETAILS.includes(key) && limitDetails) {
            return;
          }
          return (
            <span className="detail" key={key}>
              {key}:&nbsp;<b>{value}</b>
            </span>
          );
        })
      ) : (
        <></>
      )}
      {antDetails && limitDetails ? (
        <a onClick={showMore} className="link">
          more details...
        </a>
      ) : (
        <></>
      )}
      {antDetails ? (
        <button className="buttonLarge" onClick={handleClick}>
          Upgrade
        </button>
      ) : (
        <></>
      )}
    </div>
  );
}

export default AntCard;
