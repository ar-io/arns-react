import { startCase } from 'lodash';
import { useEffect, useState } from 'react';

import { useIsMobile } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { ArNSMapping } from '../../../types';
import { isArweaveTransactionID } from '../../../utils/searchUtils';
import CopyTextButton from '../../inputs/buttons/CopyTextButton/CopyTextButton';
import { Loader } from '../../layout';
import './styles.css';

export const ANT_DETAIL_MAPPINGS: { [x: string]: string } = {
  name: 'Nickname',
  id: 'ANT Contract ID',
  leaseDuration: 'Lease Duration',
  ttlSeconds: 'TTL Seconds',
  controller: 'Controllers',
};

export function mapKeyToAttribute(key: string) {
  if (ANT_DETAIL_MAPPINGS[key]) {
    return ANT_DETAIL_MAPPINGS[key];
  }
  return startCase(key);
}

export const PRIMARY_DETAILS: string[] = [
  'id',
  'domain',
  'owner',
  'controller',
  'ticker',
  'nickname',
].map((i) => mapKeyToAttribute(i));

export const DEFAULT_ATTRIBUTES = {
  ttlSeconds: 60 * 60,
  leaseDuration: 'N/A',
  maxSubdomains: 100,
};

function AntCard(props: ArNSMapping) {
  const isMobile = useIsMobile();
  const [{ arweaveDataProvider }] = useGlobalState();
  const { id, domain, compact, overrides, hover, enableActions } = props;
  const [antDetails, setAntDetails] = useState<{ [x: string]: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [limitDetails, setLimitDetails] = useState(true);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      arweaveDataProvider
        .getContractState(id)
        .then((antContractState) => {
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
            id: id.toString(),
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
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
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
        <Loader size={80} />
      ) : antDetails ? (
        <div className={hover ? 'card hover' : 'card'}>
          <span className="bubble">Tier {antDetails.Tier}</span>
          <table style={{ borderSpacing: '0em 1em', padding: '0px' }}>
            <tbody>
              {Object.entries(antDetails).map(([key, value]) => {
                if (!PRIMARY_DETAILS.includes(key) && limitDetails) {
                  return;
                }
                return (
                  <tr key={key} style={{ height: '25px' }}>
                    <td className="detail left">{key}:</td>
                    <td className="detail bold left">
                      {isArweaveTransactionID(value) ? (
                        <CopyTextButton
                          displayText={
                            isMobile
                              ? `${value.slice(0, 2)}...${value.slice(-2)}`
                              : value
                          }
                          copyText={value}
                          size={24}
                          wrapperStyle={{
                            padding: '0px',
                            fontFamily: 'Rubik-Bold',
                          }}
                          position={'relative'}
                        />
                      ) : (
                        value
                      )}
                    </td>
                  </tr>
                );
              })}
              {limitDetails ? (
                <tr>
                  <td className="detail">
                    <button className="link" onClick={showMore}>
                      more details
                    </button>
                  </td>
                </tr>
              ) : (
                <></>
              )}
            </tbody>
          </table>
          <tfoot>
            {enableActions ? (
              <div className="footer">
                <button className="outline-button" onClick={handleClick}>
                  Upgrade Tier
                </button>
                <button className="outline-button" onClick={handleClick}>
                  Extend Lease
                </button>
              </div>
            ) : (
              <></>
            )}
          </tfoot>
        </div>
      ) : (
        <span className="section-header">Uh oh. Something went wrong.</span>
      )}
    </>
  );
}

export default AntCard;
