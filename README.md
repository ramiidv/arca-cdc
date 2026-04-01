# @ramiidv/arca-cdc

[![npm](https://img.shields.io/npm/v/@ramiidv/arca-cdc)](https://www.npmjs.com/package/@ramiidv/arca-cdc)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node >= 18](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)

SDK en TypeScript para el web service **WSCDC** (Constatacion de Comprobantes) de **ARCA** (ex AFIP).

Permite verificar programaticamente si los comprobantes recibidos fueron efectivamente autorizados por ARCA. Valida codigos CAE, CAI o CAEA. Servicio de solo lectura.

## Instalacion

```bash
npm install @ramiidv/arca-cdc
```

## Requisitos

- Node.js >= 18
- Certificado digital X.509 y clave privada de ARCA
  - **Testing**: generalo desde [WSASS Homologacion](https://wsass-homo.afip.gob.ar/wsass/portal/main.aspx)
  - **Produccion**: generalo desde [Administracion de Certificados Digitales](https://www.afip.gob.ar/ws/documentacion/certificados.asp) (requiere clave fiscal en [arca.gob.ar](https://arca.gob.ar))

## Uso rapido

```typescript
import fs from "fs";
import { ArcaCdc } from "@ramiidv/arca-cdc";

const cdc = new ArcaCdc({
  cuit: 20123456789,
  cert: fs.readFileSync("./cert.crt", "utf-8"),
  key: fs.readFileSync("./key.key", "utf-8"),
  production: false, // true para produccion
});

// Verificar un comprobante
const result = await cdc.constatar({
  CbteTipo: 1,           // Factura A
  PtoVta: 1,
  CbteNro: 150,
  CbteFch: "20260315",   // Fecha YYYYMMDD
  ImpTotal: 12100,
  CodAutorizacion: "73429843294823", // CAE, CAI, o CAEA
  DocTipoReceptor: 80,   // CUIT
  DocNroReceptor: 30712345678,
});

if (result.Resultado === "A") {
  console.log("Comprobante verificado correctamente");
} else {
  console.log("Comprobante rechazado");
  console.log(result.Observaciones);
}
```

## Configuracion

```typescript
const cdc = new ArcaCdc({
  cuit: 20123456789,          // CUIT sin guiones
  cert: "...",                 // Certificado X.509 (PEM)
  key: "...",                  // Clave privada (PEM)
  production: false,           // Default: false (testing/homologacion)
  timeout: 30_000,             // Default: 30000 (30 segundos)
  retries: 1,                  // Default: 1 (reintentos en errores transitorios)
  retryDelayMs: 1_000,         // Default: 1000 (backoff exponencial: 1s, 2s, ...)
  onEvent: (e) => {            // Opcional: callback para logging/debugging
    console.log(e.type, e);
  },
});
```

## API

### `new ArcaCdc(config)`

| Parametro | Tipo | Default | Descripcion |
| --- | --- | --- | --- |
| `cuit` | `number` | -- | CUIT del contribuyente (sin guiones) |
| `cert` | `string` | -- | Contenido del certificado X.509 (PEM) |
| `key` | `string` | -- | Contenido de la clave privada (PEM) |
| `production` | `boolean` | `false` | Entorno de produccion |
| `timeout` | `number` | `30000` | Timeout HTTP en milisegundos |
| `retries` | `number` | `1` | Reintentos en errores transitorios |
| `retryDelayMs` | `number` | `1000` | Delay inicial entre reintentos (exponencial) |
| `onEvent` | `function` | -- | Callback para eventos del SDK |

### Metodos

| Metodo | Descripcion |
| --- | --- |
| `constatar(input)` | Verifica si un comprobante fue autorizado por ARCA |
| `status()` | Health check del servicio (no requiere autenticacion) |
| `getModalidades()` | Consulta modalidades de facturacion habilitadas |
| `getTiposCbte()` | Consulta tipos de comprobante habilitados |
| `getDocTipos()` | Consulta tipos de documento habilitados |
| `clearAuthCache()` | Invalida los tickets de acceso cacheados |

### `constatar(input)`

Verifica si un comprobante fue efectivamente autorizado por ARCA. Valida codigos CAE, CAI, o CAEA.

```typescript
interface ConstatarInput {
  CbteTipo: number;          // Tipo de comprobante
  PtoVta: number;            // Punto de venta
  CbteNro: number;           // Numero de comprobante
  CbteFch: string;           // Fecha (YYYYMMDD)
  ImpTotal: number;          // Importe total
  CodAutorizacion: string;   // CAE, CAI, o CAEA
  DocTipoReceptor: number;   // Tipo de documento del receptor
  DocNroReceptor: number;    // Numero de documento del receptor
}

interface ConstatarResult {
  Resultado: "A" | "R";               // A=Aprobado, R=Rechazado
  Observaciones?: { Code, Msg }[];    // Detalles del rechazo
  Errors?: { Code, Msg }[];           // Errores del servicio
}
```

### Consultas de parametros

```typescript
// Modalidades de facturacion
const modalidades = await cdc.getModalidades();

// Tipos de comprobante
const tiposCbte = await cdc.getTiposCbte();

// Tipos de documento
const docTipos = await cdc.getDocTipos();
```

Cada item retorna `{ Id: number, Desc: string, FchDesde?: string, FchHasta?: string }`.

### Acceso a clientes de bajo nivel

Para casos avanzados, se pueden usar los clientes individuales directamente:

```typescript
const cdc = new ArcaCdc({ /* ... */ });

// Obtener ticket de acceso manualmente
const ticket = await cdc.wsaa.getAccessTicket("wscdc");

const auth = {
  Token: ticket.token,
  Sign: ticket.sign,
  Cuit: 20123456789,
};

// Llamar directamente al servicio
const result = await cdc.client.constatar(auth, { /* ... */ });
```

## Manejo de errores

El SDK usa la jerarquia de errores de `@ramiidv/arca-common`:

```typescript
import {
  ArcaAuthError,
  ArcaServiceError,
  ArcaSoapError,
} from "@ramiidv/arca-cdc";

try {
  const result = await cdc.constatar({ /* ... */ });
} catch (e) {
  if (e instanceof ArcaAuthError) {
    // Error de autenticacion WSAA (certificado invalido, expirado, etc.)
    console.error("Auth error:", e.message);
    cdc.clearAuthCache();
  }

  if (e instanceof ArcaServiceError) {
    // Error de negocio devuelto por ARCA
    for (const err of e.errors) {
      console.error(`[${err.code}] ${err.msg}`);
    }
  }

  if (e instanceof ArcaSoapError) {
    // Error HTTP/SOAP (timeout, servidor caido, etc.)
    console.error("HTTP status:", e.statusCode);
  }
}
```

| Clase | Cuando se lanza |
| --- | --- |
| `ArcaAuthError` | Falla en login WSAA, respuesta inesperada, token/sign invalidos |
| `ArcaServiceError` | Error devuelto por WSCDC (campos invalidos, CUIT no autorizado, etc.). Contiene `errors: { code, msg }[]` |
| `ArcaSoapError` | Error HTTP, timeout, SOAP Fault. Contiene `statusCode?: number` |
| `ArcaError` | Clase base para todos los errores del SDK |

## Eventos

El SDK emite eventos para debugging y monitoreo:

```typescript
const cdc = new ArcaCdc({
  // ...
  onEvent: (evento) => {
    switch (evento.type) {
      case "auth:login":
        console.log(`Login para ${evento.service}`);
        break;
      case "auth:cache-hit":
        console.log(`Token cacheado para ${evento.service}`);
        break;
      case "request:start":
        console.log(`Inicio ${evento.method}`);
        break;
      case "request:end":
        console.log(`Fin ${evento.method} (${evento.durationMs}ms)`);
        break;
      case "request:retry":
        console.log(`Reintento #${evento.attempt}`);
        break;
      case "request:error":
        console.log(`Error: ${evento.error}`);
        break;
    }
  },
});
```

| Evento | Cuando | Datos |
| --- | --- | --- |
| `auth:login` | Nuevo token obtenido | `service`, `durationMs` |
| `auth:cache-hit` | Token cacheado reutilizado | `service` |
| `request:start` | Antes de una llamada SOAP | `method`, `endpoint` |
| `request:end` | Llamada SOAP completada | `method`, `durationMs` |
| `request:retry` | Reintentando tras error | `method`, `attempt`, `error` |
| `request:error` | Llamada SOAP fallo | `method`, `error` |

## Entornos

| Entorno | WSAA | WSCDC |
| --- | --- | --- |
| Testing | `wsaahomo.afip.gov.ar` | `wswhomo.afip.gov.ar` |
| Produccion | `wsaa.afip.gov.ar` | `servicios1.arca.gob.ar` |

## Licencia

MIT
