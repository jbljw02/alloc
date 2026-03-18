import { assetRepository } from '@/repositories/asset.repository';
import { Asset } from '@/types/domain/asset';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UpdateAssetsItem {
  currentBalance: number | null;
  id: string;
}

interface UpdateAssetsParams {
  items: UpdateAssetsItem[];
}

const updateAssets = async ({ items }: UpdateAssetsParams): Promise<Asset[]> => {
  return assetRepository.bulkUpdateAssets(items);
};

export const useUpdateAssets = () => {
  const queryClient = useQueryClient();

  return useMutation<Asset[], Error, UpdateAssetsParams>({
    mutationFn: updateAssets,
    onSuccess: (updatedAssets) => {
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
    },
  });
};
