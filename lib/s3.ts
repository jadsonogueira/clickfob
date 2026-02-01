import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createS3Client, getBucketConfig } from "./aws-config";

const s3Client = createS3Client();

function normalizeMaybeAbsoluteUrl(value?: string | null) {
  if (!value) return "";
  const v = String(value).trim();

  // Se alguém salvou "/https://..." no banco por engano
  if (v.startsWith("/http://") || v.startsWith("/https://")) return v.slice(1);

  return v;
}

function isAbsoluteHttpUrl(value?: string | null) {
  if (!value) return false;
  const v = String(value).trim();
  return v.startsWith("http://") || v.startsWith("https://");
}

export async function generatePresignedUploadUrl(
  fileName: string,
  contentType: string,
  isPublic: boolean = false
): Promise<{ uploadUrl: string; cloud_storage_path: string }> {
  const { bucketName, folderPrefix } = getBucketConfig();

  const cloud_storage_path = isPublic
    ? `${folderPrefix}public/uploads/${Date.now()}-${fileName}`
    : `${folderPrefix}uploads/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: cloud_storage_path,
    ContentType: contentType,
    ContentDisposition: isPublic ? "attachment" : undefined,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  return { uploadUrl, cloud_storage_path };
}

export async function getFileUrl(
  cloud_storage_path: string,
  isPublic: boolean = false
): Promise<string> {
  const normalized = normalizeMaybeAbsoluteUrl(cloud_storage_path);

  // ✅ Cloudinary (ou qualquer URL absoluta) -> retorna como está
  if (isAbsoluteHttpUrl(normalized)) {
    return normalized;
  }

  // ✅ Se vier vazio, evita quebrar
  if (!normalized) return "";

  const { bucketName } = getBucketConfig();
  const region = process.env.AWS_REGION || "us-east-1";

  // Mantém comportamento atual
  if (isPublic) {
    return `https://${bucketName}.s3.${region}.amazonaws.com/${normalized.replace(/^\/+/, "")}`;
  }

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: normalized,
    ResponseContentDisposition: "attachment",
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function deleteFile(cloud_storage_path: string): Promise<void> {
  const normalized = normalizeMaybeAbsoluteUrl(cloud_storage_path);

  // ✅ Se for URL absoluta (Cloudinary), não tenta deletar do S3
  if (isAbsoluteHttpUrl(normalized)) return;

  if (!normalized) return;

  const { bucketName } = getBucketConfig();

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: normalized,
  });

  await s3Client.send(command);
}

export async function initiateMultipartUpload(
  fileName: string,
  isPublic: boolean = false
): Promise<{ uploadId: string; cloud_storage_path: string }> {
  const { bucketName, folderPrefix } = getBucketConfig();

  const cloud_storage_path = isPublic
    ? `${folderPrefix}public/uploads/${Date.now()}-${fileName}`
    : `${folderPrefix}uploads/${Date.now()}-${fileName}`;

  const command = new CreateMultipartUploadCommand({
    Bucket: bucketName,
    Key: cloud_storage_path,
    ContentDisposition: isPublic ? "attachment" : undefined,
  });

  const response = await s3Client.send(command);
  return { uploadId: response.UploadId ?? "", cloud_storage_path };
}

export async function getPresignedUrlForPart(
  cloud_storage_path: string,
  uploadId: string,
  partNumber: number
): Promise<string> {
  const { bucketName } = getBucketConfig();

  const command = new UploadPartCommand({
    Bucket: bucketName,
    Key: cloud_storage_path,
    UploadId: uploadId,
    PartNumber: partNumber,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function completeMultipartUpload(
  cloud_storage_path: string,
  uploadId: string,
  parts: { ETag: string; PartNumber: number }[]
): Promise<void> {
  const { bucketName } = getBucketConfig();

  const command = new CompleteMultipartUploadCommand({
    Bucket: bucketName,
    Key: cloud_storage_path,
    UploadId: uploadId,
    MultipartUpload: { Parts: parts },
  });

  await s3Client.send(command);
}
