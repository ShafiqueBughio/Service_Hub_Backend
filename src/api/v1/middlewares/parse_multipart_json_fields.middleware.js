/** @format */

const JSON_ARRAY_FIELDS = [
  "services",
  "experiences",
  "service_areas",
  "certifications",
  "portfolio_images",
];

/** Parse JSON-stringified array fields sent via multipart/form-data */
const parse_multipart_json_fields = (req, res, next) => {
  if (!req.body) return next();

  JSON_ARRAY_FIELDS.forEach((field) => {
    const value = req.body[field];
    if (typeof value === "string") {
      try {
        req.body[field] = JSON.parse(value);
      } catch {
        // keep original value if not valid JSON
      }
    }
  });

  next();
};

module.exports = parse_multipart_json_fields;
