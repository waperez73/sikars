const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const logger = require('../utils/logger');

// Configure AWS S3 Client (SDK v3)
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const S3_BUCKET = process.env.AWS_S3_BUCKET || 'sikars-media';

/**
 * Upload file to S3 (AWS SDK v3)
 * @param {Buffer} fileBuffer - File data
 * @param {string} fileName - File name
 * @param {string} contentType - MIME type
 * @param {string} folder - S3 folder path
 * @returns {Promise<string>} File URL
 */
const uploadFile = async (fileBuffer, fileName, contentType, folder = '') => {
  const key = folder ? `${folder}/${fileName}` : fileName;
  
  const params = {
    Bucket: S3_BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
    ACL: 'public-read'
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    
    // Construct the URL
    const url = `https://${S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
    
    logger.info(`File uploaded to S3: ${url}`);
    return url;
  } catch (error) {
    logger.error('S3 upload error:', error);
    throw new Error('Failed to upload file to storage');
  }
};

/**
 * Delete file from S3 (AWS SDK v3)
 * @param {string} fileUrl - Full S3 URL
 * @returns {Promise<void>}
 */
const deleteFile = async (fileUrl) => {
  // Extract key from URL
  const key = fileUrl.split('.com/')[1];
  
  const params = {
    Bucket: S3_BUCKET,
    Key: key
  };

  try {
    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
    
    logger.info(`File deleted from S3: ${key}`);
  } catch (error) {
    logger.error('S3 delete error:', error);
    throw new Error('Failed to delete file from storage');
  }
};

/**
 * Generate signed URL for private file access (AWS SDK v3)
 * @param {string} key - S3 object key
 * @param {number} expiresIn - URL expiration in seconds
 * @returns {Promise<string>} Signed URL
 */
const getSignedUrl = async (key, expiresIn = 3600) => {
  const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
  const { GetObjectCommand } = require('@aws-sdk/client-s3');
  
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: key
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    logger.error('S3 signed URL error:', error);
    throw new Error('Failed to generate signed URL');
  }
};

module.exports = {
  uploadFile,
  deleteFile,
  getSignedUrl,
  s3Client,
  S3_BUCKET
};
