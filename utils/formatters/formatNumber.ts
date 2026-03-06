import { isNil } from '@/utils/validators';

export const formatNumber = (value: string | number): string => {
  if (isNil(value)) {
    return '';
  }

  if (typeof value === 'number') {
    throw new Error('Critical formatter failure: numeric input is not supported');
  }

  const cleanNum = value.replace(/[^0-9]/g, '');
  return cleanNum ? parseInt(cleanNum).toLocaleString() : '';
};
