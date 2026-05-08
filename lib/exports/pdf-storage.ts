import { getServerSupabaseConfig } from "../supabase/config";
import { createServiceSupabaseClient } from "../supabase/server";

const PDF_EXPORT_BUCKET = "pdf_exports";

interface SignedUrlResponse {
  signedURL?: string;
  signedUrl?: string;
}

function normalizeSignedUrl(value: string) {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const config = getServerSupabaseConfig();

  return new URL(value, config.url.endsWith("/") ? config.url : `${config.url}/`).toString();
}

export async function uploadPrivatePdf(input: {
  storagePath: string;
  pdf: Buffer;
}) {
  const client = createServiceSupabaseClient();

  await client.request(`/storage/v1/object/${PDF_EXPORT_BUCKET}/${input.storagePath}`, {
    method: "POST",
    body: new Blob([new Uint8Array(input.pdf)], { type: "application/pdf" }),
    headers: {
      "content-type": "application/pdf",
      "x-upsert": "false",
    },
  });
}

export async function createPrivatePdfSignedUrl(input: {
  storagePath: string;
  expiresInSeconds: number;
}) {
  const client = createServiceSupabaseClient();
  const response = await client.request<SignedUrlResponse>(
    `/storage/v1/object/sign/${PDF_EXPORT_BUCKET}/${input.storagePath}`,
    {
      method: "POST",
      body: JSON.stringify({
        expiresIn: input.expiresInSeconds,
      }),
    },
  );
  const signedUrl = response.signedURL || response.signedUrl;

  if (!signedUrl) {
    throw new Error("Supabase did not return a signed URL.");
  }

  return normalizeSignedUrl(signedUrl);
}
