const AWS = require('aws-sdk');
const logger = require('../utils/logger');

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();

const S3_BUCKET = process.env.AWS_S3_BUCKET || 'sikars-media';

/**
 * Upload file to S3
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
    const result = await s3.upload(params).promise();
    logger.info(`File uploaded to S3: ${result.Location}`);
    return result.Location;
  } catch (error) {
    logger.error('S3 upload error:', error);
    throw new Error('Failed to upload file to storage');
  }
};

/**
 * Delete file from S3
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
    await s3.deleteObject(params).promise();
    logger.info(`File deleted from S3: ${key}`);
  } catch (error) {
    logger.error('S3 delete error:', error);
    throw new Error('Failed to delete file from storage');
  }
};

/**
 * Generate signed URL for private file access
 * @param {string} key - S3 object key
 * @param {number} expiresIn - URL expiration in seconds
 * @returns {string} Signed URL
 */
const getSignedUrl = (key, expiresIn = 3600) => {
  const params = {
    Bucket: S3_BUCKET,
    Key: key,
    Expires: expiresIn
  };

  return s3.getSignedUrl('getObject', params);
};

module.exports = {
  uploadFile,
  deleteFile,
  getSignedUrl,
  s3,
  S3_BUCKET
};
