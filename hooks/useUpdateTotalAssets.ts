import { updateTotalAssets } from '@/services/asset/asset.service';
import { Asset } from '@/types/domain/asset';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UpdateTotalAssetsParams {
  assets: Asset[];
  targetTotalAssets: number;
}

export const useUpdateTotalAssets = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateTotalAssetsParams>({
    mutationFn: updateTotalAssets,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
};

