/** @format */

const fs = require("fs");
const path = require("path");

const UPLOAD_ROOT = path.join(__dirname, "../public/uploads");

const upload_file_local = async (file, date) => {
  const dir = path.join(UPLOAD_ROOT, file.fieldname);
  fs.mkdirSync(dir, { recursive: true });

  const safeName = String(file.originalname).replace(/\s+/g, "");
  const filename = `${date}${safeName}`;
  const filePath = path.join(dir, filename);

  fs.writeFileSync(filePath, file.buffer);

  return {
    public_id: `/${file.fieldname}/${filename}`,
    content_type: file.mimetype,
    is_local: true,
  };
};

module.exports = upload_file_local;
