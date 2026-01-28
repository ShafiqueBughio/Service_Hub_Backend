/** @format */

const generate_presigned_url = require("@v1_helpers/generate_presigned_url");
const Responses = require("@constants/responses");

const responses = new Responses();

class PresignedUrlService {
  generate_upload_url = async ({ file_name, file_type, folder, expires_in }) => {
    try {
      const result = await generate_presigned_url({
        file_name,
        file_type,
        folder: folder || "uploads",
        expires_in: expires_in || 3600, // Default 1 hour
      });

      return result;
    } catch (error) {
      throw responses.server_error_response(error.message);
    }
  };

  generate_multiple_upload_urls = async ({ files }) => {
    try {
      const upload_promises = files.map((file) =>
        generate_presigned_url({
          file_name: file.file_name,
          file_type: file.file_type,
          folder: file.folder || "uploads",
          expires_in: file.expires_in || 3600,
        })
      );

      const results = await Promise.all(upload_promises);
      return results;
    } catch (error) {
      throw responses.server_error_response(error.message);
    }
  };
}

module.exports = PresignedUrlService;
