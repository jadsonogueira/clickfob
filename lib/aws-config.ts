import { S3Client } from "@aws-sdk/client-s3";

export function getBucketConfig() {
  const bucketName = process.env.AWS_BUCKET_NAME ?? "";
  const folderPrefix = process.env.AWS_FOLDER_PREFIX ?? "";

  if (!bucketName) {
    throw new Error("AWS_BUCKET_NAME is missing");
  }

  return {
    bucketName,
    folderPrefix
  };
}

export function createS3Client() {
  const region =
    process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;

  if (!region) {
    throw new Error("AWS_REGION is missing");
  }

  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  const credentials =
    accessKeyId && secretAccessKey
      ? { accessKeyId, secretAccessKey }
      : undefined;

  return new S3Client({
    region,
    credentials
  });
}
