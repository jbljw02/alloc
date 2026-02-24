import { useQuery } from '@tanstack/react-query';
import { assetRepository } from '@/repositories/asset.repository';
import { Asset } from '@/types/domain/asset';

export const useAssets = () => {
  return useQuery<Asset[], Error>({
    queryKey: ['assets'],
    queryFn: () => assetRepository.getAssets(),
  });
};
