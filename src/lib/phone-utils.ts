/**
 * Utilitários para validação e formatação de telefones brasileiros
 */

/**
 * Remove todos os caracteres não numéricos de uma string
 */
export const cleanPhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

/**
 * Formata um número de telefone brasileiro
 * Aceita 10 ou 11 dígitos (com DDD)
 * Formato: (XX) XXXX-XXXX ou (XX) XXXXX-XXXX
 */
export const formatPhone = (value: string): string => {
  const numbers = cleanPhone(value);
  
  if (numbers.length === 0) return '';
  
  if (numbers.length <= 2) {
    return `(${numbers}`;
  }
  
  if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  }
  
  if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  }
  
  // 11 dígitos (celular com 9)
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

/**
 * Valida se um telefone brasileiro está no formato correto
 * Aceita: (XX) XXXX-XXXX ou (XX) XXXXX-XXXX
 */
export const isValidPhone = (phone: string): boolean => {
  const numbers = cleanPhone(phone);
  
  // Deve ter 10 ou 11 dígitos
  if (numbers.length < 10 || numbers.length > 11) {
    return false;
  }
  
  // DDD deve ser válido (11-99)
  const ddd = parseInt(numbers.slice(0, 2));
  if (ddd < 11 || ddd > 99) {
    return false;
  }
  
  // Se tiver 11 dígitos, o primeiro dígito após o DDD deve ser 9
  if (numbers.length === 11) {
    const firstDigit = parseInt(numbers.charAt(2));
    if (firstDigit !== 9) {
      return false;
    }
  }
  
  return true;
};

/**
 * Retorna mensagem de erro de validação de telefone
 */
export const getPhoneValidationError = (phone: string): string | null => {
  if (!phone || phone.trim() === '') {
    return 'Telefone é obrigatório';
  }
  
  const numbers = cleanPhone(phone);
  
  if (numbers.length < 10) {
    return 'Telefone deve ter no mínimo 10 dígitos';
  }
  
  if (numbers.length > 11) {
    return 'Telefone deve ter no máximo 11 dígitos';
  }
  
  const ddd = parseInt(numbers.slice(0, 2));
  if (ddd < 11 || ddd > 99) {
    return 'DDD inválido';
  }
  
  if (numbers.length === 11) {
    const firstDigit = parseInt(numbers.charAt(2));
    if (firstDigit !== 9) {
      return 'Celular deve começar com 9 após o DDD';
    }
  }
  
  return null;
};
