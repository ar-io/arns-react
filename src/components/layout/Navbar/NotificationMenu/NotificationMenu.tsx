import { AoANTState, AoArNSNameData } from '@ar.io/sdk';
import { Tooltip } from '@src/components/data-display';
import { useLatestANTVersion } from '@src/hooks/useANTVersions';
import {
  InterruptedWorkflowType,
  useInterruptedWorkflows,
} from '@src/hooks/useInterruptedWorkflows';
import { ANTProcessData, useArNSState, useWalletState } from '@src/state';
import { getAntsRequiringUpdate } from '@src/utils';
import { MILLISECONDS_IN_GRACE_PERIOD } from '@src/utils/constants';
import {
  AlertTriangle,
  BellIcon,
  Circle,
  CircleAlert,
  Settings,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ReactNode } from 'react-markdown';
import { Link } from 'react-router-dom';

import ContinueWorkflowModal from '@src/components/modals/ContinueWorkflowModal/ContinueWorkflowModal';

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

export function createUpdateDomainsNotification({
  domains,
  ants,
  userAddress,
  currentModuleId,
}: {
  domains: Record<string, AoArNSNameData>;
  ants: Record<string, ANTProcessData>;
  userAddress: string;
  currentModuleId: string | null;
}): Notification | undefined {
  const antsRequiringUpdate = getAntsRequiringUpdate({
    ants,
    userAddress,
    currentModuleId,
  });
  const domainsRequiringUpdate = Object.entries(domains).reduce(
    (acc: string[], [domain, record]) => {
      if (antsRequiringUpdate.includes(record.processId)) {
        acc.push(domain);
      }
      return acc;
    },
    [],
  ).length;

  if (!domainsRequiringUpdate) return;

  return {
    type: 'warning',
    message: (
      <span className="w-full">
        <span className="text-bold">{domainsRequiringUpdate}</span>{' '}
        {domainsRequiringUpdate > 1
          ? 'Domains need updating'
          : ' Domain needs updating'}
      </span>
    ),
    link:
      '/manage/names?' +
      new URLSearchParams({ sortBy: 'ioCompatible' }).toString(),
  };
}

