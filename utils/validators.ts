export const isNil = <T>(value: T | null | undefined): value is null | undefined => {
  return value == null;
};

export const isNotNil = <T>(value: T | null | undefined): value is T => {
  return value != null;
};

export const isEmptyString = (value: string): boolean => {
  return value === '';
};

export const isNotEmptyString = (value: string): boolean => {
  return value !== '';
};

export const isEmptyArray = <T>(value: T[]): boolean => {
  return value.length === 0;
};

export const isNotEmptyArray = <T>(value: T[]): boolean => {
  return value.length > 0;
};
