import type {RequestHandler} from "@sveltejs/kit";
import {error} from "@sveltejs/kit";
import {createR2Client} from "$lib/server/r2";
import {PutObjectCommand} from "@aws-sdk/client-s3";

export const POST: RequestHandler = async ({request, platform}) => {
    if (
        !platform?.env?.BUCKET ||
        !platform?.env?.R2_ACCOUNT_ID ||
        !platform?.env?.R2_ACCESS_KEY_ID ||
        !platform?.env?.R2_SECRET_ACCESS_KEY
    ) {
        throw error(500, "R2 storage not available");
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const key = formData.get("key") as string;

        if (!file || !key) {
            throw error(400, "File and key are required");
        }

        // Create R2 client
        const r2Client = createR2Client(
            platform.env.R2_ACCOUNT_ID,
            platform.env.R2_ACCESS_KEY_ID,
            platform.env.R2_SECRET_ACCESS_KEY
        );

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        // Upload to R2
        const command = new PutObjectCommand({
            Bucket: "oav-knowledge-hub-files",
            Key: key,
            Body: buffer,
            ContentType: file.type,
            ContentLength: buffer.length,
        });

        await r2Client.send(command);

        return new Response(
            JSON.stringify({
                success: true,
                message: "File uploaded successfully",
            }),
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    } catch (err) {
        console.error("Upload error:", err);
        throw error(500, "Failed to upload file");
    }
};
