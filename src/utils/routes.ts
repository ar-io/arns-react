import { About, FAQ, Home, Manage } from '../components/pages';

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
    text: 'About',
    path: '/about',
    component: About,
    protected: false,
    index: false,
  },
  faq: {
    text: 'FAQ',
    path: '/faq',
    component: FAQ,
    protected: false,
    index: false,
  },
  manage: {
    text: 'Manage Names',
    path: '/manage',
    component: Manage,
    protected: true,
    index: false,
  },
};
