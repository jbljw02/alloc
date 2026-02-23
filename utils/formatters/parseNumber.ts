import { isNil } from '@/utils/validators';

export const parseNumber = (value: string | number): number => {
  if (isNil(value)) {
    return 0;
  }

  if (typeof value === 'number') {
    return Number.isNaN(value) ? 0 : value;
  }

  const cleanNum = value.replace(/[^0-9]/g, '');
  return cleanNum ? parseInt(cleanNum, 10) : 0;
};
