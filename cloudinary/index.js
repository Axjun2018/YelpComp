// include installed packages
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// config cloudinary with .env veriables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

// configure cloudinary instances
const storage = new CloudinaryStorage({
    cloudinary, 
    params:{ // need use params to store all files to one folder, without it, files will be stored in root folder of cloudinary
        folder: 'YelpCamp', // create folder name in cloudinary
        allowedFormats: ['jpeg', 'png', 'jpg']
    }

})

// exports 2 configs
module.exports = {
    cloudinary,
    storage
}