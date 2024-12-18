import { create } from '@storybook/theming';

export default create({
  base: 'dark',
  brandTitle: 'ArNS',
  brandTarget: '_self',

  //
  colorPrimary: '#ffb938',
  colorSecondary: '#222224',

  // UI
  appBg: '#1f1f1f',
  appContentBg: '#1f1f1f',
  appPreviewBg: '#1f1f1f',
  appBorderColor: '#585C6D',
  appBorderRadius: 4,

  // Text colors
  textColor: '#fafafa',
  textInverseColor: '#6c97b5',

  // Toolbar default and active colors
  barTextColor: '#9E9E9E',
  barSelectedColor: '#585C6D',
  barHoverColor: '#585C6D',
  barBg: '#1f1f1f',

  // Form colors
  inputBg: '#1f1f1f',
  inputBorder: '#18191a',
  inputTextColor: '#18191a',
  inputBorderRadius: 2,
});
