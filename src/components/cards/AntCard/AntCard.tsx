import { startCase } from 'lodash';
import { useEffect, useState } from 'react';

import { useArweaveCompositeProvider, useIsMobile } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { ANTContractJSON, ArNSMapping } from '../../../types';
import eventEmitter from '../../../utils/events';
import { isArweaveTransactionID } from '../../../utils/searchUtils';
import CopyTextButton from '../../inputs/buttons/CopyTextButton/CopyTextButton';
import { Loader } from '../../layout';
import './styles.css';

export const ANT_DETAIL_MAPPINGS: { [x: string]: string } = {
  name: 'Nickname',
  id: 'ANT Contract ID',
  expiration: 'Lease Expiration',
  maxUndernames: 'Max Undernames',
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

function AntCard(props: ArNSMapping) {
  const isMobile = useIsMobile();
  const arweaveDataProvider = useArweaveCompositeProvider();
  const {
    state,
    id,
    domain,
    compact,
    overrides,
    hover,
    enableActions,
    disabledKeys,
    showTier = true,
  } = props;
  const [{ arnsSourceContract }] = useGlobalState();
  const [antDetails, setAntDetails] = useState<{ [x: string]: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [limitDetails, setLimitDetails] = useState(true);

  useEffect(() => {
    setDetails({ state });
  }, [id, domain, compact, enableActions, overrides]);

  async function setDetails({ state }: { state?: ANTContractJSON }) {
    try {
      setIsLoading(true);
      let antContractState = undefined;
      if (state) {
        antContractState = state;
      }
      if (id && !state) {
        antContractState =
          await arweaveDataProvider.getContractState<ANTContractJSON>(id);
      }
      if (!antContractState) {
        throw new Error(
          'No state passed and unable to generate ANT contract state',
        );
      }

      const tiers = arnsSourceContract.tiers;

      const tierDetails = arnsSourceContract.records[domain]
        ? tiers.history.find(
            (tier) => tier.id === arnsSourceContract.records[domain].tier,
          )
        : undefined;

      const tierNumber = Object.keys(tiers.current).find(
        (key: string) => tiers.current[+key] === tierDetails?.id,
      );

      const allAntDetails: { [x: string]: any } = {
        ...antContractState,
        // TODO: remove this when all ants have controllers
        controllers: antContractState.controllers
          ? antContractState.controllers.join(',')
          : antContractState.owner,
        tier: tierNumber,
        maxUndernames: tierDetails?.settings.maxUndernames ?? 100,
        ...overrides,
        id: id?.toString() ?? 'N/A',
        domain,
      };

      const filteredAntDetails = Object.keys(allAntDetails).reduce(
        (obj: any, key: string) => {
          if (!disabledKeys?.includes(key)) {
            if (typeof allAntDetails[key] === 'object') return obj;
            obj[key] = allAntDetails[key];
          }
          return obj;
        },
        {},
      );
      // TODO: consolidate this logic that sorts and updates key values
      const replacedKeys = Object.keys(filteredAntDetails)
        .sort()
        .reduce((obj: any, key: string) => {
          // TODO: flatten recursive objects like subdomains, filter out for now
          if (typeof allAntDetails[key] === 'object') return obj;
          obj[mapKeyToAttribute(key)] = allAntDetails[key];
          return obj;
        }, {});
      setLimitDetails(compact ?? true);
      setAntDetails(replacedKeys);
    } catch (error) {
      eventEmitter.emit('error', error);
      setAntDetails(undefined);
    } finally {
      setIsLoading(false);
    }
  }

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
        <div
          className={hover ? 'card hover' : 'card'}
          style={{ padding: '30px 30px' }}
        >
          {!showTier ? (
            <></>
          ) : (
            <span className="bubble">Tier {antDetails.tier}</span>
          )}
          <table style={{ borderSpacing: '0em 0.5em', padding: '0px' }}>
            <tbody>
              {Object.entries(antDetails).map(([key, value]) => {
                if (!PRIMARY_DETAILS.includes(key) && limitDetails) {
                  return;
                }
                return (
                  <tr key={key} style={{ height: '20px' }}>
                    <td className="detail left" style={{ padding: '5px' }}>
                      {key}:
                    </td>
                    <td className="detail bold left" style={{ padding: '5px' }}>
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
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                          }}
                          position={'relative'}
                        />
                      ) : value ? (
                        value
                      ) : (
                        <span>N/A</span>
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
          <div
            className="flex flex-center"
            style={{ display: 'flex', width: '100%' }}
          >
            {enableActions ? (
              <div
                className="footer flex flex-center"
                style={{ width: '100%' }}
              >
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
          </div>
        </div>
      ) : (
        <span className="section-header">Uh oh. Something went wrong.</span>
      )}
    </>
  );
}

export default AntCard;
