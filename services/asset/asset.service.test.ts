import { CATEGORY_TYPES } from '@/constants/categories';
import { buildAssetBalanceUpdates } from '@/services/asset/asset.service';
import { Asset } from '@/types/domain/asset';

const createAssetFixture = (overrides: Partial<Asset>): Asset => {
  return {
    category: CATEGORY_TYPES.CASH,
    color: null,
    createdAt: null,
    currentBalance: 1000,
    iconName: null,
    id: 'asset-1',
    name: '입출금',
    updatedAt: null,
    userId: null,
    ...overrides,
  };
};

describe('buildAssetBalanceUpdates', () => {
  it('포맷된 문자열 금액을 숫자로 변환한다', () => {
    const updates = buildAssetBalanceUpdates({
      assets: [createAssetFixture({ currentBalance: 1000 })],
      editingAmounts: {
        'asset-1': '1,234',
      },
    });

    expect(updates).toEqual([
      {
        currentBalance: 1234,
        id: 'asset-1',
      },
    ]);
  });

  it('기존 값과 동일하면 업데이트 목록에서 제외한다', () => {
    const updates = buildAssetBalanceUpdates({
      assets: [createAssetFixture({ currentBalance: 1234 })],
      editingAmounts: {
        'asset-1': '1,234',
      },
    });

    expect(updates).toEqual([]);
  });

  it('빈 문자열은 null로 변환한다', () => {
    const updates = buildAssetBalanceUpdates({
      assets: [createAssetFixture({ currentBalance: 500 })],
      editingAmounts: {
        'asset-1': '',
      },
    });

    expect(updates).toEqual([
      {
        currentBalance: null,
        id: 'asset-1',
      },
    ]);
  });

  it('음수 문자열이 들어오면 에러를 던진다', () => {
    expect(() => {
      buildAssetBalanceUpdates({
        assets: [createAssetFixture({ currentBalance: 500 })],
        editingAmounts: {
          'asset-1': '-500',
        },
      });
    }).toThrow('유효하지 않은 자산 금액이 있습니다.');
  });
});
