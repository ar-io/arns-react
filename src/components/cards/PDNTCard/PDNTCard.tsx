import { Descriptions } from 'antd';
import { startCase } from 'lodash';
import { isValidElement, useEffect, useState } from 'react';

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
  lowerCaseDomain,
} from '../../../utils';
import { MIN_TTL_SECONDS } from '../../../utils/constants';
import eventEmitter from '../../../utils/events';
import { Loader } from '../../layout';
import ArweaveID, { ArweaveIdTypes } from '../../layout/ArweaveID/ArweaveID';
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
  controller: 'Controller(s)',
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
    deployedTransactionId,
    mobileView,
    bordered = false,
  } = props;
  const [{ pdnsSourceContract }] = useGlobalState();
  const [pdntDetails, setPDNTDetails] = useState<{ [x: string]: any }>();
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
      const name = lowerCaseDomain(domain);

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
      const undernameCount = pdnsSourceContract.records[name]?.undernames;

      const allPDNTDetails: Record<AntDetailKey, any> = {
        // TODO: remove this when all pdnts have controllers
        deployedTransactionId: deployedTransactionId
          ? deployedTransactionId.toString()
          : undefined,
        contractTxId: contractTxId?.toString() ?? 'N/A',
        domain: decodeDomainToASCII(domain),
        leaseDuration: pdnsSourceContract.records[name]
          ? pdnsSourceContract.records[name].endTimestamp
            ? +pdnsSourceContract.records[name].endTimestamp! * 1000
            : 'Indefinite'
          : 'N/A',
        maxUndernames: 'Up to ' + undernameCount,
        name: antContractState.name,
        ticker: antContractState.ticker,
        owner: antContractState.owner,
        controller: antContractState.controllers
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
        (obj: { [x: string]: any }, key: string) => {
          const value = allPDNTDetails[key as AntDetailKey];
          if (!disabledKeys?.includes(key)) {
            if (typeof value === 'object' && !isValidElement(value)) {
              return obj;
            }
            obj[key] = value;
          }
          return obj;
        },
        {},
      );

      const replacedKeys = Object.keys(filteredPDNTDetails).reduce(
        (obj: any, key: string) => {
          const value = allPDNTDetails[key as AntDetailKey];
          if (typeof value === 'object' && !isValidElement(value)) {
            return obj;
          }
          obj[mapKeyToAttribute(key as AntDetailKey)] = value;
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

  function handleLinkType(key: string) {
    if (key === 'Controllers' || key === 'Owner') {
      return ArweaveIdTypes.ADDRESS;
    }
    if (key === 'Contract ID') {
      return ArweaveIdTypes.CONTRACT;
    }
    return ArweaveIdTypes.TRANSACTION;
  }

  if (isLoading) {
    return <Loader size={80} />;
  }

  if (!pdntDetails) {
    return <span className="section-header">Uh oh. Something went wrong.</span>;
  }

  return (
    <div
      className={
        hover ? 'flex flex-column hover fade-in' : 'flex flex-column fade-in'
      }
      style={{ gap: '20px' }}
    >
      <div className="flex flex-center" style={{ width: '100%' }}>
        <Descriptions
          key={limitDetails ? 'limit' : 'full'}
          bordered={bordered}
          colon
          column={1}
          layout={mobileView ? 'vertical' : 'horizontal'}
          style={{ width: '100%' }}
        >
          {Object.entries(pdntDetails).map(([key, value]) => {
            const numberValue = +value;
            if ((!mappedKeys.includes(key) && limitDetails) || !value) {
              return;
            }
            return (
              <Descriptions.Item
                key={key}
                label={`${key}`}
                labelStyle={{
                  width: 'fit-content',
                  color: 'var(--text-grey)',
                  border: bordered ? 'solid 1px var(--text-faded)' : '',
                  borderLeft: 'none',
                  borderRight: 'none',
                }}
                contentStyle={{
                  width: 'fit-content',
                  minWidth: '200px',
                  maxWidth: '600px',
                  color: 'white',
                  border: bordered ? 'solid 1px var(--text-faded)' : '',
                  borderLeft: 'none',
                  borderRight: 'none',
                  textAlign: 'left',
                }}
              >
                {isArweaveTransactionID(value) ? (
                  <ArweaveID
                    id={new ArweaveTransactionID(value)}
                    type={handleLinkType(key)}
                    shouldLink
                    characterCount={isMobile ? 4 : undefined}
                  />
                ) : key === 'Lease Duration' ? (
                  <span>
                    {isNaN(numberValue) ? (
                      value
                    ) : (
                      <>
                        {getLeaseDurationFromEndTimestamp(
                          Date.now(),
                          numberValue,
                        )}{' '}
                        year
                        {getLeaseDurationFromEndTimestamp(
                          Date.now(),
                          numberValue,
                        ) > 1
                          ? 's'
                          : ''}
                        &nbsp;
                        <span style={{ color: 'var(--text-grey)' }}>
                          (expires approximately{' '}
                          {+value
                            ? Intl.DateTimeFormat('en', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              }).format(numberValue)
                            : 'N/A'}
                          )
                        </span>
                      </>
                    )}
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
              color: 'var(--text-grey)',
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
