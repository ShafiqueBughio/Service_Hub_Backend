/** @format */

const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3 = require("@configs/s3");
const { logger } = require("@configs/logger");

const generate_presigned_url = async ({ file_name, file_type, folder = "uploads", expires_in = 3600 }) => {
  // Check if S3 is configured
  if (!s3) {
    throw new Error("S3 is not configured. Please set ACCESS_KEY_ID, SECRET_ACCESS_KEY, and BUCKET_REGION in .env file");
  }

  if (!process.env.BUCKET_NAME) {
    throw new Error("BUCKET_NAME is not set in .env file");
  }

  if (!file_name || !file_type) {
    throw new Error("file_name and file_type are required");
  }

  // Generate unique file name with timestamp
  const timestamp = Date.now();
  const sanitizedFileName = file_name.replace(/\s+/g, "_");
  const key = `${folder}/${timestamp}_${sanitizedFileName}`;

  try {
    // Generate presigned URL for PUT (upload)
    const putCommand = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: key,
      ContentType: file_type,
    });

    const upload_url = await getSignedUrl(s3, putCommand, { expiresIn: expires_in });

    // Generate presigned URL for GET (download/view) - optional
    const getCommand = new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: key,
    });

    const view_url = await getSignedUrl(s3, getCommand, { expiresIn: expires_in });

    return {
      upload_url,
      view_url,
      file_key: key,
      file_name: sanitizedFileName,
      expires_in: expires_in,
    };
  } catch (error) {
    logger.error("Error generating presigned URL:", error);
    throw error;
  }
};

module.exports = generate_presigned_url;
