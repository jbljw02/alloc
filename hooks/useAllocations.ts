import { allocationRepository } from '@/repositories/allocation.repository';
import { Allocation } from '@/types/domain/allocation';
import { useAuthUserId } from '@/hooks/useAuthUserId';
import { isNotNil } from '@/utils/validators';
import { useQuery } from '@tanstack/react-query';

export const useAllocations = () => {
  const { data: userId } = useAuthUserId();

  return useQuery<Allocation[], Error>({
    queryKey: ['allocations', userId],
    queryFn: () => allocationRepository.getAllocations(),
    enabled: isNotNil(userId),
  });
};
