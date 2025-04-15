
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.pocketsms',
  appName: 'Pocket SMS Tracker',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    url: 'https://395c4b86-f7e6-4d16-b943-2e87899bac7b.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#9b87f5",
    },
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
