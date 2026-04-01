/**
 * Ejemplo: Consultas de parametros del servicio WSCDC
 *
 * Consulta los tipos de documentos, tipos de comprobante y modalidades
 * de facturacion habilitados.
 */

import fs from "fs";
import { ArcaCdc } from "@ramiidv/arca-cdc";

async function main() {
  const cdc = new ArcaCdc({
    cuit: 20123456789,
    cert: fs.readFileSync("./certs/certificado.crt", "utf-8"),
    key: fs.readFileSync("./certs/clave.key", "utf-8"),
    production: false,
  });

  // Tipos de documento habilitados (DNI, CUIT, etc.)
  const docTipos = await cdc.getDocTipos();
  console.log("Tipos de documento:");
  for (const doc of docTipos) {
    console.log(`  [${doc.Id}] ${doc.Desc}`);
  }

  // Tipos de comprobante habilitados (Factura A, B, C, etc.)
  const tiposCbte = await cdc.getTiposCbte();
  console.log("\nTipos de comprobante:");
  for (const tipo of tiposCbte) {
    console.log(`  [${tipo.Id}] ${tipo.Desc}`);
  }

  // Modalidades de facturacion (CAE, CAI, CAEA)
  const modalidades = await cdc.getModalidades();
  console.log("\nModalidades de facturacion:");
  for (const mod of modalidades) {
    console.log(`  [${mod.Id}] ${mod.Desc}`);
  }
}

main().catch(console.error);
