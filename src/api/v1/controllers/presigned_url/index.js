/** @format */

const PresignedUrlService = require("@api/v1/services/presigned_url");
const Responses = require("@constants/responses");

const responses = new Responses();
const service = new PresignedUrlService();

class PresignedUrlController {
  generate_upload_url = async (req, res, next) => {
    try {
      const { file_name, file_type, folder, expires_in } = req.body;

      const data = await service.generate_upload_url({
        file_name,
        file_type,
        folder,
        expires_in,
      });

      const response = responses.ok_response(
        data,
        "Presigned URL generated successfully"
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  generate_multiple_upload_urls = async (req, res, next) => {
    try {
      const { files } = req.body;

      const data = await service.generate_multiple_upload_urls({ files });

      const response = responses.ok_response(
        { urls: data },
        "Presigned URLs generated successfully"
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = PresignedUrlController;
