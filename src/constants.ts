// ---------------------------------------------------------------------------
// WSCDC Endpoints
// ---------------------------------------------------------------------------

export const WSCDC_ENDPOINTS = {
  testing: 'https://wswhomo.afip.gov.ar/WSCDC/service.asmx',
  production: 'https://servicios1.arca.gob.ar/WSCDC/service.asmx',
} as const;

// ---------------------------------------------------------------------------
// SOAP Namespace
// ---------------------------------------------------------------------------

/**
 * Namespace del WSCDC (mismo que WSFE, es un servicio .NET/ASMX).
 */
export const WSCDC_NAMESPACE = 'http://ar.gov.afip.dif.fev1/';

// ---------------------------------------------------------------------------
// WSAA Service ID
// ---------------------------------------------------------------------------

/**
 * Nombre del servicio para autenticación via WSAA.
 */
export const WSCDC_SERVICE_ID = 'wscdc';