export function createNamesExceedingUndernameLimitNotification({
  domains,
  ants,
}: {
  domains: Record<string, AoArNSNameData>;
  ants: Record<string, { state: AoANTState | null; version: number }>;
}): Notification | undefined {
  const domainsRequiringUndernameSupportUpgrade = Object.values(domains).reduce(
    (acc: number, record: AoArNSNameData) => {
      const undernameCount = Object.keys(
        ants?.[record.processId]?.state?.Records ?? {},
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
  const { data: antVersion } = useLatestANTVersion();
  const antModuleId = antVersion?.moduleId ?? null;
  const { interruptedWorkflows } = useInterruptedWorkflows(ants, domains);

  // State for continue workflow modal
  const [showContinueWorkflowModal, setShowContinueWorkflowModal] =
    useState(false);
  const [workflowToContinue, setWorkflowToContinue] = useState<{
    domainName: string;
    antId: string;
    intentId: string;
    workflowType: InterruptedWorkflowType;
  } | null>(null);

  // Memoize individual notification data to prevent JSX recreation
  const interruptedWorkflowsCount = useMemo(
    () => interruptedWorkflows.length,
    [interruptedWorkflows],
  );

  const domainsExpiringCount = useMemo(() => {
    if (!domains) return 0;
    return Object.values(domains).reduce(
      (acc: number, record: AoArNSNameData) => {
        if (isInGracePeriod(record)) {
          acc++;
        }
        return acc;
      },
      0,
    );
  }, [domains]);

  const namesExceedingLimit = useMemo(() => {
    if (!domains || !ants) return 0;
    return Object.values(domains).reduce(
      (acc: number, record: AoArNSNameData) => {
        const ant = ants[record.processId];
        if (
          ant?.state?.Records &&
          Object.keys(ant.state.Records).length > 10000
        ) {
          acc++;
        }
        return acc;
      },
      0,
    );
  }, [domains, ants]);

  const antsRequiringUpdate = useMemo(() => {
    if (!ants || !walletAddress || !antModuleId) return 0;
    return getAntsRequiringUpdate({
      ants,
      userAddress: walletAddress.toString(),
      currentModuleId: antModuleId,
    }).length;
  }, [ants, walletAddress, antModuleId]);

  const notifications = useMemo(() => {
    if (!domains || !ants || !walletAddress) {
      return [];
    }

    const notificationList: Notification[] = [];

    // Interrupted workflows notification
    if (interruptedWorkflowsCount > 0) {
      const firstDomain = interruptedWorkflows[0]?.domainName;
      notificationList.push({
        type: 'error',
        message: (
          <span className="text-sm">
            {interruptedWorkflowsCount === 1
              ? `Interrupted marketplace workflow for ${firstDomain}`
              : `${interruptedWorkflowsCount} interrupted marketplace workflows`}
          </span>
        ),
        link: '/manage/names',
      });
    }

    // Expiration notification
    if (domainsExpiringCount > 0) {
      notificationList.push({
        type: 'warning',
        message: (
          <span className="w-full">
            <span className="text-bold">{domainsExpiringCount}</span> names are
            about to expire.
          </span>
        ),
        link:
          '/manage/names?' +
          new URLSearchParams({ sortBy: 'expiryDate' }).toString(),
      });
    }

    // Names exceeding limit notification
    if (namesExceedingLimit > 0) {
      notificationList.push({
        type: 'warning',
        message: (
          <span className="w-full">
            <span className="text-bold">{namesExceedingLimit}</span> names
            exceed the undername limit.
          </span>
        ),
        link: '/manage/names',
      });
    }

    // Update domains notification
    if (antsRequiringUpdate > 0) {
      notificationList.push({
        type: 'warning',
        message: (
          <span className="w-full">
            <span className="text-bold">{antsRequiringUpdate}</span> names need
            to be updated.
          </span>
        ),
        link: '/manage/names',
      });
    }

    return notificationList;
  }, [
    domains,
    ants,
    walletAddress,
    interruptedWorkflowsCount,
    domainsExpiringCount,
    namesExceedingLimit,
    antsRequiringUpdate,
    interruptedWorkflows,
  ]);

  return (
    <>
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
                <div className="flex flex-row size-fit" key={index}>
                  <span
                    className="flex flex-row justify-center items-start"
                    style={{ gap: '20px' }}
                  >
                    <span>
                      {notification.type === 'success' ? (
                        <Circle
                          className="text-success fill-success"
                          width={'16px'}
                          height={'16px'}
                        />
                      ) : notification.type === 'warning' ? (
                        <CircleAlert
                          className="text-primary"
                          width={'16px'}
                          height={'16px'}
                        />
                      ) : notification.type === 'error' &&
                        notification.message
                          ?.toString()
                          .includes('Interrupted') ? (
                        <AlertTriangle
                          className="text-error animate-pulse"
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
                  {notification.message?.toString().includes('Interrupted') ? (
                    <button
                      onClick={() => {
                        // Get the first interrupted workflow that can be continued (not UNKNOWN)
                        const firstWorkflow = interruptedWorkflows.find(
                          (w) =>
                            w.workflowType !== InterruptedWorkflowType.UNKNOWN,
                        );
                        if (firstWorkflow) {
                          setWorkflowToContinue({
                            domainName: firstWorkflow.domainName,
                            antId: firstWorkflow.antId,
                            intentId: firstWorkflow.intent.intentId,
                            workflowType: firstWorkflow.workflowType,
                          });
                          setShowContinueWorkflowModal(true);
                        }
                      }}
                      className="p-2 rounded bg-warning text-black hover:bg-warning-light transition-colors"
                    >
                      <AlertTriangle className="size-4" />
                    </button>
                  ) : (
                    <Link
                      to={notification.link}
                      className="p-2 rounded bg-dark-grey text-bg-dark-grey"
                    >
                      <Settings className="size-4" />
                    </Link>
                  )}
                </div>
              ))
            ) : (
              <span className="text-sm text-grey p-2">No Notifications</span>
            )}
          </div>
        }
        icon={
          <BellIcon
            className={`${
              notifications.length
                ? 'text-primary fill-primary animate-pulse'
                : 'text-white fill-white'
            } size-4 m-2 cursor-pointer`}
          />
        }
      />
      {workflowToContinue && (
        <ContinueWorkflowModal
          show={showContinueWorkflowModal}
          onClose={() => {
            setShowContinueWorkflowModal(false);
            setWorkflowToContinue(null);
          }}
          domainName={workflowToContinue.domainName}
          antId={workflowToContinue.antId}
          intentId={workflowToContinue.intentId}
          workflowType={workflowToContinue.workflowType}
        />
      )}
    </>
  );
}

export default NotificationMenu;
