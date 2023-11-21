import { startCase } from 'lodash';
import { useEffect } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';

import { useAuctionInfo, useIsMobile } from '../../../hooks';
import { ArweaveTransactionID } from '../../../services/arweave/ArweaveTransactionID';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import {
  decodeDomainToASCII,
  encodeDomainToASCII,
  isARNSDomainNameValid,
  lowerCaseDomain,
  sleep,
} from '../../../utils';
import eventEmitter from '../../../utils/events';
import { ArrowLeft, ArrowRightIcon } from '../../icons';
import ArweaveID, { ArweaveIdTypes } from '../ArweaveID/ArweaveID';
import AuctionChart from '../AuctionChart/AuctionChart';
import BlockHeightCounter from '../BlockHeightCounter/BlockHeightCounter';
import PageLoader from '../progress/PageLoader/PageLoader';

function ViewAuction() {
  const [{ blockHeight, lastBlockUpdateTimestamp, ioTicker }] =
    useGlobalState();
  const { name } = useParams();
  const navigate = useNavigate();
  const { auction, loadingAuctionInfo } = useAuctionInfo(
    lowerCaseDomain(name ?? ''),
  );
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!name || (name && !isARNSDomainNameValid({ name }))) {
      eventEmitter.emit('error', new Error('No name detected'));
      navigate('/auctions');
    }
    if (auction) {
      if (!auction.isActive) {
        eventEmitter.emit(
          'error',
          new Error('This auction has expired, rerouting...'),
        );
        handleExpired();
      }
    }
  }, [blockHeight, lastBlockUpdateTimestamp, auction, name]);

  async function handleExpired() {
    await sleep(2000); // TODO: why do we wait here?
    navigate('/auctions');
  }

  if (loadingAuctionInfo || !auction) {
    return (
      <div className="page center">
        <PageLoader
          loading={loadingAuctionInfo}
          message={`Fetching latest auction info...`}
        />
      </div>
    );
  }

  if (!loadingAuctionInfo && auction?.isActive === false) {
    eventEmitter.emit(
      'error',
      new Error('This auction does not exist, rerouting...'),
    );

    return <Navigate to="/auctions" />;
  }

  return (
    <div className="page" style={{ paddingTop: '30px' }}>
      <div
        className="flex flex-column"
        style={{
          gap: '30px',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          maxWidth: '900px',
        }}
      >
        <Link to="/auctions" className=" flex button white center pointer">
          <ArrowLeft width={'16px'} height={'16px'} fill={'white'} />
          &nbsp;Back
        </Link>

        <div
          className="flex flex-row center"
          style={{
            justifyContent: 'space-between',
            borderBottom: 'solid 1px var(--text-faded)',
            padding: '0px 0px 30px 0px',
          }}
        >
          <span className="white bold" style={{ fontSize: '36px' }}>
            {decodeDomainToASCII(name!)}
          </span>
          <button
            className="accent-button center"
            onClick={() => navigate(`/register/${name}`)}
          >
            {startCase(auction!.type)} Now&nbsp;
            <ArrowRightIcon width={'16px'} height={'16px'} />
          </button>
        </div>

        <div className="flex flex-column" style={{ gap: '15px' }}>
          <div className="flex flex-column" style={{ gap: '15px' }}>
            <span className="flex white">
              Current auction price for instant {auction!.type}:&nbsp;
              <span
                className="bold"
                style={{
                  color: 'var(--accent)',
                }}
              >
                {auction!.currentPrice.toLocaleString() ?? 0} {ioTicker}
              </span>
            </span>
            <span className="flex grey" style={{ color: 'var(--text-grey)' }}>
              Started by:&nbsp;
              <ArweaveID
                id={new ArweaveTransactionID(auction!.initiator)}
                type={ArweaveIdTypes.ADDRESS}
                shouldLink={true}
                characterCount={isMobile ? 10 : undefined}
              />
            </span>
          </div>
          <BlockHeightCounter />

          <AuctionChart
            domain={encodeDomainToASCII(name!)}
            showAuctionExplainer={true}
          />
        </div>
      </div>
    </div>
  );
}

export default ViewAuction;
