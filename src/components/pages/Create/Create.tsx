import { useState } from 'react';

import { useIsMobile } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import Dropdown from '../../inputs/Dropdown/Dropdown';
import { Tooltip } from '../../layout/Tooltip/Tooltip';

function Create() {
  const isMobile = useIsMobile();
  const [{ arnsSourceContract }] = useGlobalState();

  const [targetId, setTargetId] = useState<string>();
  const [nickname, setNickname] = useState<string>(); // optional
  const [controller, setController] = useState<string>(); // optional, owner by default
  const [ticker, setTicker] = useState<string>(); // optional
  const [ttl, setTtl] = useState<number>(100); // get from arns contract

  return (
    <>
      <div
        className="page flex flex-column center"
        style={{
          boxSizing: 'border-box',
          height: '100%',
        }}
      >
        <div
          className="flex flex-column card center"
          style={
            isMobile
              ? {
                  width: '95%',
                  height: '75%',
                  position: 'relative',
                }
              : {
                  width: '75%',
                  height: '50%',
                  maxHeight: '638px',
                  maxWidth: '1000px',
                  position: 'relative',
                }
          }
        >
          <div className="flex flex-row text-large white bold center">
            Create an ANT
          </div>
          {/* todo: implement validation input */}
          <div
            className="register-inputs center"
            style={
              isMobile
                ? {
                    width: '95%',
                  }
                : {
                    width: '60%',
                  }
            }
          >
            <input
              className="data-input center"
              placeholder={'Enter your Target ID'}
              style={{}}
            />

            <div
              style={
                isMobile
                  ? {
                      position: 'absolute',
                      right: '1em',
                      top: '90px',
                    }
                  : {
                      position: 'absolute',
                      right: '2em',
                      top: '90px',
                    }
              }
            >
              <Tooltip
                message={
                  'A target ID is an Arweave Transaction ID that your ANT will route traffic to. It is the equivalent of the DNS "A" record.'
                }
              >
                {isMobile ? (
                  <></>
                ) : (
                  <span className="text underline faded">
                    What is a Target ID?
                  </span>
                )}
              </Tooltip>
            </div>

            <div
              className={isMobile ? 'flex flex-column' : 'flex flex-row'}
              style={{
                gap: '.5em',
              }}
            >
              <input
                className="data-input center"
                placeholder="Nickname*"
                style={{}}
              />
              <input
                className="data-input center"
                placeholder="Ticker*"
                style={{}}
              />
              <input
                className="data-input center"
                placeholder="Controller*"
                style={{}}
              />
              {/* todo: implement ttl dropdown */}
              <Dropdown
                options={{
                  '100secs': 100,
                  '200secs': 200,
                  '300secs': 300,
                  '400secs': 400,
                  '500secs': 500,
                  '600secs': 600,
                  '700secs': 700,
                  '800secs': 800,
                }}
                showSelected={true}
                showChevron={true}
                selected={`${ttl} Seconds`}
                setSelected={setTtl}
              />
            </div>
          </div>
          <div
            className="flex flex-column center"
            style={{
              paddingTop: '4em',
            }}
          >
            {/* todo: implement transaction gas estimate: stubbed for now */}
            <Tooltip message="Gas fee">
              <span>0.00023 AR</span>
            </Tooltip>
            <button className="accent-button center" style={{ width: '100%' }}>
              Next
            </button>
          </div>
          {/* card div end */}
        </div>
      </div>
    </>
  );
}

export default Create;
