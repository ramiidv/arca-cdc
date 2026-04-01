// Main class
export { ArcaCdc } from './arca-cdc.js';

// Low-level client
export { CdcClient } from './cdc-client.js';

// Error classes (from common)
export {
  ArcaError,
  ArcaAuthError,
  ArcaSoapError,
  ArcaServiceError,
} from '@ramiidv/arca-common';

// WSAA client (from common)
export { WsaaClient } from '@ramiidv/arca-common';
export type { WsaaClientConfig } from '@ramiidv/arca-common';

// Types
export type {
  ArcaCdcConfig,
  CdcAuth,
  ConstatarInput,
  ConstatarResult,
  ConstatarObservacion,
  ConstatarError,
  ModalidadItem,
  TipoCbteItem,
  DocTipoItem,
  AccessTicket,
  ArcaEvent,
  ServerStatus,
  SoapCallOptions,
} from './types.js';

// Constants
export {
  WSCDC_ENDPOINTS,
  WSCDC_NAMESPACE,
  WSCDC_SERVICE_ID,
} from './constants.js';

// Validation
export { validateConstatarInput } from './validation.js';

// Utilities (from common)
export {
  ensureArray,
  parseXml,
  buildXml,
  checkServiceErrors,
} from '@ramiidv/arca-common';
