import { Pagination, PaginationProps, Tooltip } from 'antd';
import { useEffect, useRef, useState } from 'react';

import { useArweaveCompositeProvider } from '../../../../hooks';
import { useGlobalState } from '../../../../state/contexts/GlobalState';
import {
  ArweaveTransactionID,
  PDNTContractJSON,
  VALIDATION_INPUT_TYPES,
} from '../../../../types';
import { isArweaveTransactionID } from '../../../../utils';
import eventEmitter from '../../../../utils/events';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleCheck,
  CirclePlus,
  CircleXIcon,
} from '../../../icons';
import { Loader } from '../../../layout';
import ValidationInput from '../ValidationInput/ValidationInput';

function NameTokenSelector({
  walletAddress,
  selectedTokenCallback,
}: {
  walletAddress: ArweaveTransactionID;
  selectedTokenCallback: (id: ArweaveTransactionID | undefined) => void;
}) {
  const arweaveDataProvider = useArweaveCompositeProvider();
  const [{ pdnsSourceContract }] = useGlobalState();

  const [searchText, setSearchText] = useState<string>();
  const [tokens, setTokens] = useState<{
    [x: string]: Partial<PDNTContractJSON>;
  }>();
  const [loading, setLoading] = useState(false);
  const [filteredTokens, setFilteredTokens] =
    useState<
      Array<{ id: string; name?: string; ticker?: string } | undefined>
    >();
  const [selectedToken, setSelectedToken] = useState<
    { id: string; name: string; ticker: string } | undefined
  >(undefined);
  const [searching, setSearching] = useState<boolean>(false);
  const [searchActive, setSearchActive] = useState(false);
  const [validImport, setValidImport] = useState<boolean | undefined>(
    undefined,
  );

  const listRef = useRef<HTMLDivElement>(null);
  const [listPage, setListPage] = useState<number>(1);
  const listItemCount = 5;

  useEffect(() => {
    selectedTokenCallback(
      selectedToken ? new ArweaveTransactionID(selectedToken.id) : undefined,
    );
  }, [selectedToken]);

  useEffect(() => {
    getTokenList(walletAddress);
  }, [walletAddress]);

  useEffect(() => {
    // token import update
    if (searchText) {
      handleTokenSearch(searchText);
      setListPage(1);
    }
  }, [tokens]);

  useEffect(() => {
    if (!listRef.current) {
      return;
    }
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [listRef]);

  function handleClickOutside(e: any) {
    e.preventDefault();
    if (
      listRef.current &&
      e.target !== listRef.current &&
      !listRef.current.contains(e.target)
    ) {
      setSearchText('');
      setSearchActive(false);
      setFilteredTokens(undefined);
      setListPage(1);
    }
  }

  async function getTokenList(
    address: ArweaveTransactionID,
    imports?: ArweaveTransactionID[],
  ) {
    try {
      setLoading(true);
      const fetchedIds = await arweaveDataProvider.getContractsForWallet(
        pdnsSourceContract.approvedANTSourceCodeTxs.map(
          (sourceCode) => new ArweaveTransactionID(sourceCode),
        ),
        address,
      );
      if (!fetchedIds.ids) {
        throw new Error(
          'Unable to find any Name Tokens for the provided address',
        );
      }
      if (imports) {
        imports.map((id) =>
          arweaveDataProvider
            .validateTransactionTags({
              id: id.toString(),
              requiredTags: {
                'Contract-Src': pdnsSourceContract.approvedANTSourceCodeTxs,
              },
            })
            .catch(() => {
              if (searchText) {
                setValidImport(false);
              }
              throw new Error('Invalid ANT Contract.');
            }),
        );
        setValidImport(true);
      }
      const ids = fetchedIds.ids.concat(imports ?? []);

      const contracts: [ArweaveTransactionID, PDNTContractJSON][] =
        await Promise.all(
          ids.map(async (id) => {
            const state = await arweaveDataProvider.getContractState(id);
            return [id, state as PDNTContractJSON];
          }),
        );
      if (!contracts) {
        throw new Error('Unable to get details for Name Tokens');
      }
      const newTokens = contracts.reduce((result, contract) => {
        const [id, state] = contract;
        const { owner, controller, name, ticker } = state;
        return {
          ...result,
          [id.toString()]: { owner, controller, name, ticker },
        };
      }, {});
      setTokens(newTokens);
    } catch (error) {
      eventEmitter.emit('error', error);
    } finally {
      setLoading(false);
      setListPage(1);
    }
  }

  function handleTokenSearch(query: string) {
    try {
      setSearching(true);
      setValidImport(undefined);
      if (!query) {
        setSearchText('');
        setSelectedToken(undefined);
      }
      setSearchText(query);
      console.log(filteredTokens);

      if (!tokens) {
        throw new Error('No Name Tokens Found');
      }
      const filteredResults = Object.keys(tokens)
        .map((id) => {
          const { owner, controller, name, ticker } = tokens[id];
          const queryResult = [owner, controller, name, ticker, id].map(
            (term) =>
              term
                ? term
                    .toString()
                    .toLocaleLowerCase()
                    .includes(query.toLocaleLowerCase())
                : false,
          );
          if (queryResult.includes(true)) {
            return { id: id, name: name ?? '', ticker: ticker ?? '' };
          }
        })
        .filter((n) => n !== undefined);
      if (!filteredResults) {
        throw new Error('No ANT tokens found for that search');
      }

      setFilteredTokens(filteredResults);
    } catch (error) {
      setFilteredTokens(undefined);
      eventEmitter.emit('error', error);
    } finally {
      setSearching(false);
      setListPage(1);
    }
  }

  function handleSetToken({
    id,
    name,
    ticker,
  }: {
    id?: string;
    name?: string;
    ticker?: string;
  }) {
    setSearchText('');
    setFilteredTokens(undefined);

    if (id === undefined) {
      if (selectedToken === undefined) {
        setSearchActive(false);
      }
      return;
    }
    setSelectedToken({ id, name: name ?? '', ticker: ticker ?? '' });
    selectedTokenCallback(new ArweaveTransactionID(id));
    setSearchActive(false);
    setListPage(1);
  }

  const customPreviousAndNextButtons: PaginationProps['itemRender'] = (
    page,
    type,
    originalElement,
  ) => {
    if (type === 'prev') {
      return (
        <button
          className="text-medium outline-button center white custom-change-page-button"
          style={{
            color: 'white',
            height: '25px',
            padding: '5px 10px',
            fontSize: 14,
            borderRadius: 3,
            zIndex: 10,
          }}
        >
          <ChevronLeftIcon width={20} height={20} fill={'var(--text-white)'} />
          &nbsp;Previous Page
        </button>
      );
    }
    if (type === 'next') {
      return (
        <button
          className="text-medium outline-button center"
          style={{
            color: 'white',
            height: '25px',
            padding: '5px 10px',
            fontSize: 14,
            borderRadius: 3,
            zIndex: 10,
          }}
        >
          Next Page&nbsp;
          <ChevronRightIcon width={20} height={20} fill={'var(--text-white)'} />
        </button>
      );
    }

    if (type === 'page' || type === 'jump-prev' || type === 'jump-next') {
      return <div className="custom-pagination-page"></div>;
    }

    return originalElement;
  };
  function updatePage(page: number) {
    setListPage(page);
  }

  return (
    <>
      <div
        ref={listRef}
        className="flex flex-column"
        style={{
          position: 'relative',
          height: 'fit-content',
          maxHeight: '400px',
        }}
      >
        {/* input wrapper */}
        <div
          className="flex flex-row flex-space-between"
          style={{
            alignItems: 'center',
            gap: '1em',
            height: '53px',
            width: '100%',
            border: searchActive ? `0.5px solid var(--text-white)` : 'none',
            borderRadius: '3px',
            boxShadow: searchActive
              ? '0px 0px 4px 1px rgba(255, 255, 255, 0.25)'
              : 'none',
            backgroundColor: 'var(--card-bg)',
            boxSizing: 'border-box',
            position: 'absolute',
            top: 0,
            padding: 10,
          }}
        >
          {!selectedToken ? (
            <button
              className="button center hover"
              style={{ width: 'fit-content' }}
              onClick={() => setSearchActive(true)}
            >
              <CirclePlus width={30} height={30} fill={'var(--text-white)'} />
            </button>
          ) : (
            <CircleCheck width={30} height={30} fill={'var(--text-white)'} />
          )}
          <ValidationInput
            onClick={() => setSearchActive(true)}
            showValidationIcon={validImport !== undefined}
            setValue={(v) => handleTokenSearch(v)}
            value={searchText}
            placeholder={
              selectedToken
                ? `${selectedToken?.name} (${selectedToken?.id})`
                : 'Add an Arweave Name Token (ANT)'
            }
            validationPredicates={{
              [VALIDATION_INPUT_TYPES.PDNT_CONTRACT_ID]: (id: string) =>
                arweaveDataProvider.validateTransactionTags({
                  id,
                  requiredTags: {
                    'Contract-Src': pdnsSourceContract.approvedANTSourceCodeTxs,
                  },
                }),
              [VALIDATION_INPUT_TYPES.TRANSACTION_CONFIRMATIONS]: (
                id: string,
              ) => arweaveDataProvider.validateConfirmations(id),
            }}
            validityCallback={(validity) => validity}
            disabled={!tokens ? true : false}
            wrapperCustomStyle={{
              width: '100%',
              hieght: '50px',
              borderRadius: '3px',
              backgroundColor: 'var(--card-bg)',
              boxSizing: 'border-box',
            }}
            inputClassName="data-input white"
            inputCustomStyle={{
              justifyContent: 'flex-start',
              backgroundColor: 'var(--card-bg)',
              border: 'none',
              boxSizing: 'border-box',
              fontFamily: 'Rubik',
              fontSize: '16px',
              boxShadow: 'none',
            }}
          />
          <span
            className={`flex flex-row text faded flex-center ${
              selectedToken ? 'bold' : ''
            } hover`}
            style={{
              width: 'fit-content',
              height: 'fit-content',
              wordBreak: 'keep-all',
            }}
          >
            {loading || searching ? (
              <Loader size={20} color="var(--text-white)" />
            ) : searchText && validImport === false ? (
              <></>
            ) : searchText &&
              isArweaveTransactionID(searchText) &&
              !Object.keys(tokens ?? []).includes(searchText) ? (
              <button
                className="assets-manage-button text-medium center"
                style={{ width: 'fit-content' }}
                onClick={() => {
                  getTokenList(walletAddress, [
                    new ArweaveTransactionID(searchText),
                  ]);
                }}
              >
                Import
              </button>
            ) : selectedToken ? (
              <button
                className="button flex flex-row center faded bold hover"
                style={{ gap: '1em' }}
                onClick={() => setSelectedToken(undefined)}
              >
                Added{' '}
                <CircleXIcon
                  width={'25px'}
                  height={'25px'}
                  fill={'var(--text-white)'}
                />
              </button>
            ) : (
              <Tooltip
                placement={'right'}
                autoAdjustOverflow={true}
                arrow={false}
                overlayInnerStyle={{
                  width: '190px',
                  color: 'var(--text-black)',
                  textAlign: 'center',
                  fontFamily: 'Rubik-Bold',
                  fontSize: '14px',
                  backgroundColor: 'var(--text-white)',
                  padding: '15px',
                }}
                title={
                  'You can import an ANT by entering its contract ID, or search for one of your own by name, ticker, owner, or controller status, as well is its own contract ID'
                }
              >
                Optional
              </Tooltip>
            )}
          </span>
        </div>
        {/* selector dropdown */}
        {tokens && searchActive ? (
          <div
            className="flex flex-column"
            style={{
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              gap: '1em',
              height: 'fit-content',
              width: '100%',
              border: '0.5px solid var(--text-white)',
              borderRadius: '3px',
              boxShadow: ' 0px 0px 4px 1px rgba(255, 255, 255, 0.25)',
              backgroundColor: 'var(--card-bg)',
              boxSizing: 'border-box',
              padding: '15px',
              top: '53px',
              borderTop: 'none',
              position: 'absolute',
              zIndex: 10,
            }}
          >
            {searchText && !filteredTokens?.length ? (
              <span
                className="text-large center"
                style={{
                  color: 'var(--text-faded)',
                  margin: 'auto',
                  height: '50px',
                }}
              >
                No Results
              </span>
            ) : filteredTokens ? (
              filteredTokens
                .slice(
                  Math.max((listPage - 1) * listItemCount, 0),
                  listPage * listItemCount,
                )
                .map((token, index) => {
                  if (!token) {
                    return;
                  }

                  return (
                    <button
                      key={index}
                      className="flex button left white hover"
                      style={{
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                      }}
                      onClick={() => {
                        handleSetToken({
                          id: token?.id,
                          name: token.name ?? '',
                          ticker: token.ticker ?? '',
                        });
                      }}
                    >
                      {token.name && token.ticker
                        ? `${token.name} (${token.ticker}) - ${token.id}`
                        : token.id}
                    </button>
                  );
                })
            ) : (
              Object.entries(tokens)
                .slice(
                  Math.max((listPage - 1) * listItemCount, 0),
                  listPage * listItemCount,
                )
                .map((token, index) => {
                  if (!token) {
                    return;
                  }
                  const [id, details] = token;
                  const { name, ticker } = details;

                  return (
                    <button
                      key={index}
                      className="flex button left white hover"
                      style={{
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                      }}
                      onClick={() => {
                        handleSetToken({
                          id,
                          name: name ?? '',
                          ticker: ticker ?? '',
                        });
                      }}
                    >
                      {name && ticker ? `${name} (${ticker}) - ${id}` : id}
                    </button>
                  );
                })
            )}
            <div
              className="custom-next-pagination flex flex-column flex-center"
              style={{
                padding: '10px',
                boxSizing: 'border-box',
                width: '100%',
              }}
            >
              <Pagination
                total={
                  tokens && !filteredTokens
                    ? Object.keys(tokens).length
                    : filteredTokens
                    ? filteredTokens.length
                    : 0
                }
                itemRender={customPreviousAndNextButtons}
                showPrevNextJumpers={false}
                showSizeChanger={false}
                showQuickJumper={false}
                onChange={updatePage}
                current={listPage}
                defaultPageSize={listItemCount}
              />
            </div>
            {tokens && Object.keys(tokens).length > 5 ? (
              <div
                className="flex flex-row flex-center faded"
                style={{
                  position: 'absolute',
                  width: '100%',
                  bottom: 30,
                  left: 0,
                }}
              >{`Page ${listPage} of ${
                filteredTokens
                  ? Math.round(filteredTokens.length / listItemCount) || 1
                  : Math.round(Object.keys(tokens).length / listItemCount) || 1
              } of ${
                searchText
                  ? filteredTokens?.length || 0
                  : Object.keys(tokens).length
              } tokens`}</div>
            ) : (
              <></>
            )}
          </div>
        ) : (
          <></>
        )}
      </div>
    </>
  );
}

export default NameTokenSelector;
