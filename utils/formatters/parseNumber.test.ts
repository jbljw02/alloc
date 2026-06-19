import { parseNumber } from '@/utils/formatters';

describe('parseNumber', () => {
  it('포맷된 숫자 문자열을 숫자로 변환한다', () => {
    expect(parseNumber('1,234')).toBe(1234);
  });

  it('음수 문자열이면 null을 반환한다', () => {
    expect(parseNumber('-123')).toBeNull();
  });

  it('숫자가 아닌 문자열이면 null을 반환한다', () => {
    expect(parseNumber('abc')).toBeNull();
  });

  it('빈 문자열이면 0을 반환한다', () => {
    expect(parseNumber('')).toBe(0);
  });

  it('음수 number면 null을 반환한다', () => {
    expect(parseNumber(-1)).toBeNull();
  });

  it('nullish 값이면 0을 반환한다', () => {
    expect(parseNumber(null as unknown as string)).toBe(0);
  });
});
