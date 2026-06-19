import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthUserId } from '@/hooks/useAuthUserId';
import { saveAllocations, SaveAllocationItem } from '@/services/allocation/allocation.service';
import { Allocation } from '@/types/domain/allocation';
import { isNil } from '@/utils/validators';

interface SaveAllocationMutationParams {
  allocationMonth: string;
  existingAllocations: Allocation[];
  items: SaveAllocationItem[];
}

export const useSaveAllocation = () => {
  const queryClient = useQueryClient();
  const { data: userId } = useAuthUserId();

  return useMutation<void, Error, SaveAllocationMutationParams>({
    mutationFn: saveAllocations,
    onSuccess: () => {
      if (isNil(userId)) {
        return;
      }

      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['assets', userId] }),
        queryClient.invalidateQueries({ queryKey: ['allocations', userId] }),
      ]);
    },
  });
};
