import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveAllocations } from '@/services/allocation/allocation.service';

export const useSaveAllocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveAllocations,
    onSuccess: () => {
      // 대시보드 및 자산 목록 관련 쿼리 무효화(자동 갱신 유도)
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
};
