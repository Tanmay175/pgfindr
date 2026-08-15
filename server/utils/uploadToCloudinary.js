const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");

// Uploads a single in-memory file buffer (from multer.memoryStorage()) to Cloudinary.
// Returns { url, publicId }.
function uploadBufferToCloudinary(buffer, folder, transformation) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, transformation },
      (err, result) => {
        if (err) return reject(err);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

async function deleteFromCloudinary(publicId) {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
}

module.exports = { uploadBufferToCloudinary, deleteFromCloudinary };
