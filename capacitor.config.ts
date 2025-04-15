
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.pocketsms',
  appName: 'pocket-sms-tracker',
  webDir: 'dist',
  server: {
    url: 'https://395c4b86-f7e6-4d16-b943-2e87899bac7b.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#9b87f5",
    },
  },
};

export default config;
