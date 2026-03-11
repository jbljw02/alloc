import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveAllocations } from '@/services/allocation/allocation.service';

export const useSaveAllocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveAllocations,
    onSuccess: () => {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['assets'] }),
        queryClient.invalidateQueries({ queryKey: ['allocations'] }),
      ]);
    },
  });
};
