import {
  ArgsProps,
  NotificationInstance,
} from 'antd/es/notification/interface';

import { CircleXIcon, CloseIcon } from '../../icons';

export const arconnectUnresponsive = ({
  api,
  title,
  description,
  key,
}: {
  api: NotificationInstance;
  title: string;
  description: string;
  key: string;
}): ArgsProps => ({
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
        <CloseIcon width={'25px'} height={'25px'} fill={'var(--text-white)'} />
      </button>
    </h4>
  ),
  description: <div className="grey">{description}</div>,
  btn: (
    <button
      className="button-primary"
      style={{ padding: '9px 12px' }}
      onClick={() => location.reload()}
    >
      Reload
    </button>
  ),
  closeIcon: false,
  icon: (
    <CircleXIcon width={'25px'} height={'25px'} fill={'var(--error-red)'} />
  ),
  placement: 'bottomRight',
  duration: 30,
  style: {
    fontFamily: 'Rubik',
    background: 'var(--card-bg)',
    color: 'var(--text-white)',
    boxShadow: 'var(--shadow)',
  },
});
