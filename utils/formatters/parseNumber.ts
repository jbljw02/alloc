import { isNil } from '@/utils/validators';
import { sanitizeNumericInput } from './sanitizeNumericInput';

export const parseNumber = (value: string | number): number | null => {
  if (isNil(value)) {
    return 0;
  }

  if (typeof value === 'number') {
    if (Number.isNaN(value) || value < 0) {
      return null;
    }

    return value;
  }

  if (value.includes('-')) {
    return null;
  }

  const trimmedValue = value.trim();

  if (trimmedValue === '') {
    return 0;
  }

  const hasInvalidCharacters = trimmedValue.replace(/[0-9,\s]/g, '') !== '';

  if (hasInvalidCharacters) {
    return null;
  }

  const cleanNum = sanitizeNumericInput(trimmedValue);
  return cleanNum ? parseInt(cleanNum, 10) : 0;
};
