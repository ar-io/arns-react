import { About, Create, Home, Manage } from '../components/pages';

export type Route = {
  text: string;
  path: string;
  component: JSX.Element;
  protected: boolean;
  index?: boolean;
};

export const ROUTES = {
  home: {
    path: '/',
    text: 'Home',
    component: Home,
    protected: false,
    index: true,
  },
  about: {
    text: 'Info',
    path: '/info',
    component: About,
    protected: false,
    index: false,
  },
  create: {
    text: 'Create an ANT',
    path: '/create',
    component: Create,
    protected: false,
    index: false,
  },
  manage: {
    text: 'Manage',
    path: '/manage',
    component: Manage,
    protected: true,
    index: false,
  },
};
