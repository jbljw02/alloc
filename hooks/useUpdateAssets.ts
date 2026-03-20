import { assetRepository } from '@/repositories/asset.repository';
import { buildAssetBalanceUpdates } from '@/services/asset/asset.service';
import { Asset } from '@/types/domain/asset';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UpdateAssetsItem {
  asset: Asset;
  editingAmount: string;
}

interface UpdateAssetsParams {
  items: UpdateAssetsItem[];
}

const updateAssets = async ({ items }: UpdateAssetsParams): Promise<Asset[]> => {
  const updates = buildAssetBalanceUpdates({
    assets: items.map((item) => {
      return item.asset;
    }),
    editingAmounts: items.reduce<Record<string, string>>((nextEditingAmounts, item) => {
      return {
        ...nextEditingAmounts,
        [item.asset.id]: item.editingAmount,
      };
    }, {}),
  });

  if (updates.length === 0) {
    return [];
  }

  return assetRepository.bulkUpdateAssets(updates);
};

export const useUpdateAssets = () => {
  const queryClient = useQueryClient();

  return useMutation<Asset[], Error, UpdateAssetsParams>({
    mutationFn: updateAssets,
    onSuccess: (updatedAssets) => {
      if (updatedAssets.length === 0) {
        return;
      }

      queryClient.setQueryData<Asset[]>(['assets'], (prev) => {
        if (!prev) {
          return updatedAssets;
        }

        const updatedAssetMap = new Map(updatedAssets.map((asset) => {
          return [asset.id, asset];
        }));

        return prev.map((asset) => {
          return updatedAssetMap.get(asset.id) ?? asset;
        });
      });

      void queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
};
