import { afipSoapCall, ensureArray, checkServiceErrors } from '@ramiidv/arca-common';
import type { ArcaEvent, SoapCallOptions, ServerStatus } from '@ramiidv/arca-common';
import type {
  CdcAuth,
  ConstatarInput,
  ConstatarResult,
  ConstatarObservacion,
  ConstatarError,
  ModalidadItem,
  TipoCbteItem,
  DocTipoItem,
} from './types.js';

// ---------------------------------------------------------------------------
// Internal SOAP result shapes
// ---------------------------------------------------------------------------

interface CdcResult {
  Errors?: { Err: { Code: number; Msg: string } | { Code: number; Msg: string }[] };
  ResultGet?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// CdcClient
// ---------------------------------------------------------------------------

/**
 * Low-level client that wraps each WSCDC SOAP method.
 * Does not handle authentication — callers must provide an Auth object.
 */
export class CdcClient {
  private readonly endpoint: string;
  private readonly namespace: string;
  private readonly soapOptions?: Pick<SoapCallOptions, 'timeout' | 'retries' | 'retryDelayMs'>;
  private readonly onEvent?: (event: ArcaEvent) => void;

  constructor(config: {
    endpoint: string;
    namespace: string;
    soapOptions?: Pick<SoapCallOptions, 'timeout' | 'retries' | 'retryDelayMs'>;
    onEvent?: (event: ArcaEvent) => void;
  }) {
    this.endpoint = config.endpoint;
    this.namespace = config.namespace;
    this.soapOptions = config.soapOptions;
    this.onEvent = config.onEvent;
  }

  // -------------------------------------------------------------------------
  // Private helper
  // -------------------------------------------------------------------------

  private call(method: string, params: Record<string, unknown>): Promise<Record<string, unknown>> {
    return afipSoapCall(this.endpoint, this.namespace, method, params, {
      ...this.soapOptions,
      onEvent: this.onEvent,
    });
  }

  // -------------------------------------------------------------------------
  // ComprobanteConstatar
  // -------------------------------------------------------------------------

  /**
   * Verify whether a comprobante was actually authorized by ARCA.
   * Validates CAE, CAI, or CAEA codes.
   */
  async constatar(auth: CdcAuth, input: ConstatarInput): Promise<ConstatarResult> {
    const result = (await this.call('ComprobanteConstatar', {
      Auth: auth,
      CbteTipo: input.CbteTipo,
      PtoVta: input.PtoVta,
      CbteNro: input.CbteNro,
      CbteFch: input.CbteFch,
      ImpTotal: input.ImpTotal,
      CodAutorizacion: input.CodAutorizacion,
      DocTipoReceptor: input.DocTipoReceptor,
      DocNroReceptor: input.DocNroReceptor,
    })) as Record<string, unknown>;

    const resultado = (result['Resultado'] ?? 'R') as 'A' | 'R';

    // Parse Observaciones
    let observaciones: ConstatarObservacion[] | undefined;
    const obsRaw = result['Observaciones'] as Record<string, unknown> | undefined;
    if (obsRaw) {
      const obsArr = ensureArray(obsRaw['Obs'] as Record<string, unknown> | Record<string, unknown>[] | undefined);
      if (obsArr.length > 0) {
        observaciones = obsArr.map((o) => ({
          Code: Number(o['Code'] ?? 0),
          Msg: String(o['Msg'] ?? ''),
        }));
      }
    }

    // Parse Errors
    let errors: ConstatarError[] | undefined;
    const errRaw = result['Errors'] as Record<string, unknown> | undefined;
    if (errRaw) {
      const errArr = ensureArray(errRaw['Err'] as Record<string, unknown> | Record<string, unknown>[] | undefined);
      if (errArr.length > 0) {
        errors = errArr.map((e) => ({
          Code: Number(e['Code'] ?? 0),
          Msg: String(e['Msg'] ?? ''),
        }));
      }
    }

    return {
      Resultado: resultado,
      ...(observaciones && { Observaciones: observaciones }),
      ...(errors && { Errors: errors }),
    };
  }

  // -------------------------------------------------------------------------
  // ComprobanteDummy
  // -------------------------------------------------------------------------

  /**
   * Health check for the WSCDC service. Does not require authentication.
   */
  async dummy(): Promise<ServerStatus> {
    const result = await this.call('ComprobanteDummy', {});
    return {
      appserver: (result['AppServer'] ?? result['appserver'] ?? '') as string,
      dbserver: (result['DbServer'] ?? result['dbserver'] ?? '') as string,
      authserver: (result['AuthServer'] ?? result['authserver'] ?? '') as string,
    };
  }

  // -------------------------------------------------------------------------
  // ComprobantesModalidadConsultar
  // -------------------------------------------------------------------------

  /**
   * Query enabled billing modalities.
   */
  async getModalidades(auth: CdcAuth): Promise<ModalidadItem[]> {
    const result = (await this.call('ComprobantesModalidadConsultar', {
      Auth: auth,
    })) as CdcResult;

    checkServiceErrors(result as Record<string, unknown>, 'WSCDC');

    const items = result.ResultGet?.['CbteTipo'] ?? result.ResultGet?.['Modalidad'];
    return ensureArray(items as Record<string, unknown> | Record<string, unknown>[] | undefined).map((raw) => {
      const item: ModalidadItem = {
        Id: Number(raw['Id'] ?? 0),
        Desc: String(raw['Desc'] ?? ''),
      };
      if (raw['FchDesde']) item.FchDesde = String(raw['FchDesde']);
      if (raw['FchHasta']) item.FchHasta = String(raw['FchHasta']);
      return item;
    });
  }

  // -------------------------------------------------------------------------
  // ComprobantesTipoConsultar
  // -------------------------------------------------------------------------

  /**
   * Query enabled voucher types.
   */
  async getTiposCbte(auth: CdcAuth): Promise<TipoCbteItem[]> {
    const result = (await this.call('ComprobantesTipoConsultar', {
      Auth: auth,
    })) as CdcResult;

    checkServiceErrors(result as Record<string, unknown>, 'WSCDC');

    const items = result.ResultGet?.['CbteTipo'];
    return ensureArray(items as Record<string, unknown> | Record<string, unknown>[] | undefined).map((raw) => {
      const item: TipoCbteItem = {
        Id: Number(raw['Id'] ?? 0),
        Desc: String(raw['Desc'] ?? ''),
      };
      if (raw['FchDesde']) item.FchDesde = String(raw['FchDesde']);
      if (raw['FchHasta']) item.FchHasta = String(raw['FchHasta']);
      return item;
    });
  }

  // -------------------------------------------------------------------------
  // DocumentosTipoConsultar
  // -------------------------------------------------------------------------

  /**
   * Query enabled document types.
   */
  async getDocTipos(auth: CdcAuth): Promise<DocTipoItem[]> {
    const result = (await this.call('DocumentosTipoConsultar', {
      Auth: auth,
    })) as CdcResult;

    checkServiceErrors(result as Record<string, unknown>, 'WSCDC');

    const items = result.ResultGet?.['DocTipo'];
    return ensureArray(items as Record<string, unknown> | Record<string, unknown>[] | undefined).map((raw) => {
      const item: DocTipoItem = {
        Id: Number(raw['Id'] ?? 0),
        Desc: String(raw['Desc'] ?? ''),
      };
      if (raw['FchDesde']) item.FchDesde = String(raw['FchDesde']);
      if (raw['FchHasta']) item.FchHasta = String(raw['FchHasta']);
      return item;
    });
  }
}
