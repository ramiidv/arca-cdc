import { describe, it, expect } from 'vitest';
import { validateConstatarInput } from '../src/validation.js';
import type { ConstatarInput } from '../src/types.js';

const validInput: ConstatarInput = {
  CbteTipo: 1,
  PtoVta: 1,
  CbteNro: 150,
  CbteFch: '20260315',
  ImpTotal: 12100,
  CodAutorizacion: '73429843294823',
  DocTipoReceptor: 80,
  DocNroReceptor: 30712345678,
};

describe('validateConstatarInput', () => {
  it('acepta input valido', () => {
    expect(() => validateConstatarInput(validInput)).not.toThrow();
  });

  it('acepta ImpTotal = 0', () => {
    expect(() =>
      validateConstatarInput({ ...validInput, ImpTotal: 0 }),
    ).not.toThrow();
  });

  it('acepta DocTipoReceptor = 0 (consumidor final)', () => {
    expect(() =>
      validateConstatarInput({ ...validInput, DocTipoReceptor: 0, DocNroReceptor: 0 }),
    ).not.toThrow();
  });

  it('rechaza CbteTipo = 0', () => {
    expect(() =>
      validateConstatarInput({ ...validInput, CbteTipo: 0 }),
    ).toThrow('CbteTipo');
  });

  it('rechaza PtoVta negativo', () => {
    expect(() =>
      validateConstatarInput({ ...validInput, PtoVta: -1 }),
    ).toThrow('PtoVta');
  });

  it('rechaza CbteNro = 0', () => {
    expect(() =>
      validateConstatarInput({ ...validInput, CbteNro: 0 }),
    ).toThrow('CbteNro');
  });

  it('rechaza CbteFch con formato incorrecto (YYYY-MM-DD)', () => {
    expect(() =>
      validateConstatarInput({ ...validInput, CbteFch: '2026-03-15' }),
    ).toThrow('CbteFch');
  });

  it('rechaza CbteFch vacio', () => {
    expect(() =>
      validateConstatarInput({ ...validInput, CbteFch: '' }),
    ).toThrow('CbteFch');
  });

  it('rechaza CbteFch con letras', () => {
    expect(() =>
      validateConstatarInput({ ...validInput, CbteFch: 'abcdefgh' }),
    ).toThrow('CbteFch');
  });

  it('rechaza ImpTotal negativo', () => {
    expect(() =>
      validateConstatarInput({ ...validInput, ImpTotal: -1 }),
    ).toThrow('ImpTotal');
  });

  it('rechaza CodAutorizacion con menos de 14 digitos', () => {
    expect(() =>
      validateConstatarInput({ ...validInput, CodAutorizacion: '12345' }),
    ).toThrow('CodAutorizacion');
  });

  it('rechaza CodAutorizacion con mas de 14 digitos', () => {
    expect(() =>
      validateConstatarInput({ ...validInput, CodAutorizacion: '123456789012345' }),
    ).toThrow('CodAutorizacion');
  });

  it('rechaza CodAutorizacion con letras', () => {
    expect(() =>
      validateConstatarInput({ ...validInput, CodAutorizacion: '7342984329AB23' }),
    ).toThrow('CodAutorizacion');
  });

  it('rechaza CodAutorizacion vacio', () => {
    expect(() =>
      validateConstatarInput({ ...validInput, CodAutorizacion: '' }),
    ).toThrow('CodAutorizacion');
  });

  it('rechaza DocTipoReceptor negativo', () => {
    expect(() =>
      validateConstatarInput({ ...validInput, DocTipoReceptor: -1 }),
    ).toThrow('DocTipoReceptor');
  });

  it('rechaza DocNroReceptor negativo', () => {
    expect(() =>
      validateConstatarInput({ ...validInput, DocNroReceptor: -1 }),
    ).toThrow('DocNroReceptor');
  });

  it('reporta multiples errores a la vez', () => {
    expect(() =>
      validateConstatarInput({
        ...validInput,
        CbteTipo: 0,
        PtoVta: 0,
        CodAutorizacion: 'bad',
      }),
    ).toThrow('CbteTipo');
  });
});
