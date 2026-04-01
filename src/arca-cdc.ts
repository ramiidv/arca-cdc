import { WsaaClient } from '@ramiidv/arca-common';
import type { ArcaEvent, SoapCallOptions, ServerStatus } from '@ramiidv/arca-common';
import { WSCDC_ENDPOINTS, WSCDC_NAMESPACE, WSCDC_SERVICE_ID } from './constants.js';
import { CdcClient } from './cdc-client.js';
import { validateConstatarInput } from './validation.js';
import type {
  ArcaCdcConfig,
  CdcAuth,
  ConstatarInput,
  ConstatarResult,
  ModalidadItem,
  TipoCbteItem,
  DocTipoItem,
} from './types.js';

/**
 * Main orchestrator class for the WSCDC (Constatacion de Comprobantes) web service.
 *
 * Provides high-level methods that handle WSAA authentication automatically
 * and expose all WSCDC operations.
 *
 * @example
 * ```ts
 * import { ArcaCdc } from '@ramiidv/arca-cdc';
 * import { readFileSync } from 'fs';
 *
 * const cdc = new ArcaCdc({
 *   cert: readFileSync('cert.pem', 'utf-8'),
 *   key: readFileSync('key.pem', 'utf-8'),
 *   cuit: 20123456789,
 *   production: false,
 * });
 *
 * const result = await cdc.constatar({
 *   CbteTipo: 1,
 *   PtoVta: 1,
 *   CbteNro: 150,
 *   CbteFch: '20260315',
 *   ImpTotal: 12100,
 *   CodAutorizacion: '73429843294823',
 *   DocTipoReceptor: 80,
 *   DocNroReceptor: 30712345678,
 * });
 *
 * console.log(result.Resultado); // "A" = Aprobado, "R" = Rechazado
 * ```
 */
export class ArcaCdc {
  /** Low-level WSAA client for direct access */
  public readonly wsaa: WsaaClient;
  /** Low-level CDC client for direct access */
  public readonly client: CdcClient;

  private readonly cuit: number;
  private readonly onEvent?: (event: ArcaEvent) => void;

  constructor(config: ArcaCdcConfig) {
    const isProduction = config.production ?? false;
    const env = isProduction ? 'production' : 'testing';
    this.cuit = config.cuit;
    this.onEvent = config.onEvent;

    const soapOptions: Pick<SoapCallOptions, 'timeout' | 'retries' | 'retryDelayMs'> = {
      timeout: config.timeout,
      retries: config.retries,
      retryDelayMs: config.retryDelayMs,
    };

    this.wsaa = new WsaaClient({
      cert: config.cert,
      key: config.key,
      production: isProduction,
      timeout: config.timeout,
      retries: config.retries,
      retryDelayMs: config.retryDelayMs,
      onEvent: config.onEvent,
    });

    this.client = new CdcClient({
      endpoint: WSCDC_ENDPOINTS[env],
      namespace: WSCDC_NAMESPACE,
      soapOptions,
      onEvent: config.onEvent,
    });
  }

  // -------------------------------------------------------------------------
  // Public methods
  // -------------------------------------------------------------------------

  /**
   * Verify whether a comprobante was actually authorized by ARCA.
   * Validates CAE, CAI, or CAEA codes.
   *
   * @param input - Comprobante data to verify
   * @returns Result with "A" (approved) or "R" (rejected)
   */
  async constatar(input: ConstatarInput): Promise<ConstatarResult> {
    validateConstatarInput(input);
    const auth = await this.getAuth();
    return this.client.constatar(auth, input);
  }

  /**
   * Health check for the WSCDC service.
   * Does not require authentication.
   */
  async status(): Promise<ServerStatus> {
    return this.client.dummy();
  }

  /**
   * Query enabled billing modalities.
   * Requires authentication.
   */
  async getModalidades(): Promise<ModalidadItem[]> {
    const auth = await this.getAuth();
    return this.client.getModalidades(auth);
  }

  /**
   * Query enabled voucher types.
   * Requires authentication.
   */
  async getTiposCbte(): Promise<TipoCbteItem[]> {
    const auth = await this.getAuth();
    return this.client.getTiposCbte(auth);
  }

  /**
   * Query enabled document types.
   * Requires authentication.
   */
  async getDocTipos(): Promise<DocTipoItem[]> {
    const auth = await this.getAuth();
    return this.client.getDocTipos(auth);
  }

  /**
   * Invalidate cached WSAA access tickets.
   */
  clearAuthCache(): void {
    this.wsaa.clearAllTickets();
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private async getAuth(): Promise<CdcAuth> {
    const ticket = await this.wsaa.getAccessTicket(WSCDC_SERVICE_ID);
    return {
      Token: ticket.token,
      Sign: ticket.sign,
      Cuit: this.cuit,
    };
  }
}
