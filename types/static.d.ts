/* IMAGES */
declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

/* VITE DEFINED ENV VARS */
declare const VITE_CONFIG: {
  version: string;
};
