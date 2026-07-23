const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createStorage = (folder) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `truckber/${folder}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
      transformation: [{ width: 800, crop: 'limit' }],
    },
  });

const uploadDriverDocs = multer({ storage: createStorage('drivers') });
const uploadTruckDocs = multer({ storage: createStorage('trucks') });
const uploadProofOfDelivery = multer({ storage: createStorage('deliveries') });
const uploadProfilePhoto = multer({ storage: createStorage('profiles') });

module.exports = {
  cloudinary,
  uploadDriverDocs,
  uploadTruckDocs,
  uploadProofOfDelivery,
  uploadProfilePhoto,
};
