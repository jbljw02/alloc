import { isNil } from '@/utils/validators';

export const formatNumber = (value: string | number): string => {
  if (isNil(value)) {
    return '';
  }

  if (typeof value === 'number') {
    if (Number.isNaN(value)) {
      return '';
    }
    return value.toLocaleString();
  }

  const cleanNum = value.replace(/[^0-9]/g, '');
  return cleanNum ? parseInt(cleanNum).toLocaleString() : '';
};
