import * as Sentry from '@sentry/react';
import { notification } from 'antd';
import { useEffect } from 'react';

import eventEmitter from '../../../utils/events';
import { CircleXIcon, CloseIcon } from '../../icons';
import './styles.css';

type NotificationType = 'success' | 'info' | 'warning' | 'error';

export default function Notifications() {
  const [api, contextHolder] = notification.useNotification({
    maxCount: 3,
  });

  function handleError(error: Error) {
    // TODO: check for duplicate errors
    console.log(error);
    const sentryID = Sentry.captureException(error);
    console.debug('Error sent to sentry:', error, sentryID);
    showNotification({
      type: 'error',
      title: error.name,
      description: error.message,
    });
  }

  function getApiConfig({
    type,
    title,
    description,
    key,
  }: {
    type: NotificationType;
    title: string;
    description: string;
    key: string;
  }): any {
    switch (type) {
      case 'success':
        return { content: 'stub.' };
      case 'info':
        return {
          content: 'stub.',
        };
      case 'warning':
        return { content: 'stub.' };
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
                onClick={() => api.destroy(key)}
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
              onClick={() => api.destroy(key)}
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
    const config = getApiConfig({
      type,
      title,
      description,
      key,
    });
    api[type](config);
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
