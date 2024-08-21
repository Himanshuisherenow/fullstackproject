// src/hooks/useDownloads.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { incrementAndGetTotalDownloads } from "@/http/api";
import store from "@/store";

export const useDownloads = () => {
  const queryClient = useQueryClient();
  const { totalDownloads, setTotalDownloads } = store.useDownloadStore();

  const { error, isLoading } = useQuery<{ totalDownloads: number }, Error>({
    queryKey: ["TotalDownloads"],
    queryFn: () => incrementAndGetTotalDownloads("placeholder"), // We'll use a placeholder ID for initial load
    onSuccess: (data) => {
      setTotalDownloads(data.totalDownloads);
    },
  });

  const incrementMutation = useMutation(incrementAndGetTotalDownloads, {
    onSuccess: (data) => {
      setTotalDownloads(data.totalDownloads);
      queryClient.setQueryData(["TotalDownloads"], data);
    },
  });

  const incrementDownload = (bookId: string) => {
    incrementMutation.mutate(bookId);
  };

  return {
    totalDownloads,
    error,
    isLoading,
    incrementDownload,
  };
};
