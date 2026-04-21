export type RuntimeConfig = {
  pleasanterApiBasePath: string;
  apiKey: string;
  generatedAt: string;
};

export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  const response = await fetch("/runtime-config.json", {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Runtime config could not be loaded: ${response.status}`);
  }

  return response.json() as Promise<RuntimeConfig>;
}
