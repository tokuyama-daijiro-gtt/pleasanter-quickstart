import type { RuntimeConfig } from "./runtime-config";

export type PleasanterItem = {
  ResultId?: number;
  SiteId?: number;
  Title?: string;
  Body?: string;
  Status?: number | string;
  UpdatedTime?: string;
  CreatedTime?: string;
  ClassHash?: Record<string, string | number | null>;
  NumHash?: Record<string, number | null>;
  DateHash?: Record<string, string | null>;
  DescriptionHash?: Record<string, string | null>;
  CheckHash?: Record<string, boolean | null>;
  [key: string]: unknown;
};

export type GetItemsResponse = {
  StatusCode?: number;
  Message?: string;
  Response?: {
    Offset?: number;
    PageSize?: number;
    TotalCount?: number;
    Data?: PleasanterItem[];
  };
};

export type UpsertPayload = {
  Title: string;
  Body?: string;
  Keys?: string[];
  ClassHash?: Record<string, string>;
  DescriptionHash?: Record<string, string>;
};

export type UpsertResponse = {
  Id?: number;
  StatusCode?: number;
  LimitPerDate?: number;
  LimitRemaining?: number;
  Message?: string;
};

export type CustomApiResult = {
  status: number;
  body: unknown;
};

type PleasanterRequestBody = Record<string, unknown>;

function normalizeBasePath(basePath: string) {
  return basePath.replace(/\/$/, "");
}

async function postJson<T>(
  config: RuntimeConfig,
  path: string,
  body: PleasanterRequestBody
): Promise<T> {
  const basePath = normalizeBasePath(config.pleasanterApiBasePath);
  const response = await fetch(`${basePath}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      ApiVersion: 1.1,
      ApiKey: config.apiKey,
      ...body
    })
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const message =
      typeof data === "object" && data && "Message" in data
        ? String(data.Message)
        : response.statusText;
    throw new Error(`Pleasanter API failed: ${response.status} ${message}`);
  }

  return data as T;
}

export function getItems(
  config: RuntimeConfig,
  siteId: string,
  queryText: string
) {
  const view = queryText
    ? {
        ColumnFilterHash: {
          Title: queryText
        },
        ColumnFilterSearchTypes: {
          Title: "PartialMatch"
        }
      }
    : undefined;

  return postJson<GetItemsResponse>(config, `/api/items/${siteId}/get`, {
    ...(view ? { View: view } : {})
  });
}

export function upsertItem(
  config: RuntimeConfig,
  siteId: string,
  payload: UpsertPayload
) {
  return postJson<UpsertResponse>(
    config,
    `/api/items/${siteId}/upsert`,
    payload
  );
}

export async function postCustomApi(
  config: RuntimeConfig,
  path: string,
  body: PleasanterRequestBody
): Promise<CustomApiResult> {
  const basePath = normalizeBasePath(config.pleasanterApiBasePath);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const response = await fetch(`${basePath}${normalizedPath}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      ApiVersion: 1.1,
      ApiKey: config.apiKey,
      ...body
    })
  });

  const text = await response.text();
  return {
    status: response.status,
    body: text ? JSON.parse(text) : null
  };
}
