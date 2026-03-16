import { assetSnapshotRepository } from '@/repositories/asset-snapshot.repository';
import { AssetSnapshot } from '@/types/domain/asset-snapshot';
import { useQuery } from '@tanstack/react-query';

export const useAssetSnapshots = (snapshotMonths: string[]) => {
  return useQuery<AssetSnapshot[], Error>({
    queryKey: ['assetSnapshots', ...snapshotMonths],
    queryFn: () => assetSnapshotRepository.getSnapshotsByMonths(snapshotMonths),
  });
};
