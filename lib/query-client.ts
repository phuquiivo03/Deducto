import { QueryClient } from "@tanstack/react-query";
import { env } from "@/config/env";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: env.stateTimeSeconds * 1000,
      gcTime: env.gcTimeSeconds * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
