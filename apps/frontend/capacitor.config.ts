import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jeb.chomagego',
  appName: 'chomage-go',
  webDir: 'out', // requis par Capacitor même si non utilisé en mode server.url
  server: {
    url: 'http://10.168.145.219:3000', // remplace par ta vraie IP LAN + PORT_FRONTEND
    cleartext: true, // autorise le HTTP non chiffré (nécessaire en LAN sans TLS)
  },
};

export default config;
