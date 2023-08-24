import { CubeIcon, SettingsIcon } from '../components/icons';
import { Auctions, Home, Manage } from '../components/pages';

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
  about: {
    text: 'Info',
    path: 'https://ar.io/arns',
    component: undefined,
    protected: false,
    index: false,
    external: true,
  },
  auctions: {
    text: 'Live Auctions',
    path: '/auctions',
    component: Auctions,
    protected: false,
    index: false,
  },
  manage: {
    text: 'Manage Assets',
    icon: SettingsIcon,
    path: '/manage',
    component: Manage,
    protected: true,
    index: false,
  },
};
