import { describe, it, expect, vi, beforeEach } from 'vitest';
/**
 * Unit tests — upload.service.ts
 */
import { uploadImage } from "@/backend/services/upload.service";

describe("uploadImage", () => {
  beforeEach(() => {
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;
  });

  it("returns placeholder URL when Cloudinary is not configured", async () => {
    const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
    const url = await uploadImage(file);
    expect(url).toContain("placehold.co");
    expect(url).toContain("WACE");
  });

  it("calls Cloudinary API when credentials are set", async () => {
    process.env.CLOUDINARY_CLOUD_NAME = "my-cloud";
    process.env.CLOUDINARY_API_KEY = "key123";
    process.env.CLOUDINARY_API_SECRET = "secret123";

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ secure_url: "https://res.cloudinary.com/my-cloud/image/upload/v1/wace/test.jpg" }),
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    const file = new File(["image data"], "photo.jpg", { type: "image/jpeg" });
    const url = await uploadImage(file);

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.cloudinary.com/v1_1/my-cloud/image/upload",
      expect.objectContaining({ method: "POST" })
    );
    expect(url).toBe("https://res.cloudinary.com/my-cloud/image/upload/v1/wace/test.jpg");
  });

  it("throws when Cloudinary returns an error response", async () => {
    process.env.CLOUDINARY_CLOUD_NAME = "cloud";
    process.env.CLOUDINARY_API_KEY = "key";
    process.env.CLOUDINARY_API_SECRET = "secret";

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: async () => "Invalid signature",
    }) as unknown as typeof fetch;

    const file = new File(["data"], "bad.jpg", { type: "image/jpeg" });
    await expect(uploadImage(file)).rejects.toThrow("Cloudinary upload failed: Invalid signature");
  });

  it("includes folder and signature in the request body", async () => {
    process.env.CLOUDINARY_CLOUD_NAME = "cloud";
    process.env.CLOUDINARY_API_KEY = "mykey";
    process.env.CLOUDINARY_API_SECRET = "mysecret";

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ secure_url: "https://res.cloudinary.com/cloud/img/test.jpg" }),
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    const file = new File(["img"], "photo.png", { type: "image/png" });
    await uploadImage(file);

    const formData: FormData = mockFetch.mock.calls[0][1].body;
    expect(formData.get("folder")).toBe("wace");
    expect(formData.get("api_key")).toBe("mykey");
    expect(formData.get("signature")).toBeDefined();
    expect(formData.get("timestamp")).toBeDefined();
  });
});
