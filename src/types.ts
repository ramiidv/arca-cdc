// Shared types from common
export type { AccessTicket, ArcaEvent, ServerStatus, SoapCallOptions } from '@ramiidv/arca-common';
import type { ArcaEvent } from '@ramiidv/arca-common';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export interface ArcaCdcConfig {
  /** PEM-encoded X.509 certificate */
  cert: string;
  /** PEM-encoded RSA private key */
  key: string;
  /** CUIT of the entity represented (e.g. 20123456789) */
  cuit: number;
  /** Use production endpoints (default: false = testing / homologacion) */
  production?: boolean;
  /** Request timeout in ms (default: 30000) */
  timeout?: number;
  /** Number of retries on 5xx / network errors (default: 1) */
  retries?: number;
  /** Base delay in ms for exponential backoff (default: 1000) */
  retryDelayMs?: number;
  /** Optional event callback */
  onEvent?: (event: ArcaEvent) => void;
}

// ---------------------------------------------------------------------------
// Authentication (internal SOAP Auth block)
// ---------------------------------------------------------------------------

export interface CdcAuth {
  Token: string;
  Sign: string;
  Cuit: number;
}

// ---------------------------------------------------------------------------
// ComprobanteConstatar - Input
// ---------------------------------------------------------------------------

export interface ConstatarInput {
  /** Tipo de comprobante (ver ComprobantesTipoConsultar) */
  CbteTipo: number;
  /** Punto de venta */
  PtoVta: number;
  /** Numero de comprobante */
  CbteNro: number;
  /** Fecha del comprobante (formato YYYYMMDD) */
  CbteFch: string;
  /** Importe total del comprobante */
  ImpTotal: number;
  /** Codigo de autorizacion (CAE, CAI, o CAEA) */
  CodAutorizacion: string;
  /** Tipo de documento del receptor (ver DocumentosTipoConsultar) */
  DocTipoReceptor: number;
  /** Numero de documento del receptor */
  DocNroReceptor: number;
}

// ---------------------------------------------------------------------------
// ComprobanteConstatar - Result
// ---------------------------------------------------------------------------

export interface ConstatarObservacion {
  Code: number;
  Msg: string;
}

export interface ConstatarError {
  Code: number;
  Msg: string;
}

export interface ConstatarResult {
  /** "A" = Aprobado, "R" = Rechazado */
  Resultado: 'A' | 'R';
  /** Observaciones del servicio (presentes cuando Resultado = "R") */
  Observaciones?: ConstatarObservacion[];
  /** Errores del servicio */
  Errors?: ConstatarError[];
}

// ---------------------------------------------------------------------------
// ComprobantesModalidadConsultar
// ---------------------------------------------------------------------------

export interface ModalidadItem {
  Id: number;
  Desc: string;
  FchDesde?: string;
  FchHasta?: string;
}

// ---------------------------------------------------------------------------
// ComprobantesTipoConsultar
// ---------------------------------------------------------------------------

export interface TipoCbteItem {
  Id: number;
  Desc: string;
  FchDesde?: string;
  FchHasta?: string;
}

// ---------------------------------------------------------------------------
// DocumentosTipoConsultar
// ---------------------------------------------------------------------------

export interface DocTipoItem {
  Id: number;
  Desc: string;
  FchDesde?: string;
  FchHasta?: string;
}
