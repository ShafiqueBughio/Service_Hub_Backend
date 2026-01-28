const { RekognitionClient } = require("@aws-sdk/client-rekognition");

const rekognitionClient = new RekognitionClient({
  region: "us-east-1", // Replace with your desired region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

module.exports = rekognitionClient;
