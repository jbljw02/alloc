import { CATEGORY_TYPES } from '@/constants/categories';
import { allocationRepository } from '@/repositories/allocation.repository';
import { assetRepository } from '@/repositories/asset.repository';
import { saveAllocations } from '@/services/allocation/allocation.service';
import { Allocation } from '@/types/domain/allocation';

jest.mock('@/repositories/allocation.repository', () => ({
  allocationRepository: {
    createAllocation: jest.fn(),
    deleteAllocation: jest.fn(),
    updateAllocation: jest.fn(),
  },
}));

jest.mock('@/repositories/asset.repository', () => ({
  assetRepository: {
    bulkUpdateBalance: jest.fn(),
    createAsset: jest.fn(),
  },
}));

const mockedAllocationRepository = allocationRepository as jest.Mocked<typeof allocationRepository>;
const mockedAssetRepository = assetRepository as jest.Mocked<typeof assetRepository>;

const createAllocationFixture = (overrides: Partial<Allocation>): Allocation => {
  return {
    allocationMonth: '2026-03-01',
    assetId: 'asset-1',
    createdAt: null,
    id: 'allocation-1',
    inputAmount: 100,
    updatedAt: null,
    userId: null,
    ...overrides,
  };
};

describe('saveAllocations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('같은 자산의 금액만 변경되면 차액만 잔액에 반영한다', async () => {
    const existingAllocations = [createAllocationFixture({ inputAmount: 100 })];

    await saveAllocations({
      allocationMonth: '2026-03',
      existingAllocations,
      items: [
        {
          amount: '130',
          assetId: 'asset-1',
          category: CATEGORY_TYPES.CASH,
          id: 'allocation-1',
          name: '입출금',
        },
      ],
    });

    expect(mockedAllocationRepository.updateAllocation).toHaveBeenCalledWith('allocation-1', {
      allocationMonth: '2026-03-01',
      assetId: 'asset-1',
      inputAmount: 130,
    });
    expect(mockedAssetRepository.bulkUpdateBalance).toHaveBeenCalledWith([
      {
        amount: 30,
        id: 'asset-1',
      },
    ]);
  });

  it('자산이 변경되면 이전 자산 차감과 새 자산 가산을 함께 반영한다', async () => {
    const existingAllocations = [createAllocationFixture({ assetId: 'asset-old', inputAmount: 100 })];

    await saveAllocations({
      allocationMonth: '2026-03',
      existingAllocations,
      items: [
        {
          amount: '100',
          assetId: 'asset-new',
          category: CATEGORY_TYPES.CASH,
          id: 'allocation-1',
          name: '입출금',
        },
      ],
    });

    expect(mockedAllocationRepository.updateAllocation).toHaveBeenCalledWith('allocation-1', {
      allocationMonth: '2026-03-01',
      assetId: 'asset-new',
      inputAmount: 100,
    });
    expect(mockedAssetRepository.bulkUpdateBalance).toHaveBeenCalledWith([
      {
        amount: -100,
        id: 'asset-old',
      },
      {
        amount: 100,
        id: 'asset-new',
      },
    ]);
  });

  it('신규 배분은 생성 후 해당 자산 잔액을 증가시킨다', async () => {
    await saveAllocations({
      allocationMonth: '2026-03',
      existingAllocations: [],
      items: [
        {
          amount: '250',
          assetId: 'asset-1',
          category: CATEGORY_TYPES.CASH,
          id: 'new-allocation',
          name: '입출금',
        },
      ],
    });

    expect(mockedAllocationRepository.createAllocation).toHaveBeenCalledWith({
      allocationMonth: '2026-03-01',
      assetId: 'asset-1',
      inputAmount: 250,
    });
    expect(mockedAssetRepository.bulkUpdateBalance).toHaveBeenCalledWith([
      {
        amount: 250,
        id: 'asset-1',
      },
    ]);
  });

  it('제거된 기존 배분은 삭제 후 기존 자산 잔액을 차감한다', async () => {
    const existingAllocations = [createAllocationFixture({ assetId: 'asset-1', inputAmount: 100 })];

    await saveAllocations({
      allocationMonth: '2026-03',
      existingAllocations,
      items: [],
    });

    expect(mockedAllocationRepository.deleteAllocation).toHaveBeenCalledWith('allocation-1');
    expect(mockedAssetRepository.bulkUpdateBalance).toHaveBeenCalledWith([
      {
        amount: -100,
        id: 'asset-1',
      },
    ]);
  });

  it('음수 문자열 금액이 들어오면 에러를 던진다', async () => {
    await expect(saveAllocations({
      allocationMonth: '2026-03',
      existingAllocations: [],
      items: [
        {
          amount: '-250',
          assetId: 'asset-1',
          category: CATEGORY_TYPES.CASH,
          id: 'new-allocation',
          name: '입출금',
        },
      ],
    })).rejects.toThrow('유효하지 않은 배분 금액이 있습니다.');
  });
});
