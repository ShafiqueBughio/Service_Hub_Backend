/** @format */

const { user_type } = require("@prisma/client");
const Joi = require("joi");

class UserSchema {
  register_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({
      identifier: Joi.string().max(100).required(),
      password: Joi.string()
        .pattern(/^(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .max(16)
        .required(),
      user_type: Joi.string()
        .valid(...Object.keys(user_type))
        .required(),
      fcm_token: Joi.string().optional(),
    }),
  });

  login_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({
      identifier: Joi.string().max(100).optional(),
      email: Joi.string().max(100).optional(),
      fcm_token: Joi.string(),
      password: Joi.string()
        .pattern(/^(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .max(16)
        .required(),
    }).or("identifier", "email"),
  });

  verify_otp_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({
      identifier: Joi.string().max(100).required(),
      otp: Joi.number().integer().min(0).max(999999).required(),
      fcm_token: Joi.string().optional(),
    }),
  });

  forget_password_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({
      identifier: Joi.string().max(100).required(),
    }),
  });

  reset_password_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({
      password: Joi.string()
        .pattern(/^(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .max(16)
        .required(),
    }),
  });

  change_password_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({
      password: Joi.string()
        .pattern(/^(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .max(16)
        .required(),
      old_password: Joi.string()
        .pattern(/^(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .max(16)
        .required(),
    }),
  });

  resend_otp_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({
      identifier: Joi.string().max(100).required(),
    }),
  });

  social_login_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({
      token: Joi.string().required(),
      fcm_token: Joi.string(),
      user_type: Joi.string().valid("USER", "CONTRACTOR").required(),
      social_type: Joi.string().valid("GOOGLE", "APPLE").required(),
    }),
  });

  logout_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({
      refresh_token: Joi.string().optional(),
    }),
  });

  refresh_token_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({}),
  });

  get_all_users_schema = Joi.object({
    query: Joi.object({ user_name: Joi.string() }),
    params: Joi.object({}),
    body: Joi.object({}),
  });

  get_referral_schema = Joi.object({
    query: Joi.object({ user_name: Joi.string() }),
    params: Joi.object({}),
    body: Joi.object({}),
  });

  get_by_id_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({ userId: Joi.string().required() }),
    body: Joi.object({}),
  });

  edit_user_profile_picture_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({}),
  });

  get_about_of_self_user_schema = Joi.object({
    query: Joi.object({
      refresh_token: Joi.string().required(),
    }),
    params: Joi.object({}),
    body: Joi.object({}),
  });

  get_single_provider = Joi.object({
    query: Joi.object({}),
    params: Joi.object({
      provider_id: Joi.string().required(),
    }),
    body: Joi.object({}),
  });

  edit_user_profile_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      location: Joi.string().required(),
      date_of_birth: Joi.date().required(),
      latitude: Joi.string().required(),
      profile_picture: Joi.string().optional(),
      longitude: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      contact_email: Joi.string().email(),
      contact_phone: Joi.string().required(),
      gender: Joi.string().valid("MALE", "FEMALE", "OTHER"),
      address: Joi.string(),
    }),
  });

  create_user_profile_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      address: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      contact_phone: Joi.string().optional(),
      gender: Joi.string().valid("MALE", "FEMALE", "OTHER").required(),
      profile_picture: Joi.string().optional(),
    }),
  });

  create_contractor_profile_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({
      // User details (common)
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      address: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      contact_phone: Joi.string().required(),
      gender: Joi.string().valid("MALE", "FEMALE", "OTHER").required(),
      // Contractor specific
      profile_picture: Joi.string().optional(),
      about: Joi.string().optional(),
      services: Joi.array().items(Joi.string()).min(1).required(),
      experiences: Joi.array()
        .items(
          Joi.object({
            company: Joi.string(),
            job_type: Joi.string(),
            designation: Joi.string(),
            start_year: Joi.string(),
            end_year: Joi.string(),
          }),
        )
        .optional(),
      service_areas: Joi.array()
        .items(
          Joi.object({
            location: Joi.string(),
            latitude: Joi.string(),
            longitude: Joi.string(),
          }),
        )
        .optional(),
      business_license: Joi.string().optional(), // URL after upload
      certifications: Joi.array().items(Joi.string()).optional(), // URLs after upload
      portfolio_images: Joi.array().items(Joi.string()).optional(), // URLs after upload
    }),
  });

  update_profile_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({
      first_name: Joi.string(),
      last_name: Joi.string(),
      address: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      contact_phone: Joi.string(),
      gender: Joi.string().valid("MALE", "FEMALE", "OTHER"),
      // Contractor specific (optional)
      profile_picture: Joi.string(),
      about: Joi.string(),
      experiences: Joi.array().items(
        Joi.object({
          company: Joi.string(),
          job_type: Joi.string(),
          designation: Joi.string(),
          start_year: Joi.string(),
          end_year: Joi.string(),
        }),
      ),
      services: Joi.array().items(Joi.string()),
      service_areas: Joi.array().items(
        Joi.object({
          location: Joi.string(),
          latitude: Joi.string(),
          longitude: Joi.string(),
        }),
      ),
    }),
  });

  get_profile_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({}),
  });

  user_documnets_upload = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({}),
  });

  change_location = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({
      latitude: Joi.string().required(),
      longitude: Joi.string().required(),
    }),
  });

  update_fcm = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({
      refresh_token: Joi.string().required(),
      fcm_token: Joi.string().required(),
    }),
  });
}

module.exports = UserSchema;
