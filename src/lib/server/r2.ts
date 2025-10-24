import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

export function createR2Client(
	accountId: string,
	accessKeyId: string,
	secretAccessKey: string
): S3Client {
	return new S3Client({
		region: 'auto',
		endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
		credentials: {
			accessKeyId,
			secretAccessKey,
		},
	});
}

export async function generateUploadUrl(
	r2Client: S3Client,
	bucketName: string,
	fileExtension: string
): Promise<{ key: string; uploadUrl: string }> {
	const key = `${uuidv4()}.${fileExtension}`;

	const command = new PutObjectCommand({
		Bucket: bucketName,
		Key: key,
	});

	const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 600 }); // 10 minutes

	return { key, uploadUrl };
}

export async function generateDownloadUrl(
	r2Client: S3Client,
	bucketName: string,
	key: string
): Promise<string> {
	const command = new GetObjectCommand({
		Bucket: bucketName,
		Key: key,
	});

	return getSignedUrl(r2Client, command, { expiresIn: 300 }); // 5 minutes
}

export async function deleteFile(
	r2Client: S3Client,
	bucketName: string,
	key: string
): Promise<void> {
	const command = new DeleteObjectCommand({
		Bucket: bucketName,
		Key: key,
	});

	await r2Client.send(command);
}

export function getFileExtension(filename: string): string {
	const parts = filename.split('.');
	return parts.length > 1 ? parts[parts.length - 1] : '';
}
