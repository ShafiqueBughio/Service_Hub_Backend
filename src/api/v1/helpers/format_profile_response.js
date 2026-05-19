/** @format */

const normalizeFileUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const base = (process.env.S3_ACCESS_URL || process.env.BACKEND_PUBLIC_URL || "")
    .replace(/\/$/, "");
  if (base && url.startsWith("/")) {
    return `${base}${url}`;
  }
  return url;
};

const formatUserDetails = (user_details) => {
  if (!user_details) return null;

  return {
    id: user_details.id,
    first_name: user_details.first_name,
    last_name: user_details.last_name,
    full_name: [user_details.first_name, user_details.last_name]
      .filter(Boolean)
      .join(" "),
    address: user_details.address,
    city: user_details.city,
    state: user_details.state,
    contact_phone: user_details.contact_phone,
    contact_email: user_details.contact_email,
    gender: user_details.gender,
    profile_picture: normalizeFileUrl(user_details.profile_picture),
    location: user_details.location,
    latitude: user_details.latitude,
    longitude: user_details.longitude,
  };
};

const formatContractorProfile = (contractor_profile) => {
  if (!contractor_profile) return null;

  const documents = contractor_profile.contractor_documents || [];
  const businessLicense = documents.find(
    (d) => d.document_type === "BUSINESS_LICENSE"
  );
  const certifications = documents
    .filter((d) => d.document_type === "CERTIFICATION")
    .map((d) => ({
      id: d.id,
      document_url: normalizeFileUrl(d.document_url),
    }));

  return {
    id: contractor_profile.id,
    about: contractor_profile.about,
    services: (contractor_profile.contractor_services || [])
      .map((s) => s.service_name)
      .filter(Boolean),
    experiences: (contractor_profile.contractor_experiences || []).map((exp) => ({
      id: exp.id,
      company: exp.company,
      job_type: exp.job_type,
      designation: exp.designation,
      start_year: exp.start_year,
      end_year: exp.end_year,
    })),
    service_areas: (contractor_profile.contractor_service_areas || []).map(
      (area) => ({
        id: area.id,
        location: area.location,
        latitude: area.latitude,
        longitude: area.longitude,
      })
    ),
    business_license: businessLicense
      ? {
          id: businessLicense.id,
          document_url: normalizeFileUrl(businessLicense.document_url),
        }
      : null,
    certifications,
    portfolio_images: (contractor_profile.contractor_portfolios || []).map(
      (img) => ({
        id: img.id,
        image_url: normalizeFileUrl(img.image_url),
      })
    ),
  };
};

const formatCreateProfileResponse = (db_user) => {
  let userDetails = formatUserDetails(db_user.user_details);

  // Contractor fields nested inside userDetails (no separate object)
  if (db_user.user_type === "CONTRACTOR" && db_user.contractor_profile) {
    const contractor = formatContractorProfile(db_user.contractor_profile);
    userDetails = {
      ...userDetails,
      contractor_profile_id: contractor.id,
      about: contractor.about,
      services: contractor.services,
      experiences: contractor.experiences,
      service_areas: contractor.service_areas,
      business_license: contractor.business_license,
      certifications: contractor.certifications,
      portfolio_images: contractor.portfolio_images,
    };
  }

  return {
    user: {
      id: db_user.id,
      email: db_user.email,
      phone: db_user.phone,
      user_type: db_user.user_type,
      is_completed: db_user.is_completed,
      is_email_verified: db_user.is_email_verified,
      is_phone_verified: db_user.is_phone_verified,
    },
    userDetails,
  };
};

module.exports = {
  formatCreateProfileResponse,
  formatUserDetails,
  formatContractorProfile,
  normalizeFileUrl,
};
