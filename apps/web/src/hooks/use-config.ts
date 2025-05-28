import useSWR from "swr";

interface PublicConfig {
  siteUrl: string;
  // Add other config properties here as needed
}

export function useConfig() {
  const { data, error, isLoading } = useSWR<PublicConfig>("/api/config");

  return {
    config: data,
    isLoading,
    error: error as Error | undefined,
  };
}
