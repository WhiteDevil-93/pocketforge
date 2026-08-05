import type { CapacitorConfig } from '@capacitor/cli';

// The Android shell serves the Vite build from the root of its local server, so
// production web assets must be built with VITE_BUILD_TARGET=android (see vite.config.ts)
// before running `npx cap sync`. `npm run build:android` does both.
const config: CapacitorConfig = {
  appId: 'com.whitedevil93.pocketforge',
  appName: 'PocketForge',
  webDir: 'dist',
  android: {
    backgroundColor: '#0B1120',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#0B1120',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
  },
};

export default config;
