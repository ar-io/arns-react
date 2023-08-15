import { startCase } from 'lodash';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useAuctionInfo } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { ArweaveTransactionID } from '../../../types';
import {
  decodeDomainToASCII,
  encodeDomainToASCII,
  isPDNSDomainNameValid,
  sleep,
} from '../../../utils';
import eventEmitter from '../../../utils/events';
import { ArrowLeft, ArrowRightIcon } from '../../icons';
import ArweaveID, { ArweaveIdTypes } from '../ArweaveID/ArweaveID';
import AuctionChart from '../AuctionChart/AuctionChart';
import Loader from '../Loader/Loader';

function ViewAuction() {
  const [{ blockHeight }] = useGlobalState();
  const { name } = useParams();
  const navigate = useNavigate();
  const { minimumAuctionBid, auction, auctionSettings } = useAuctionInfo(
    encodeDomainToASCII(name!),
  );

  useEffect(() => {
    if (!name || (name && !isPDNSDomainNameValid({ name }))) {
      eventEmitter.emit('error', new Error('No name detected'));
      navigate('/auctions');
    }
    if (auction && auctionSettings && blockHeight) {
      const isExpired =
        auction.startHeight + auctionSettings.auctionDuration < blockHeight;

      if (isExpired) {
        eventEmitter.emit(
          'error',
          new Error('This auction has expired, rerouting...'),
        );
        sleep(2000).then(() => {
          navigate('/auctions');
        });
      }
    }
  }, [blockHeight, auction, auctionSettings, name]);

  if (!name || !minimumAuctionBid || !auction) {
    return (
      <div className="page center">
        <Loader size={80} message={`Fetching latest auction info...`} />
      </div>
    );
  }

  return (
    <div className="page" style={{ paddingTop: '100px' }}>
      <div
        className="flex flex-column"
        style={{
          gap: '50px',
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
            {decodeDomainToASCII(name)}
          </span>
          <button
            className="accent-button center"
            onClick={() => alert('Setup register page to enable this button')}
          >
            {startCase(auction.type)} Now&nbsp;
            <ArrowRightIcon width={'16px'} height={'16px'} />
          </button>
        </div>

        <div className="flex flex-column" style={{ gap: '15px' }}>
          <div className="flex flex-column" style={{ gap: '15px' }}>
            <span className="flex white">
              Current auction price for instant {auction.type}:{' '}
              {Math.round(minimumAuctionBid).toLocaleString()} IO
            </span>
            <span className="flex grey" style={{ color: 'var(--text-grey)' }}>
              Started by:&nbsp;
              <ArweaveID
                id={new ArweaveTransactionID(auction.initiator)}
                type={ArweaveIdTypes.ADDRESS}
                shouldLink={true}
              />
            </span>
            <span className="flex grey">
              Auction Type: {startCase(auction.type)}
            </span>
          </div>

          <AuctionChart
            domain={encodeDomainToASCII(name)}
            showAuctionExplainer={true}
          />
        </div>
      </div>
    </div>
  );
}

export default ViewAuction;
