type QueryValue = string | number | boolean;

export interface SupabaseRestClientOptions {
  url: string;
  apiKey: string;
  accessToken?: string;
}

export interface RestRequestOptions {
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
}

function buildUrl(baseUrl: string, path: string, query?: Record<string, QueryValue>) {
  const url = new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);

  Object.entries(query || {}).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  return url;
}

function buildPath(path: string, query?: Record<string, QueryValue>) {
  const searchParams = new URLSearchParams();

  Object.entries(query || {}).forEach(([key, value]) => {
    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();

  return queryString ? `${path}?${queryString}` : path;
}

export function eq(value: QueryValue) {
  return `eq.${String(value)}`;
}

export class SupabaseRestClient {
  private readonly url: string;
  private readonly apiKey: string;
  private readonly accessToken?: string;

  constructor(options: SupabaseRestClientOptions) {
    this.url = options.url;
    this.apiKey = options.apiKey;
    this.accessToken = options.accessToken;
  }

  private headers(extra?: HeadersInit) {
    return {
      apikey: this.apiKey,
      authorization: `Bearer ${this.accessToken || this.apiKey}`,
      "content-type": "application/json",
      ...extra,
    };
  }

  async request<T>(path: string, init: RequestInit = {}) {
    const response = await fetch(buildUrl(this.url, path), {
      ...init,
      headers: this.headers(init.headers),
    });

    if (!response.ok) {
      throw new Error(`Supabase request failed: ${response.status} ${response.statusText}`);
    }

    if (response.status === 204) {
      return null as T;
    }

    return (await response.json()) as T;
  }

  async select<T>(table: string, options: RestRequestOptions = {}) {
    return this.request<T[]>(buildPath(`/rest/v1/${table}`, options.query), {
      method: "GET",
      signal: options.signal,
      headers: {
        prefer: "return=representation",
      },
    });
  }

  async insert<T>(table: string, payload: unknown) {
    return this.request<T[]>(`/rest/v1/${table}`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        prefer: "return=representation",
      },
    });
  }

  async update<T>(table: string, query: Record<string, QueryValue>, payload: unknown) {
    return this.request<T[]>(buildPath(`/rest/v1/${table}`, query), {
      method: "PATCH",
      body: JSON.stringify(payload),
      headers: {
        prefer: "return=representation",
      },
    });
  }

  async upsert<T>(table: string, payload: unknown, onConflict?: string) {
    return this.request<T[]>(buildPath(`/rest/v1/${table}`, onConflict ? { on_conflict: onConflict } : undefined), {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        prefer: "resolution=merge-duplicates,return=representation",
      },
    });
  }
}
