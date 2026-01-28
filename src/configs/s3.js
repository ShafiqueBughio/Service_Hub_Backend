const { S3Client } = require("@aws-sdk/client-s3");

// Only initialize S3 if credentials are provided
let s3 = null;

if (process.env.ACCESS_KEY_ID && process.env.SECRET_ACCESS_KEY && process.env.BUCKET_REGION) {
  s3 = new S3Client({
    credentials: {
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
    },
    region: process.env.BUCKET_REGION,
  });
} else {
  console.warn("S3 configuration incomplete. S3 features will be disabled.");
  console.warn("Please set ACCESS_KEY_ID, SECRET_ACCESS_KEY, and BUCKET_REGION in .env file");
}

module.exports = s3;
