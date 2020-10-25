//---------->you are here : vinted/models/offer
//pictures treatment

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//***Publish a picture
const imagePublish = async (imagePath, folder, imageId) => {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder,
      public_id: imageId,
    });
    return result;
  } catch (error) {
    throw error; //shit happens
  }
};

//***Delete a picture
const imageDelete = async (public_id) => {
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    return result;
  } catch (error) {
    throw error; //***shit happens
  }
};

//***Delete a folder
const imageFolderDelete = async (folderPath) => {
  try {
    const result = await cloudinary.api.delete_folder(folderPath);
    return result;
  } catch (error) {
    throw error; //***shit happens
  }
};

module.exports = { imagePublish, imageDelete, imageFolderDelete };
