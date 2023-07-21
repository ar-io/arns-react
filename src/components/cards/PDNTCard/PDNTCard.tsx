import { Descriptions } from 'antd';
import { startCase } from 'lodash';
import { useEffect, useState } from 'react';

import { useArweaveCompositeProvider, useIsMobile } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import {
  ArweaveTransactionID,
  PDNSMapping,
  PDNTContractJSON,
} from '../../../types';
import {
  decodeDomainToASCII,
  getLeaseDurationFromEndTimestamp,
  isArweaveTransactionID,
} from '../../../utils';
import { MIN_TTL_SECONDS } from '../../../utils/constants';
import eventEmitter from '../../../utils/events';
import CopyTextButton from '../../inputs/buttons/CopyTextButton/CopyTextButton';
import { Loader } from '../../layout';
import './styles.css';

export const ANT_TRANSACTION_DETAILS = {
  deployedTransactionId: 'Transaction ID',
  contractTxId: 'Contract ID',
};
export const ARNS_METADATA_DETAILS = {
  domain: 'Domain',
  leaseDuration: 'Lease Duration',
  maxUndernames: 'Undernames',
};
export const ANT_MAIN_DETAILS = {
  name: 'Nickname',
  ticker: 'Ticker',
  owner: 'Owner',
  controller: 'Controllers',
};
export const ANT_METADATA_DETAILS = {
  targetId: 'Target ID',
  ttlSeconds: 'TTL Seconds',
};

export const ANT_DETAIL_MAPPINGS = {
  ...ANT_TRANSACTION_DETAILS,
  ...ARNS_METADATA_DETAILS,
  ...ANT_MAIN_DETAILS,
  ...ANT_METADATA_DETAILS,
};

export type AntDetailKey = keyof typeof ANT_DETAIL_MAPPINGS;

export function mapKeyToAttribute(key: AntDetailKey) {
  if (ANT_DETAIL_MAPPINGS[key]) {
    return ANT_DETAIL_MAPPINGS[key];
  }
  return startCase(key);
}

export const DEFAULT_PRIMARY_KEYS: string[] = [
  'contractTxId',
  'domain',
  'leaseDuration',
  'nickname',
  'ticker',
  'owner',
];

function PDNTCard(props: PDNSMapping) {
  const isMobile = useIsMobile();
  const arweaveDataProvider = useArweaveCompositeProvider();
  const {
    state,
    contractTxId,
    domain,
    compact,
    overrides,
    hover,
    enableActions,
    disabledKeys,
    primaryKeys,
  } = props;
  const [{ pdnsSourceContract }] = useGlobalState();
  const [pdntDetails, setPDNTDetails] = useState<{ [x: string]: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [limitDetails, setLimitDetails] = useState(true);
  const [mappedKeys, setMappedKeys] = useState<string[]>([]);

  useEffect(() => {
    setDetails({ state });
    const newMappedKeys = [...(primaryKeys ?? [...DEFAULT_PRIMARY_KEYS])].map(
      (i: string) => mapKeyToAttribute(i as AntDetailKey),
    );
    setMappedKeys(newMappedKeys);
  }, [contractTxId, domain, compact, enableActions, overrides]);

  async function setDetails({ state }: { state?: PDNTContractJSON }) {
    try {
      setIsLoading(true);

      let antContractState = undefined;
      if (state) {
        antContractState = state;
      }
      if (contractTxId && !state) {
        antContractState = await arweaveDataProvider
          .getContractState<PDNTContractJSON>(
            new ArweaveTransactionID(contractTxId.toString()),
          )
          .catch(() => {
            throw new Error(
              `Unable to fetch ANT contract state for "${domain}": ${contractTxId}`,
            );
          });
      }
      if (!antContractState) {
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

      const allPDNTDetails: typeof ANT_DETAIL_MAPPINGS = {
        // TODO: remove this when all pdnts have controllers
        contractTxId: contractTxId?.toString() ?? 'N/A',
        domain: decodeDomainToASCII(domain),
        // TODO: update lease duration to fetch lease duration from contract
        leaseDuration: pdnsSourceContract.records[domain]
          ? +pdnsSourceContract.records[domain].endTimestamp * 1000
          : 'N/A',
        maxUndernames: 'Up to ' + tierDetails?.settings.maxUndernames ?? 100,
        ...overrides,
        name: antContractState.name,
        ticker: antContractState.ticker,
        owner: antContractState.owner,
        controllers: antContractState.controllers
          ? antContractState.controllers.join(',')
          : antContractState.owner,
        targetId:
          typeof antContractState.records['@'] === 'string'
            ? antContractState.records['@']
            : antContractState.records['@'].transactionId,
        ttlSeconds:
          typeof antContractState.records['@'] === 'string'
            ? MIN_TTL_SECONDS
            : antContractState.records['@'].ttlSeconds,
        ...overrides,
      };

      const filteredPDNTDetails = Object.keys(allPDNTDetails).reduce(
        (obj: { [x: string]: string }, key: string) => {
          if (!disabledKeys?.includes(key)) {
            if (typeof allPDNTDetails[key as AntDetailKey] === 'object')
              return obj;
            obj[key] = allPDNTDetails[key as AntDetailKey];
          }
          return obj;
        },
        {},
      );
      // TODO: consolidate this logic that sorts and updates key values
      const replacedKeys = Object.keys(filteredPDNTDetails).reduce(
        (obj: any, key: string) => {
          // TODO: flatten recursive objects like subdomains, filter out for now
          if (typeof allPDNTDetails[key as AntDetailKey] === 'object')
            return obj;
          obj[mapKeyToAttribute(key as AntDetailKey)] =
            allPDNTDetails[key as AntDetailKey];
          return obj;
        },
        {},
      );
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
    setIsLoading(true);
    setLimitDetails(!limitDetails);
    setIsLoading(false);
  }

  if (isLoading) {
    return <Loader size={80} />;
  }

  if (!pdntDetails) {
    return <span className="section-header">Uh oh. Something went wrong.</span>;
  }

  return (
    <div
      className={hover ? 'flex flex-column hover' : 'flex flex-column'}
      style={{ gap: '20px' }}
    >
      <div className="flex flex-center" style={{ width: '100%' }}>
        <Descriptions
          key={limitDetails ? 'limit' : 'full'}
          bordered
          colon
          column={1}
          style={{ width: '100%' }}
        >
          {Object.entries(pdntDetails).map(([key, value]) => {
            if (!mappedKeys.includes(key) && limitDetails) {
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
                    size={15}
                    wrapperStyle={{
                      padding: '0px',
                      fontFamily: 'Rubik',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      fill: 'var(--text-faded)',
                    }}
                    position={'relative'}
                  />
                ) : key === 'Lease Duration' ? (
                  <span>
                    {getLeaseDurationFromEndTimestamp(Date.now(), +value)} year
                    {getLeaseDurationFromEndTimestamp(Date.now(), +value) > 1
                      ? 's'
                      : ''}
                    &nbsp;
                    <span style={{ color: 'var(--text-faded)' }}>
                      (expires approximately{' '}
                      {Intl.DateTimeFormat('en', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }).format(+value)}
                      )
                    </span>
                  </span>
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
        {compact ? (
          <button
            className="outline-button center faded"
            onClick={showMore}
            style={{
              borderColor: '#38393b',
              padding: 0,
              fontSize: '15px',
              width: '100%',
              height: 50,
              color: 'var(--text-faded)',
            }}
          >
            {limitDetails ? 'View More' : 'View Less'}
          </button>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

export default PDNTCard;
