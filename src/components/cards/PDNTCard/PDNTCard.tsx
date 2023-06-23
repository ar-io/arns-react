import { Descriptions } from 'antd';
import { startCase } from 'lodash';
import { useEffect, useState } from 'react';

import { useArweaveCompositeProvider, useIsMobile } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { PDNSMapping, PDNTContractJSON } from '../../../types';
import { isArweaveTransactionID } from '../../../utils';
import eventEmitter from '../../../utils/events';
import CopyTextButton from '../../inputs/buttons/CopyTextButton/CopyTextButton';
import { Loader } from '../../layout';
import './styles.css';

export const PDNT_DETAIL_MAPPINGS: { [x: string]: string } = {
  name: 'Nickname',
  id: 'ANT Contract ID',
  expiration: 'Lease Expiration',
  maxUndernames: 'Max Undernames',
  ttlSeconds: 'TTL Seconds',
  controller: 'Controllers',
};

export function mapKeyToAttribute(key: string) {
  if (PDNT_DETAIL_MAPPINGS[key]) {
    return PDNT_DETAIL_MAPPINGS[key];
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

function PDNTCard(props: PDNSMapping) {
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
    showTier = false,
  } = props;
  const [{ pdnsSourceContract }] = useGlobalState();
  const [pdntDetails, setPDNTDetails] = useState<{ [x: string]: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [limitDetails, setLimitDetails] = useState(true);

  useEffect(() => {
    setDetails({ state });
  }, [id, domain, compact, enableActions, overrides]);

  async function setDetails({ state }: { state?: PDNTContractJSON }) {
    try {
      setIsLoading(true);
      let pdntContractState = undefined;
      if (state) {
        pdntContractState = state;
      }
      if (id && !state) {
        pdntContractState =
          await arweaveDataProvider.getContractState<PDNTContractJSON>(id);
      }
      if (!pdntContractState) {
        throw new Error(
          'No state passed and unable to generate ANT contract state',
        );
      }

      const tiers = pdnsSourceContract.tiers;

      const tierDetails = pdnsSourceContract.records[domain]
        ? tiers.history.find(
            (tier) => tier.id === pdnsSourceContract.records[domain].tier,
          )
        : undefined;

      const tierNumber = Object.keys(tiers.current).find(
        (key: string) => tiers.current[+key] === tierDetails?.id,
      );

      const allPDNTDetails: { [x: string]: any } = {
        ...pdntContractState,
        // TODO: remove this when all pdnts have controllers
        controllers: pdntContractState.controllers
          ? pdntContractState.controllers.join(',')
          : pdntContractState.owner,
        tier: tierNumber,
        maxUndernames: tierDetails?.settings.maxUndernames ?? 100,
        ...overrides,
        id: id?.toString() ?? 'N/A',
        domain,
      };

      const filteredPDNTDetails = Object.keys(allPDNTDetails).reduce(
        (obj: any, key: string) => {
          if (!disabledKeys?.includes(key)) {
            if (typeof allPDNTDetails[key] === 'object') return obj;
            obj[key] = allPDNTDetails[key];
          }
          return obj;
        },
        {},
      );
      // TODO: consolidate this logic that sorts and updates key values
      const replacedKeys = Object.keys(filteredPDNTDetails)
        .sort()
        .reduce((obj: any, key: string) => {
          // TODO: flatten recursive objects like subdomains, filter out for now
          if (typeof allPDNTDetails[key] === 'object') return obj;
          obj[mapKeyToAttribute(key)] = allPDNTDetails[key];
          return obj;
        }, {});
      setLimitDetails(compact ?? true);
      setPDNTDetails(replacedKeys);
    } catch (error) {
      eventEmitter.emit('error', error);
      setPDNTDetails(undefined);
    } finally {
      setIsLoading(false);
    }
  }

  function showMore(e: any) {
    e.preventDefault();
    setLimitDetails(!limitDetails);
  }

  // TODO: update this logic
  function handleClick() {
    alert('Coming soon!');
  }

  return (
    <>
      {isLoading ? (
        <Loader size={80} />
      ) : pdntDetails ? (
        <div className={hover ? 'flex flex-column hover' : 'flex flex-column'}>
          {!showTier ? (
            <></>
          ) : (
            <span className="bubble">Tier {pdntDetails.tier}</span>
          )}
          <div className="flex flex-center" style={{ width: '100%' }}>
            <Descriptions
              bordered
              colon
              column={1}
              className="flex"
              style={{ width: '100%' }}
            >
              {Object.entries(pdntDetails).map(([key, value]) => {
                if (!PRIMARY_DETAILS.includes(key) && limitDetails) {
                  return;
                }
                return (
                  <Descriptions.Item
                    key={key}
                    label={`${key}:`}
                    labelStyle={{
                      width: 'fit-content',
                      color: 'var(--text-faded)',
                      border: 'solid 1px #292A2B',
                      borderLeft: 'none',
                      borderRight: 'none',
                    }}
                    contentStyle={{
                      width: 'fit-content',
                      minWidth: '200px',
                      maxWidth: '600px',
                      color: 'white',
                      border: 'solid 1px #292A2B',
                      borderLeft: 'none',
                      borderRight: 'none',
                      textAlign: 'left',
                    }}
                  >
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
                          fontFamily: 'Rubik',
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
                  </Descriptions.Item>
                );
              })}
            </Descriptions>
          </div>

          <div
            className={`flex flex-space-between`}
            style={{ display: 'flex', width: '100%', boxSizing: 'border-box' }}
          >
            <div>
              {compact ? (
                limitDetails ? (
                  <button
                    className="outline-button center faded"
                    onClick={showMore}
                    style={{
                      borderColor: 'var(--text-faded)',
                      padding: 0,
                      fontSize: '15px',
                      width: 120,
                      height: 50,
                      color: 'var(--text-faded)',
                    }}
                  >
                    View More
                  </button>
                ) : (
                  <button
                    className="outline-button center faded"
                    onClick={showMore}
                    style={{
                      borderColor: 'var(--text-faded)',
                      padding: 0,
                      fontSize: '15px',
                      width: 120,
                      height: 50,
                      color: 'var(--text-faded)',
                    }}
                  >
                    View Less
                  </button>
                )
              ) : (
                <></>
              )}
            </div>

            <div className="flex flex-center">
              {enableActions ? (
                <button
                  className="accent-button center "
                  onClick={handleClick}
                  style={{
                    padding: 0,
                    fontSize: '15px',
                    width: 120,
                    height: 50,
                  }}
                >
                  Upgrade
                </button>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
      ) : (
        <span className="section-header">Uh oh. Something went wrong.</span>
      )}
    </>
  );
}

export default PDNTCard;
