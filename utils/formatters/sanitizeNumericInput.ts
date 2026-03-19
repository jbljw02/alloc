import { isNil } from '@/utils/validators';

export const sanitizeNumericInput = (value: string | number): string => {
  if (isNil(value)) {
    return '';
  }

  if (typeof value === 'number') {
    if (Number.isNaN(value)) {
      return '';
    }

    return String(value).replace(/[^0-9]/g, '');
  }

  return value.replace(/[^0-9]/g, '');
};

