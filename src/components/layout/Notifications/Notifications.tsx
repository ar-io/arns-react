import * as Sentry from '@sentry/react';
import { notification } from 'antd';
import { ArgsProps } from 'antd/es/notification/interface';
import { useEffect } from 'react';

import eventEmitter from '../../../utils/events';
import { CircleXIcon, CloseIcon } from '../../icons';
import './styles.css';

type NotificationType = 'success' | 'info' | 'warning' | 'error';

export default function Notifications() {
  const [notificationApi, contextHolder] = notification.useNotification({
    maxCount: 3,
  });

  function handleError(error: Error) {
    // TODO: check for duplicate errors
    const sentryID = Sentry.captureException(error);
    console.error('Error sent to sentry:', error, sentryID);
    showNotification({
      type: 'error',
      title: error.name,
      description: error.message,
    });
  }

  function getNotificationProps({
    type,
    title,
    description,
    key,
  }: {
    type: NotificationType;
    title: string;
    description: string;
    key: string;
  }): ArgsProps {
    switch (type) {
      case 'error':
        return {
          key: key,
          message: (
            <h4
              className="flex flex-row white"
              style={{ marginTop: '0px', justifyContent: 'space-between' }}
            >
              {title}
              <button
                className="button center pointer"
                onClick={() => notificationApi.destroy(key)}
                style={{ padding: '0px' }}
              >
                <CloseIcon
                  width={'25px'}
                  height={'25px'}
                  fill={'var(--text-white)'}
                />
              </button>
            </h4>
          ),
          description: <div className="grey">{description}</div>,
          btn: (
            <button
              className="button-primary"
              style={{ padding: '9px 12px' }}
              onClick={() => notificationApi.destroy(key)}
            >
              Close
            </button>
          ),
          closeIcon: false,
          icon: (
            <CircleXIcon
              width={'25px'}
              height={'25px'}
              fill={'var(--error-red)'}
            />
          ),
          placement: 'bottomRight',
          duration: 30,
          style: {
            fontFamily: 'Rubik',
            background: 'var(--card-bg)',
            color: 'var(--text-white)',
            boxShadow: 'var(--shadow)',
          },
        };
      default:
        return {
          message: '',
        };
    }
  }

  function showNotification({
    type,
    title,
    description,
  }: {
    type: NotificationType;
    title: string;
    description: string;
  }) {
    const key = `open${Date.now()}`;
    const notificationProps = getNotificationProps({
      type,
      title,
      description,
      key,
    });
    notificationApi[type](notificationProps);
  }

  // error notifications
  useEffect(() => {
    eventEmitter.on('error', handleError);

    return () => {
      eventEmitter.off('error', handleError);
    };
  });

  return contextHolder;
}
