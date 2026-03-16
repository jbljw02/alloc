import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveAllocations, SaveAllocationItem } from '@/services/allocation/allocation.service';
import { Allocation } from '@/types/domain/allocation';

interface SaveAllocationMutationParams {
  allocationMonth: string;
  existingAllocations: Allocation[];
  items: SaveAllocationItem[];
}

export const useSaveAllocation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, SaveAllocationMutationParams>({
    mutationFn: saveAllocations,
    onSuccess: () => {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['assets'] }),
        queryClient.invalidateQueries({ queryKey: ['allocations'] }),
        queryClient.invalidateQueries({ queryKey: ['assetSnapshots'] }),
      ]);
    },
  });
};
