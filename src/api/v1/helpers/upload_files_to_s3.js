/** @format */

const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("@configs/s3");
const { logger } = require("@configs/logger");

const upload_file_to_s3 = async (file, date) => {
  console.log(file.originalname, "originalname");
  
  // Check if S3 is configured
  if (!s3) {
    throw new Error("S3 is not configured. Please set ACCESS_KEY_ID, SECRET_ACCESS_KEY, and BUCKET_REGION in .env file");
  }

  if (!process.env.BUCKET_NAME) {
    throw new Error("BUCKET_NAME is not set in .env file");
  }

  const command = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
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
    };
  } catch (error) {
    logger.error("Error uploading image to S3.", error);
    throw error; // Rethrow to handle it in the calling function
  }
};

module.exports = upload_file_to_s3;
