import { ArcaValidationError } from '@ramiidv/arca-common';
import type { ValidationErrorDetail } from '@ramiidv/arca-common';
import type { ConstatarInput } from './types.js';

/**
 * Validates the input for the `constatar()` method.
 *
 * @throws ArcaValidationError if any field is invalid
 */
export function validateConstatarInput(input: ConstatarInput): void {
  const errors: ValidationErrorDetail[] = [];

  if (input.CbteTipo == null || input.CbteTipo <= 0) {
    errors.push({
      field: 'CbteTipo',
      message: 'CbteTipo debe ser > 0',
      value: input.CbteTipo,
    });
  }

  if (input.PtoVta == null || input.PtoVta <= 0) {
    errors.push({
      field: 'PtoVta',
      message: 'PtoVta debe ser > 0',
      value: input.PtoVta,
    });
  }

  if (input.CbteNro == null || input.CbteNro <= 0) {
    errors.push({
      field: 'CbteNro',
      message: 'CbteNro debe ser > 0',
      value: input.CbteNro,
    });
  }

  if (!input.CbteFch || !/^\d{8}$/.test(input.CbteFch)) {
    errors.push({
      field: 'CbteFch',
      message: 'CbteFch debe tener formato YYYYMMDD (8 digitos)',
      value: input.CbteFch,
    });
  }

  if (input.ImpTotal == null || input.ImpTotal < 0) {
    errors.push({
      field: 'ImpTotal',
      message: 'ImpTotal debe ser >= 0',
      value: input.ImpTotal,
    });
  }

  if (!input.CodAutorizacion || !/^\d{14}$/.test(input.CodAutorizacion)) {
    errors.push({
      field: 'CodAutorizacion',
      message: 'CodAutorizacion debe ser un string de 14 digitos',
      value: input.CodAutorizacion,
    });
  }

  if (input.DocTipoReceptor == null || input.DocTipoReceptor < 0) {
    errors.push({
      field: 'DocTipoReceptor',
      message: 'DocTipoReceptor debe ser >= 0',
      value: input.DocTipoReceptor,
    });
  }

  if (input.DocNroReceptor == null || input.DocNroReceptor < 0) {
    errors.push({
      field: 'DocNroReceptor',
      message: 'DocNroReceptor debe ser >= 0',
      value: input.DocNroReceptor,
    });
  }

  if (errors.length > 0) {
    throw new ArcaValidationError(
      `Validacion de ConstatarInput fallida: ${errors.map((e) => e.message).join('; ')}`,
      errors,
    );
  }
}
