import crypto from "crypto";

/**
 * Uploads an image to Cloudinary using a **signed** request.
 * Signed uploads require CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and
 * CLOUDINARY_API_SECRET — no public upload preset needed, which prevents
 * unauthorised third-party uploads to our bucket.
 *
 * Falls back to a placeholder URL in mock/dev mode when credentials are absent.
 */
export async function uploadImage(file: File): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.log("[UPLOAD MOCK] Cloudinary is not configured. Returning placeholder URL.");
    return `https://placehold.co/600x400?text=WACE+Image`;
  }

  // Build signature
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = "wace";

  const signaturePayload = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto
    .createHash("sha256")
    .update(signaturePayload)
    .digest("hex");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("folder", folder);
  formData.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudinary upload failed: ${errorText}`);
  }

  const data = await response.json();
  return data.secure_url as string;
}
