import { CubeIcon } from '../components/icons';
import { Home, Manage } from '../components/pages';

export type Route = {
  text: string;
  path: string;
  component: (() => JSX.Element) | undefined;
  protected: boolean;
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
  },
  manage: {
    text: 'Manage Assets',
    icon: CubeIcon,
    path: '/manage',
    component: Manage,
    protected: true,
    index: false,
  },
};
