/** @format */

const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("@configs/s3");
const { logger } = require("@configs/logger");
const upload_file_local = require("@v1_helpers/upload_file_local");

const isAwsCredentialError = (error) => {
  const code = error?.name || error?.Code;
  return (
    code === "InvalidAccessKeyId" ||
    code === "SignatureDoesNotMatch" ||
    code === "InvalidClientTokenId" ||
    code === "UnrecognizedClientException"
  );
};

const upload_file_to_s3 = async (file, date) => {
  const useLocalOnly = process.env.USE_LOCAL_UPLOAD === "true";

  if (useLocalOnly || !s3) {
    return upload_file_local(file, date);
  }

  if (!process.env.BUCKET_NAME) {
    logger.warn("BUCKET_NAME missing — using local upload");
    return upload_file_local(file, date);
  }

  const command = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME.trim(),
    Key: `${file.fieldname}/${date}${String(file.originalname).replace(
      /\s+/g,
      ""
    )}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  try {
    await s3.send(command);
    return {
      public_id: `/${file.fieldname}/${date}${String(file.originalname).replace(
        /\s+/g,
        ""
      )}`,
      content_type: file.mimetype,
      is_local: false,
    };
  } catch (error) {
    if (isAwsCredentialError(error)) {
      logger.warn(
        "S3 credentials invalid — falling back to local upload:",
        error.message
      );
      return upload_file_local(file, date);
    }

    logger.error("Error uploading image to S3.", error);
    throw error;
  }
};

module.exports = upload_file_to_s3;
