import { startCase } from 'lodash';
import { useEffect, useState } from 'react';

import { defaultDataProvider } from '../../../services/arweave';
import { ArNSMapping } from '../../../types';
import { Loader } from '../../layout';
import './styles.css';

const ANT_DETAIL_MAPPINGS: { [x: string]: string } = {
  name: 'Nickname',
  id: 'ANT Contract ID',
  leaseDuration: 'Lease Duration',
  ttlSeconds: 'TTL Seconds',
};

function mapKeyToAttribute(key: string) {
  if (ANT_DETAIL_MAPPINGS[key]) {
    return ANT_DETAIL_MAPPINGS[key];
  }
  return startCase(key);
}

const PRIMARY_DETAILS: string[] = [
  'id',
  'domain',
  'owner',
  'controller',
  'ticker',
  'nickname',
].map((i) => mapKeyToAttribute(i));
const DEFAULT_ATTRIBUTES = {
  ttlSeconds: 60 * 60,
  leaseDuration: 'N/A',
  maxSubdomains: 100,
};

function AntCard(props: ArNSMapping) {
  const { id, domain, compact, overrides, hover, enableActions } = props;
  const [antDetails, setAntDetails] = useState<{ [x: string]: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [limitDetails, setLimitDetails] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const dataProvider = defaultDataProvider();
    dataProvider.getContractState(id).then((antContractState) => {
      if (!antContractState) {
        setAntDetails(undefined);
        return;
      }
      const allAntDetails: { [x: string]: any } = {
        ...antContractState,
        ...DEFAULT_ATTRIBUTES,
        // TODO: remove this when all ants have controllers
        controllers: antContractState.controllers
          ? antContractState.controllers.join(',')
          : antContractState.owner,
        tier: antContractState.tier ? antContractState.tier : 1,
        ...overrides,
        id,
        domain,
      };
      // TODO: consolidate this logic that sorts and updates key values
      const replacedKeys = Object.keys(allAntDetails)
        .sort()
        .reduce((obj: any, key: string) => {
          // TODO: flatten recursive objects like subdomains, filter out for now
          if (typeof allAntDetails[key] === 'object') return obj;
          obj[mapKeyToAttribute(key)] = allAntDetails[key];
          return obj;
        }, {});
      setLimitDetails(compact ?? true);
      setAntDetails(replacedKeys);
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    });
  }, [id, domain, compact, enableActions, overrides]);

  function showMore(e: any) {
    e.preventDefault();
    setLimitDetails(false);
  }

  // TODO: update this logic
  function handleClick() {
    console.log('Coming soon!');
  }

  return (
    <>
      {isLoading ? (
        <Loader size={50} />
      ) : antDetails ? (
        <div className={hover ? 'card hover' : 'card'}>
          <span className="bubble">Tier {antDetails.Tier}</span>
          {Object.entries(antDetails).map(([key, value]) => {
            if (!PRIMARY_DETAILS.includes(key) && limitDetails) {
              return;
            }
            return (
              <span className="detail" key={key}>
                {key}:&nbsp;<b>{value}</b>
              </span>
            );
          })}
          {limitDetails ? (
            <span className="detail">
              <button className="link left" onClick={showMore}>
                more details
              </button>
            </span>
          ) : (
            <></>
          )}
          {enableActions ? (
            <div className="footer">
              <button className="button-large" onClick={handleClick}>
                Upgrade Tier
              </button>
              <button className="button-large" onClick={handleClick}>
                Extend Lease
              </button>
            </div>
          ) : (
            <></>
          )}
        </div>
      ) : (
        <span className="section-header">Uh oh. Something went wrong.</span>
      )}
    </>
  );
}

export default AntCard;
