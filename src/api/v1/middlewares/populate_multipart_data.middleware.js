/** @format */

const Responses = require("@constants/responses");
const multer = require("multer");
const responses = new Responses();

const storage = multer.memoryStorage();
const limits = { fileSize: 10 * 1024 * 1024 };
const fields = [
  { name: "profile_picture", maxCount: 1 },
  { name: "help_and_feedback_images", maxCount: 10 },
  { name: "community_image", maxCount: 1 },
  { name: "id_front", maxCount: 1 },
  { name: "id_back", maxCount: 1 },
  { name: "post_image", maxCount: 1 },
  { name: "attachment", maxCount: 10 },
];

const handle_multer_error = (err) => {
  if (err && err instanceof multer.MulterError) {
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return "Unable to upload image. Make sure that only allowed key name is used and only one file is uploaded at a time.";
    }
    if (err.code === "LIMIT_FILE_SIZE") {
      return "Unable to upload image. Max file size limit is 10MB.";
    }
  } else if (err) {
    return err.message;
  }
};

const handle_multipart_data = (required_fields = []) => {
  return (req, res, next) => {
    const upload = multer({ storage, limits }).fields(fields);

    upload(req, res, (err) => {
      const error = handle_multer_error(err);
      if (error) {
        const response = responses.bad_request_response(error);
        return res.status(response.status.code).json(response);
      }

      if (Array.isArray(required_fields) && required_fields.length > 0) {
        const uploadedKeys = Object.keys(req.files || {});
        const missingFields = required_fields.filter(
          (field) => !uploadedKeys.includes(field)
        );
        if (missingFields.length > 0) {
          const response = responses.bad_request_response(
            `${missingFields.join(", ")} ${
              missingFields.length > 1 ? "are" : "is"
            } required`
          );
          return res.status(response.status.code).json(response);
        }
      }

      next();
    });
  };
};

module.exports = handle_multipart_data;
