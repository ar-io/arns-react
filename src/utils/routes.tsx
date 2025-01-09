import RNPPage from '@src/components/pages/RNPPage/RNPPage';
import Settings from '@src/components/pages/Settings/SettingsLayout';
import { Settings2Icon } from 'lucide-react';

import { SettingsIcon } from '../components/icons';
import { Home, Manage } from '../components/pages';

const WrappedSettings2Icon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => {
  return <Settings2Icon {...props} />;
};

export type Route = {
  text: string;
  path: string;
  component: (() => JSX.Element) | undefined;
  protected: boolean;
  external?: boolean;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
  index?: boolean;
};

export const ROUTES: { [x: string]: Route } = {
  home: {
    path: '/',
    text: 'Home',
    component: Home,
    protected: false,
    index: true,
  },
  manage: {
    text: 'Manage Assets',
    icon: SettingsIcon,
    path: '/manage',
    component: Manage,
    protected: false,
    index: false,
  },
  settings: {
    text: 'Settings',
    icon: WrappedSettings2Icon,
    path: '/settings',
    component: Settings,
    protected: false,
    index: false,
  },
  returnedNames: {
    text: 'Returned Names',
    icon: WrappedSettings2Icon,
    path: '/returned-names',
    component: RNPPage,
    protected: false,
    index: false,
  },
};
