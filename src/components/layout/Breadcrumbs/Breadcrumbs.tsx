import { Breadcrumb, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { useLocation, useMatches } from 'react-router';
import { Link } from 'react-router-dom';

import { useGlobalState } from '../../../state/contexts/GlobalState';
import { ArweaveTransactionID } from '../../../types';
import { formatForMaxCharCount, isArweaveTransactionID } from '../../../utils';
import { RESERVED_BREADCRUMB_TITLES } from '../../../utils/constants';
import eventEmitter from '../../../utils/events';
import { ChevronDownIcon } from '../../icons';

export type NavItem = {
  name: string;
  route: string;
};

export const ANT_FLAG = 'ant-flag';

function Breadcrumbs() {
  const [{ arweaveDataProvider }] = useGlobalState();
  const { Item } = Breadcrumb;
  const location = useLocation();
  const path = location.pathname.split('/');
  const matches = useMatches();
  const [crumbs, setCrumbs] = useState<NavItem[]>([]);

  useEffect(() => {
    if (!matches) {
      return;
    }
    handleCrumbs();
  }, [matches, location]);

  async function handleCrumbs() {
    try {
      let contractId = '';

      const rawCrumbs = matches
        .filter(
          (match: any) =>
            match?.handle?.crumbs && match.pathname === location.pathname,
        )
        .map((match: any) => {
          if (match.params?.id) {
            contractId = match.params?.id;
          }
          return match?.handle?.crumbs(Object.values(match.params)[0]);
        });
      // check for ant flag
      if (isArweaveTransactionID(contractId)) {
        const state = await arweaveDataProvider.getContractState(
          new ArweaveTransactionID(contractId),
        );

        const parsedCrumbs = rawCrumbs[0].map((crumb: NavItem) => {
          if (crumb.name == ANT_FLAG) {
            return { name: state.name, route: crumb.route };
          }
          return crumb;
        });
        setCrumbs(parsedCrumbs);
      } else {
        setCrumbs(rawCrumbs[0]);
      }
    } catch (error) {
      eventEmitter.emit('error', error);
    }
  }

  // TODO: move this to a css class
  function handleCrumbTitle(title: string) {
    if (RESERVED_BREADCRUMB_TITLES.has(title)) {
      return title;
    }
    return formatForMaxCharCount(title, 16);
  }

  return (
    <>
      {crumbs?.length ? (
        <Breadcrumb
          className="flex flex-row center"
          style={{
            background: 'black',
            height: '50px',
            justifyContent: 'flex-start',
            paddingLeft: '100px',
            fontSize: '16px',
            color: 'var(--text-faded)',
          }}
          separator={
            <span
              style={{
                height: '100%',
                width: '30px',
                alignContent: 'center',
              }}
            >
              <ChevronDownIcon
                width={'10px'}
                height={'10px'}
                fill={'var(--text-grey)'}
                style={{ transform: 'rotate(-90deg)' }}
              />
            </span>
          }
        >
          {crumbs.map((item, index) => {
            const crumbTitle = handleCrumbTitle(item.name);

            const crumbItem = (
              <Item key={index} className="center faded">
                <Link
                  className="link faded hover"
                  style={{
                    fontSize: '16px',
                    color:
                      path.at(-1) === item?.route?.split('/').at(-1)
                        ? 'white'
                        : 'var(--text-grey)',
                  }}
                  to={item?.route ?? '/'}
                >
                  {crumbTitle}
                </Link>
              </Item>
            );

            return crumbTitle === item.name ? (
              crumbItem
            ) : (
              <Tooltip
                title={<span className=" flex center">{item.name}</span>}
                placement={'top'}
                autoAdjustOverflow={true}
                color="var(--text-faded)"
              >
                {crumbItem}
              </Tooltip>
            );
          })}
        </Breadcrumb>
      ) : (
        <></>
      )}
    </>
  );
}

export default Breadcrumbs;