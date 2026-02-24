/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL backend API, e.g. https://api.bemfstunisa.ac.id/api/v1 */
  readonly VITE_API_BASE_URL: string;
  /** Base URL storage backend, e.g. https://api.bemfstunisa.ac.id */
  readonly VITE_STORAGE_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
