const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const env = require("../config/env");

let s3Client = null;

if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY && env.AWS_REGION && env.AWS_BUCKET_NAME) {
  s3Client = new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      sessionToken: env.AWS_SESSION_TOKEN,
    },
  });
}

const uploadToS3 = async (buffer, fileName, contentType = "application/pdf") => {
  if (!s3Client) {
    throw new Error("AWS S3 is not configured.");
  }

  const params = {
    Bucket: env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: buffer,
    ContentType: contentType,
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);

  
  return "https://" + env.AWS_BUCKET_NAME + ".s3." + env.AWS_REGION + ".amazonaws.com/" + fileName;
};

module.exports = {
  s3Client,
  uploadToS3,
};
