import { allocationRepository } from '@/repositories/allocation.repository';
import { Allocation } from '@/types/domain/allocation';
import { useQuery } from '@tanstack/react-query';

export const useAllocations = () => {
  return useQuery<Allocation[], Error>({
    queryKey: ['allocations'],
    queryFn: () => allocationRepository.getAllocations(),
  });
};
