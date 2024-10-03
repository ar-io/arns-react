import { AoANTState, AoArNSNameData } from '@ar.io/sdk';
import { Tooltip } from '@src/components/data-display';
import { useArweaveTransaction } from '@src/hooks/useArweaveTransaction';
import { useArNSState, useWalletState } from '@src/state';
import { getAntsRequiringUpdate } from '@src/utils';
import {
  DEFAULT_ANT_LUA_ID,
  MILLISECONDS_IN_GRACE_PERIOD,
} from '@src/utils/constants';
import Transaction from 'arweave/web/lib/transaction';
import { BellIcon, Circle, CircleAlert, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ReactNode } from 'react-markdown';
import { Link } from 'react-router-dom';

export type Notification = {
  type: 'success' | 'warning' | 'error';
  message: ReactNode;
  link: string;
};

export function isInGracePeriod(record: AoArNSNameData) {
  const endTimestamp = (record as any)?.endTimestamp;
  if (!endTimestamp) return false;
  const expirationDate = endTimestamp + MILLISECONDS_IN_GRACE_PERIOD;
  return endTimestamp < Date.now() && Date.now() < expirationDate;
}

export function createExpirationNotification(
  domains: Record<string, AoArNSNameData>,
): Notification | undefined {
  const domainsExpiring = Object.values(domains).reduce(
    (acc: number, record: AoArNSNameData) => {
      if (isInGracePeriod(record)) {
        acc++;
      }
      return acc;
    },
    0,
  );

  if (!domainsExpiring) return;

  return {
    type: 'warning',
    message: (
      <span className="w-full">
        <span className="text-bold">{domainsExpiring}</span> names are about to
        expire.
      </span>
    ),
    link:
      '/manage/names?' +
      new URLSearchParams({ sortBy: 'expiryDate' }).toString(),
  };
}

export function createUpdateAntsNotification({
  ants,
  userAddress,
  luaSourceTx,
}: {
  ants: Record<string, AoANTState>;
  userAddress: string;
  luaSourceTx: Transaction;
}): Notification | undefined {
  const antsRequiringUpdate = getAntsRequiringUpdate({
    ants,
    userAddress,
    luaSourceTx,
  }).length;

  if (!antsRequiringUpdate) return;

  return {
    type: 'warning',
    message: (
      <span className="w-full">
        <span className="text-bold">{antsRequiringUpdate}</span>{' '}
        {antsRequiringUpdate > 1 ? 'ANTs need updating' : ' ANT needs updating'}
      </span>
    ),
    link:
      '/manage/names?' +
      new URLSearchParams({ sortBy: 'sourceCode' }).toString(),
  };
}

export function createNamesExceedingUndernameLimitNotification({
  domains,
  ants,
}: {
  domains: Record<string, AoArNSNameData>;
  ants: Record<string, AoANTState>;
}): Notification | undefined {
  const domainsRequiringUndernameSupportUpgrade = Object.values(domains).reduce(
    (acc: number, record: AoArNSNameData) => {
      const undernameCount = Object.keys(
        ants?.[record.processId]?.Records,
      ).filter((key) => key !== '@')?.length;
      if (undernameCount > record.undernameLimit) ++acc;
      return acc;
    },
    0,
  );

  if (!domainsRequiringUndernameSupportUpgrade) return;

  return {
    type: 'warning',
    message: (
      <span className="w-full">
        <span className="text-bold">
          {domainsRequiringUndernameSupportUpgrade}
        </span>{' '}
        names have exceeded their under_name capacity.
      </span>
    ),
    link:
      '/manage/names?' +
      new URLSearchParams({ sortBy: 'undernames' }).toString(),
  };
}

function NotificationMenu() {
  const [{ walletAddress }] = useWalletState();
  const [{ domains, ants }] = useArNSState();
  const { data: luaSourceTx } = useArweaveTransaction(DEFAULT_ANT_LUA_ID);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (domains && ants && walletAddress && luaSourceTx) {
      setNotifications(
        [
          createExpirationNotification(domains),
          createNamesExceedingUndernameLimitNotification({ domains, ants }),
          createUpdateAntsNotification({
            ants,
            userAddress: walletAddress.toString(),
            luaSourceTx,
          }),
        ].filter(
          (notification) => notification !== undefined,
        ) as Notification[],
      );
    }
  }, [domains, ants, walletAddress, luaSourceTx]);

  return (
    <Tooltip
      tooltipOverrides={{
        className: 'w-fit',
        color: 'var(--card-bg)',
        overlayStyle: {
          width: 'fit-content',
          minWidth: '300px',
        },
      }}
      message={
        <div className="flex flex-col w-full gap-3 text-white items-center justify-center">
          {notifications.length ? (
            notifications.map((notification, index) => (
              <div
                className="flex flex-row"
                style={{ gap: '20px' }}
                key={index}
              >
                <span
                  className="flex flex-row justify-center items-start"
                  style={{ gap: '20px' }}
                >
                  <span>
                    {notification.type == 'success' ? (
                      <Circle
                        className="text-success fill-success"
                        width={'16px'}
                        height={'16px'}
                      />
                    ) : notification.type == 'warning' ? (
                      <CircleAlert
                        className="text-primary"
                        width={'16px'}
                        height={'16px'}
                      />
                    ) : (
                      <CircleAlert
                        className="text-error"
                        width={'16px'}
                        height={'16px'}
                      />
                    )}
                  </span>
                  {notification.message}
                </span>
                <Link
                  to={notification.link}
                  className="p-2 rounded bg-dark-grey text-bg-dark-grey"
                >
                  <Settings width={'18px'} height={'18px'} />
                </Link>
              </div>
            ))
          ) : (
            <span className="text-lg text-grey p-2">No Notifications</span>
          )}
        </div>
      }
      icon={
        <BellIcon
          width={'20px'}
          height={'20px'}
          className={
            notifications.length
              ? `text-primary fill-primary animate-pulse`
              : `text-white fill-white`
          }
        />
      }
    />
  );
}

export default NotificationMenu;
