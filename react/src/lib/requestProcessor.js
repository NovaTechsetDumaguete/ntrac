import { useQuery, useMutation, useQueryClient } from 'react-query';

export function useRequestProcessor() {
  const queryClient = useQueryClient();

  function useQueryHelper(key, queryFunction, options = {}) {
    return useQuery({
      queryKey: key,
      queryFn: queryFunction,
      ...options,
    });
  }

  function useMutationHelper(key, mutationFunction, options = {}) {
    return useMutation({
      mutationKey: key,
      mutationFn: mutationFunction,
      onSettled: () => queryClient.invalidateQueries(key),
      ...options,
    });
  }

  return { useQueryHelper, useMutationHelper };
}
