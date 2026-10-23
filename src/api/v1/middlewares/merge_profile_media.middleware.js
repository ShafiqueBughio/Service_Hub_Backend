/** @format */

/**
 * Merges uploaded multipart media paths into req.body so Joi + services
 * can treat file uploads the same as URL strings.
 * Does not invent empty certifications/portfolio arrays when the client
 * did not send those fields (avoids wiping them on partial updates).
 */
const mergeProfileMediaIntoBody = (req, _res, next) => {
  const body = req.body || {};
  const media = req.media || {};

  const existingCerts = Array.isArray(body.certifications)
    ? body.certifications
    : typeof body.certifications === "string"
      ? [body.certifications]
      : [];
  const existingPortfolio = Array.isArray(body.portfolio_images)
    ? body.portfolio_images
    : typeof body.portfolio_images === "string"
      ? [body.portfolio_images]
      : [];

  const newCerts = (media.certifications ?? []).map((f) => f.path);
  const newPortfolio = (media.portfolio_images ?? []).map((f) => f.path);

  const hasCertInput =
    body.certifications !== undefined || newCerts.length > 0;
  const hasPortfolioInput =
    body.portfolio_images !== undefined || newPortfolio.length > 0;

  req.body = {
    ...body,
    ...(media.profile_picture?.[0]?.path
      ? { profile_picture: media.profile_picture[0].path }
      : {}),
    ...(media.business_license?.[0]?.path
      ? { business_license: media.business_license[0].path }
      : {}),
    ...(media.cnic_front?.[0]?.path
      ? { cnic_front: media.cnic_front[0].path }
      : {}),
    ...(media.cnic_back?.[0]?.path
      ? { cnic_back: media.cnic_back[0].path }
      : {}),
    ...(media.selfie?.[0]?.path ? { selfie: media.selfie[0].path } : {}),
    ...(hasCertInput
      ? { certifications: [...existingCerts, ...newCerts] }
      : {}),
    ...(hasPortfolioInput
      ? { portfolio_images: [...existingPortfolio, ...newPortfolio] }
      : {}),
  };

  next();
};

module.exports = mergeProfileMediaIntoBody;
