import { useQuery } from '@tanstack/react-query';
import { assetRepository } from '@/repositories/asset.repository';
import { Asset } from '@/types/domain/asset';
import { useAuthUserId } from '@/hooks/useAuthUserId';
import { isNotNil } from '@/utils/validators';

export const useAssets = () => {
  const { data: userId } = useAuthUserId();

  return useQuery<Asset[], Error>({
    queryKey: ['assets', userId],
    queryFn: () => assetRepository.getAssets(),
    enabled: isNotNil(userId),
  });
};
