import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.brickfi.app.staging',
  appName: 'Brickfi',
  webDir: 'out',
  server: {
    url: 'https://app-staging.brickfi.in',
    cleartext: false,
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
  },
};

export default config;
