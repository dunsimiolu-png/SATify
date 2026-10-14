/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DESMOS_API_KEY?: string;
  readonly VITE_APP_PASSCODE?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
