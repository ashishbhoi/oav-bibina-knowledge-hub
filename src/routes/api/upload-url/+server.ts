import { json, error } from "@sveltejs/kit";
import {
  createR2Client,
  generateUploadUrl,
  getFileExtension,
} from "$lib/server/r2";

export const POST = async ({ request, platform }: any) => {
  if (
    !platform?.env?.R2_ACCOUNT_ID ||
    !platform?.env?.R2_ACCESS_KEY_ID ||
    !platform?.env?.R2_SECRET_ACCESS_KEY
  ) {
    throw error(500, "R2 credentials not available");
  }

  try {
    const { fileName } = await request.json();

    if (!fileName) {
      throw error(400, "File name is required");
    }

    // Create R2 client
    const r2Client = createR2Client(
      platform.env.R2_ACCOUNT_ID,
      platform.env.R2_ACCESS_KEY_ID,
      platform.env.R2_SECRET_ACCESS_KEY
    );

    // Get file extension
    const fileExtension = getFileExtension(fileName);

    // Generate pre-signed upload URL
    const { key, uploadUrl } = await generateUploadUrl(
      r2Client,
      "oav-knowledge-hub-files",
      fileExtension
    );

    return json({
      success: true,
      uploadUrl,
      objectKey: key,
    });
  } catch (err) {
    console.error("Get upload URL error:", err);
    throw error(500, "Failed to generate upload URL");
  }
};
