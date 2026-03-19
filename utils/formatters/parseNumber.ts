import { isNil } from '@/utils/validators';
import { sanitizeNumericInput } from './sanitizeNumericInput';

export const parseNumber = (value: string | number): number => {
  if (isNil(value)) {
    return 0;
  }

  if (typeof value === 'number') {
    return Number.isNaN(value) ? 0 : value;
  }

  const cleanNum = sanitizeNumericInput(value);
  return cleanNum ? parseInt(cleanNum, 10) : 0;
};
