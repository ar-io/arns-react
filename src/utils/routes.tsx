import RNPPage from '@src/components/pages/RNPPage/RNPPage';
import { Bolt, Gavel } from 'lucide-react';

import { Home, Manage } from '../components/pages';

// We have to wrap the icons like this due to lucide break on mobile when stored as a const like this
const WrappedGavelIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return <Gavel {...props} />;
};

const WrappedBoltIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return <Bolt {...props} />;
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
  returnedNames: {
    text: 'Returned Names',
    icon: WrappedGavelIcon,
    path: '/returned-names',
    component: RNPPage,
    protected: false,
    index: false,
  },
  manage: {
    text: 'Manage Assets',
    icon: WrappedBoltIcon,
    path: '/manage',
    component: Manage,
    protected: false,
    index: false,
  },
};
