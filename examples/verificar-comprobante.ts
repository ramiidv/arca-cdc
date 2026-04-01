/**
 * Ejemplo: Verificar la autenticidad de un comprobante recibido
 *
 * Usa el servicio WSCDC para constatar que un comprobante (factura, nota de
 * credito, etc.) fue efectivamente autorizado por ARCA. Valida el CAE, CAI
 * o CAEA informado.
 *
 * Requisitos:
 *   - Certificado digital (.crt) y clave privada (.key) de ARCA
 *   - CUIT del contribuyente
 */

import fs from "fs";
import { ArcaCdc } from "@ramiidv/arca-cdc";

async function main() {
  // 1. Inicializar el SDK
  const cdc = new ArcaCdc({
    cuit: 20123456789,
    cert: fs.readFileSync("./certs/certificado.crt", "utf-8"),
    key: fs.readFileSync("./certs/clave.key", "utf-8"),
    production: false,
  });

  // 2. Verificar que el servicio este activo
  const status = await cdc.status();
  console.log("Estado del servicio:", status);

  // 3. Constatar un comprobante recibido
  const result = await cdc.constatar({
    CbteTipo: 1, // Factura A
    PtoVta: 1,
    CbteNro: 150,
    CbteFch: "20260315",
    ImpTotal: 12100,
    CodAutorizacion: "73429843294823",
    DocTipoReceptor: 80, // CUIT
    DocNroReceptor: 30712345678,
  });

  // 4. Evaluar resultado
  if (result.Resultado === "A") {
    console.log("Comprobante APROBADO - el CAE/CAI/CAEA es valido.");
  } else {
    console.log("Comprobante RECHAZADO - el comprobante no fue autorizado por ARCA.");
    if (result.Observaciones) {
      for (const obs of result.Observaciones) {
        console.log(`  Observacion [${obs.Code}]: ${obs.Msg}`);
      }
    }
  }

  if (result.Errors) {
    for (const err of result.Errors) {
      console.error(`  Error [${err.Code}]: ${err.Msg}`);
    }
  }
}

main().catch(console.error);
