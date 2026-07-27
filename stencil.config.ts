import { Config } from '@stencil/core';
import nodePolyfills from 'rollup-plugin-node-polyfills';

export const config: Config = {
  namespace: 'gcds-ext-code-display',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
      copy: [
        {
          src: '../node_modules/@gcds-core/components/dist/gcds',
          dest: 'components/dist',
        },
        { src: '**/*.e2e.html' },
      ],
    },
  ],
  extras: {
    enableImportInjection: true,
    experimentalSlotFixes: true,
  },
  testing: {
    transform: {
      '^.+\\.(ts|tsx|js|jsx|css)$': '@stencil/core/testing/jest-preprocessor',
    },
    browserHeadless: 'shell',
  },
  rollupPlugins: {
    after: [nodePolyfills()],
  },
};
