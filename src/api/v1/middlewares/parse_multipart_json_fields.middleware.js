/** @format */

const JSON_ARRAY_FIELDS = [
  "services",
  "experiences",
  "service_areas",
  "certifications",
  "portfolio_images",
  "attachments",
  "provider_preferences",
];

/** Parse JSON-stringified array and object fields sent via multipart/form-data */
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

  // location is a JSON object { loc, latitude, longitude }
  if (typeof req.body.location === "string") {
    try {
      req.body.location = JSON.parse(req.body.location);
    } catch {
      // keep as string if parse fails
    }
  }

  next();
};

module.exports = parse_multipart_json_fields;
