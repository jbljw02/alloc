import { isNil } from '@/utils/validators';

export const formatNumber = (num: string) => {
  if (isNil(num)) {
    return '';
  }

  const cleanNum = num.replace(/[^0-9]/g, '');
  return cleanNum ? parseInt(cleanNum).toLocaleString() : '';
};
