
/* Identity Verification Helpers */

class IdentityVerificationHelper {
  // Normalize media URLs before storing them in the database
  store_media_path = (url) => {
    if (typeof url !== "string" || !url.trim()) {
      return null;
    }

    if (!url.includes("?")) {
      return url;
    }

    try {
      const parsed = new URL(url);
      return `${parsed.origin}${parsed.pathname}`;
    } catch {
      return url.split("?")[0];
    }
  };

  // Prepare and validate all required resubmission documents
  prepare_verification_documents = (data = {}) => {
    const documents = {
      cnic_front_url: this.store_media_path(data?.cnic_front),
      cnic_back_url: this.store_media_path(data?.cnic_back),
      selfie_url: this.store_media_path(data?.selfie),
    };

    const missing_fields = Object.entries(documents)
      .filter(([, value]) => !value)
      .map(([key]) => key);

    return {
      documents,
      missing_fields,
    };
  };
}

module.exports = IdentityVerificationHelper;
