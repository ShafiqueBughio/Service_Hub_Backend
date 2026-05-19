/** @format */

const upload_file_to_s3 = require("@v1_helpers/upload_files_to_s3");

const process_files = async (files, date) => {
  const upload_promises = files.map((file) => upload_file_to_s3(file, date));
  return Promise.all(upload_promises);
};

const getPublicFileUrl = (response) => {
  if (response.is_local) {
    const base =
      process.env.BACKEND_PUBLIC_URL ||
      `http://localhost:${process.env.PORT || 8000}`;
    return `${base.replace(/\/$/, "")}/uploads${response.public_id}`;
  }

  const s3Base = (process.env.S3_ACCESS_URL || "").replace(/\/$/, "");
  return `${s3Base}${response.public_id}`;
};

const extract_urls_and_field_name = (responses) => {
  const media = {};
  responses.map((response) => {
    const fieldname = response.public_id.split("/")[1];
    const fileMeta = {
      path: getPublicFileUrl(response),
      content_type: response.content_type,
    };

    if (!media[fieldname]) {
      media[fieldname] = [fileMeta];
    } else {
      media[fieldname].push(fileMeta);
    }
  });
  return media;
};

const upload_media = async (req, res, next) => {
  if (!req?.files) {
    return next(); // No files to process, just move to the next middleware
  }

  const files = Object.values(req.files);
  const date = Date.now();

  try {
    const responses = await Promise.all(
      files.map((file_s) => process_files(file_s, date))
    );

    // Flatten the responses array
    const flattened_responses = [].concat(...responses);
    const media = extract_urls_and_field_name(flattened_responses);

    req.media = media;
  } catch (error) {
    return next(error); // Handle errors from uploading
  }

  next();
};

module.exports = upload_media;
