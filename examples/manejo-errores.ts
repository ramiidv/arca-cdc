/**
 * Ejemplo: Manejo de errores
 *
 * El SDK provee clases de error especificas para catch granular:
 *   - ArcaAuthError: falla de autenticacion WSAA
 *   - ArcaSoapError: error HTTP/SOAP (timeout, servidor caido)
 *   - ArcaServiceError: error de negocio de ARCA (con codigos)
 *   - ArcaValidationError: datos de entrada invalidos
 */

import fs from "fs";
import {
  ArcaCdc,
  ArcaAuthError,
  ArcaSoapError,
  ArcaServiceError,
} from "@ramiidv/arca-cdc";
import { ArcaValidationError } from "@ramiidv/arca-common";

async function main() {
  const cdc = new ArcaCdc({
    cuit: 20123456789,
    cert: fs.readFileSync("./certs/certificado.crt", "utf-8"),
    key: fs.readFileSync("./certs/clave.key", "utf-8"),
    production: false,
    timeout: 60_000,
  });

  try {
    const result = await cdc.constatar({
      CbteTipo: 1,
      PtoVta: 1,
      CbteNro: 150,
      CbteFch: "20260315",
      ImpTotal: 12100,
      CodAutorizacion: "73429843294823",
      DocTipoReceptor: 80,
      DocNroReceptor: 30712345678,
    });

    if (result.Resultado === "R") {
      console.error("Comprobante rechazado:");
      for (const obs of result.Observaciones ?? []) {
        console.error(`  [${obs.Code}] ${obs.Msg}`);
      }
      return;
    }

    console.log("Comprobante verificado correctamente.");
  } catch (e) {
    if (e instanceof ArcaValidationError) {
      // Datos de entrada invalidos (se detecta antes de llamar al servicio)
      console.error("Error de validacion:", e.message);
      for (const detail of e.details) {
        console.error(`  Campo: ${detail.field} - ${detail.message}`);
      }
    } else if (e instanceof ArcaAuthError) {
      // Certificado invalido, expirado, o respuesta WSAA inesperada
      console.error("Error de autenticacion:", e.message);
      cdc.clearAuthCache();
    } else if (e instanceof ArcaServiceError) {
      // Error de negocio con codigos de ARCA
      for (const err of e.errors) {
        console.error(`ARCA [${err.code}]: ${err.msg}`);
      }
    } else if (e instanceof ArcaSoapError) {
      // Timeout, HTTP 500, SOAP Fault
      console.error("Error de conexion:", e.message);
      if (e.statusCode) console.error("HTTP status:", e.statusCode);
    } else {
      throw e;
    }
  }
}

main().catch(console.error);
