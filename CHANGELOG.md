# Changelog

## 0.1.0 (2026-03-31)

### Features
- Initial release
- Verify comprobantes (invoices) against ARCA using `constatar()` with CAE, CAI, or CAEA codes
- Query available billing modalities via `getModalidades()`
- Query enabled voucher types via `getTiposCbte()`
- Query enabled document types via `getDocTipos()`
- Service health check via `status()`
- Automatic WSAA authentication with ticket caching
- Input validation for `constatar()` parameters
- Full TypeScript support with strict types
