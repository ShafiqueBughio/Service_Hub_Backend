/** @format */

const { prisma } = require("@configs/prisma");
const UserServiceHelpers = require("@api/v1/helpers/user_service_helper");
const TokenService = require("@api/v1/services/token");
const Responses = require("@constants/responses");
const send_email = require("@configs/email");

const responses = new Responses();
const helper = new UserServiceHelpers();
const token_service = new TokenService(process.env.JWT_SECRET_KEY);

class UserService {
  #calculate_age = (dateOfBirth) => {
    const dob = new Date(dateOfBirth);
    if (isNaN(dob)) {
      throw new Error("Invalid date of birth");
    }

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const dayDiff = today.getDate() - dob.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age;
  };

  //Register User
  register_user = async ({ identifier, password, user_type, fcm_token }) => {
    const identifier_type = helper.validate_identifier(identifier);

    const already_user = await helper.get_already_user({
      identifier,
      identifier_type,
    });

    // If user already exists, reject registration
    if (already_user) {
      throw responses.bad_request_response(
        `An account with this ${identifier_type} already exists. Please login instead.`
      );
    }

    // Generate OTP first (before saving to DB)
    const otp = helper.generate_random_numeric_code({ length: 6 });
    console.log("Generated OTP:", otp, typeof otp); // debug
    const _exp = new Date(new Date().getTime() + 30 * 1000).toISOString(); // 30 seconds expiry


    // Hash password
    const hashed_password = await helper.hash_password({
      password,
      identifier,
    });

    // Store email lowercase
    const value = typeof identifier === "string" ? identifier.trim() : identifier;
    const normalized_identifier = identifier_type === "email" ? value.toLowerCase() : value;

    // Create user in DB only after email is sent successfully
    const data = {
      user_type,
      user_secrets: {
        create: {
          otp,
          otp_expiration: _exp,
          password: hashed_password,
        },
      },
      [identifier_type]: normalized_identifier,
    };

    const user = await prisma.users.create({
      data,
    });

      // Send OTP email
  if (identifier_type === "email") {
    try {
      await send_email({
        from: `Service Hub <${process.env.GMAIL_ACCOUNT_EMAIL}>`,
        to: normalized_identifier,
        subject: "Your OTP Code - Service Hub",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #333;">Verify Your Account</h2>
            <p style="color: #555;">
              Use the OTP below to verify your account. It expires in <strong>30 seconds</strong>.
            </p>

            <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4F46E5; text-align: center; padding: 16px 0;">
              ${otp}
            </div>

            <p style="color: #999; font-size: 12px;">
              If you did not request this, please ignore this email.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      // rollback user if email fails
      await prisma.users.delete({
        where: { id: user.id },
      });

      throw emailError;
    }
  }

    return {
      user
    };
    
  };

  //Login User – allow login after register even if OTP not verified yet
  login_user = async ({ identifier, password, fcm_token }) => {
    const identifier_type = helper.validate_identifier(identifier);
    const already_user = await helper.get_already_user({
      identifier,
      identifier_type,
    });

    if (!already_user) {
      throw responses.bad_request_response(
        `This email is not associated with any user`
      );
    }

    //matching password from bcrypt
    const match = await helper.match_password({
      password,
      identifier,
      hashed_password: already_user.user_secrets.password,
    });

    if (!match) {
      throw responses.bad_request_response(
        `Either email or password is incorrect`
      );
    }

    const { access_token, refresh_token } = await helper.create_user_session({
      user: already_user,
      fcm_token,
    });

    // Same user data as get profile (user_details, contractor_profile, etc.)
    const { db_user } = await this.get_user_profile({ id: already_user.id });

    return {
      access_token,
      refresh_token,
      is_profile_completed: already_user.is_completed,
      user: db_user,
    };
  };

  //Verify OTP
  verify_otp = async ({ otp, fcm_token, user }) => {
    // User is required (from access_token)
    if (!user) {
      throw responses.bad_request_response("Access token required.");
    }

    const already_user = await helper.get_already_user({
      find_user_obj: { id: user.id },
    });
    
    if (!already_user) {
      throw responses.bad_request_response("User not found.");
    }

    // Determine identifier type from user data
    let identifier_type;
    if (already_user.email) {
      identifier_type = "email";
    } else if (already_user.phone) {
      identifier_type = "phone";
    } else {
      throw responses.bad_request_response("User identifier not found.");
    }

    //matching otp and expiration time
    if (
      new Date(already_user.user_secrets.otp_expiration).getTime() >
        new Date().getTime() &&
      already_user.user_secrets.otp == otp
    ) {
      //data for updating user
      const data = {};
      data[`is_${identifier_type}_verified`] = true;
      await prisma.users.update({
        where: {
          id: already_user.id,
        },
        data,
      });
    } else {
      throw responses.bad_request_response("Invalid or Expired OTP.");
    }

    const { access_token, refresh_token } = await helper.create_user_session({
      user: already_user,
      fcm_token,
    });

    return {
      access_token,
      refresh_token,
      is_profile_completed: already_user.is_completed,
    };
  };

  //Forget Password
  forget_password = async ({ identifier }) => {
    const identifier_type = helper.validate_identifier(identifier);

    const already_user = await helper.get_already_user({
      identifier,
      identifier_type,
    });
    if (!already_user) {
      throw responses.not_found_response(
        "This email is not associated with any user."
      );
    }

    //updating user secrets
    const otp = helper.generate_random_numeric_code({
      length: 6,
    });
    const _exp = new Date(new Date().getTime() + 60 * 1000).toISOString();
    await helper.update_user_secret({
      _exp,
      otp,
      id: already_user.user_secrets.id,
    });

    // Generate access token for password reset flow
    const access_token = token_service.generate_access_token(
      already_user.id,
      already_user.user_type
    );

    return { otp, access_token };
  };

  //Reset Password (requires access_token from forget_password flow, OTP already verified)
  reset_password = async ({ user, password }) => {
    const already_user = await helper.get_already_user({
      find_user_obj: { id: user.id },
    });
    
    if (!already_user) {
      throw responses.not_found_response(
        "User not found."
      );
    }

    let identifier = already_user.email;
    if (!identifier) identifier = already_user.phone;

    // Reset password (OTP already verified in verify_otp step)
    const hashed_password = await helper.hash_password({
      password,
      identifier,
    });

    await helper.update_user_secret({
      password: hashed_password,
      id: already_user.user_secrets.id,
    });
  };

  //Change Password
  change_password = async ({ user, password, old_password }) => {
    const already_user = await helper.get_already_user({
      find_user_obj: { id: user.id },
    });
    if (!already_user) {
      throw responses.not_found_response(
        "This email is not associated with any user."
      );
    }

    let identifier = already_user.email;
    if (!identifier) already_user.phone;

    const match = await helper.match_password({
      password: old_password,
      identifier,
      hashed_password: already_user.user_secrets.password,
    });

    //matching password
    if (!match) {
      throw responses.bad_request_response("Old password is incorrect.");
    }

    const hashed_password = await helper.hash_password({
      password,
      identifier,
    });
    await helper.update_user_secret({
      password: hashed_password,
      id: already_user.user_secrets.id,
    });
  };

  create_documents = async ({ id_front, id_back, user_id }) => {
    const user = await helper.get_already_user({
      find_user_obj: {
        id: user_id,
      },
    });

    if (user.user_documents) {
      throw responses.conflict_response("Already submitted docu");
    }

    return await prisma.user_documents.create({
      data: {
        id_back,
        id_front,
        user_id,
      },
    });
  };

  //Resend OTP
  resend_otp = async ({ identifier }) => {
    const identifier_type = helper.validate_identifier(identifier);
    const already_user = await helper.get_already_user({
      identifier,
      identifier_type,
    });

    if (!already_user) {
      throw responses.not_found_response(
        "This email is not associated with any user."
      );
    }

    //update otp and expiration time
    const otp = helper.generate_random_numeric_code({
      length: 6,
    });
    const _exp = new Date(new Date().getTime() + 60 * 1000).toISOString();
    await helper.update_user_secret({
      otp,
      _exp,
      id: already_user.user_secrets.id,
    });

    return { otp };
  };

  //Social Login
  social_login = async ({ token, fcm_token, user_type, social_type }) => {
    const { email, profile_picture, user_name } =
      social_type == "GOOGLE"
        ? await helper.verify_google_token({ token })
        : await helper.verify_apple_token({ token });

    const already_user = await helper.get_already_user({
      find_user_obj: { email, is_email_verified: true },
    });

    if (already_user) {
      const { access_token, refresh_token } = await helper.create_user_session({
        fcm_token,
        user: already_user,
      });
      return {
        access_token,
        refresh_token,
        is_profile_completed: already_user.is_completed,
      };
    }

    //creating data for new user
    const data = {
      user_type,
      is_email_verified: true,
      social_account_token: token,
    };
    email && (data.email = email);
    profile_picture &&
      (data.user_details = {
        create: {
          profile_picture,
        },
      });
    const new_user = await prisma.users.create({
      data,
    });

    //creating session
    const { access_token, refresh_token } = await helper.create_user_session({
      fcm_token,
      user: new_user,
    });
    return {
      access_token,
      refresh_token,
      is_profile_completed: new_user.is_completed,
    };
  };

  //Delete User
  delete_user = async ({ user }) => {
    await prisma.users.delete({
      where: {
        id: user.id,
      },
    });
  };

  //Logout User
  logout_user = async ({ refresh_token }) => {
    const user_session = await prisma.user_sessions.deleteMany({
      where: {
        refresh_token,
      },
    });
    if (!user_session.count) {
      throw responses.bad_request_response("Invalid refresh token");
    }
  };

  //Refresh Access Token
  refresh_user = async ({ refresh_token }) => {
    const access_token = helper.refresh_access_token(refresh_token);
    if (!access_token) {
      throw responses.bad_request_response("Invalid refresh token.");
    }
    return { access_token };
  };

  //Get User Profile
  get_user_profile = async ({ id }) => {
    const db_user = await prisma.users.findFirst({
      where: {
        id,
      },
      include: {
        user_details: true,
        contractor_profile: {
          include: {
            contractor_experiences: true,
            contractor_documents: true,
            contractor_portfolios: true,
            contractor_services: true,
            contractor_service_areas: true,
          },
        },
      },
    });

    if (!db_user) {
      throw responses.not_found_response("User not Valid.");
    }
    return { db_user };
  };

  //Edit User Profile
  edit_profile = async ({ id, data }) => {
    const db_user = await helper.get_already_user({
      find_user_obj: { id },
    });
    if (!db_user.user_details) {
      throw responses.bad_request_response("Profile not found. Please create profile first.");
    }
    await prisma.$transaction(async (tx) => {
      // Extract file key from URL if full URL is provided
      let profile_picture = data.profile_picture;
      if (profile_picture && profile_picture.includes('?')) {
        // Extract file key from presigned URL
        try {
          const url = new URL(profile_picture);
          profile_picture = url.pathname.substring(1); // Remove leading slash
        } catch (e) {
          // If URL parsing fails, try to extract path manually
          const match = profile_picture.match(/\/uploads\/[^?]+/);
          if (match) {
            profile_picture = match[0].substring(1); // Remove leading slash
          }
        }
      }

      //updating user details - only update provided fields
      const userDetailsData = {};
      if (data.first_name !== undefined) userDetailsData.first_name = data.first_name;
      if (data.last_name !== undefined) userDetailsData.last_name = data.last_name;
      if (data.address !== undefined) userDetailsData.address = data.address;
      if (data.city !== undefined) userDetailsData.city = data.city;
      if (data.state !== undefined) userDetailsData.state = data.state;
      if (data.contact_phone !== undefined) userDetailsData.contact_phone = data.contact_phone;
      if (data.gender !== undefined) userDetailsData.gender = data.gender;
      if (data.profile_picture !== undefined) userDetailsData.profile_picture = profile_picture;

      if (Object.keys(userDetailsData).length > 0) {
        await helper.update_user_details({
          data: userDetailsData,
          id: db_user.user_details.id,
          tx,
        });
      }

      // If user is CONTRACTOR, update contractor profile
      if (db_user.user_type === "CONTRACTOR" && db_user.contractor_profile) {
        if (data.about !== undefined) {
          await tx.contractor_profile.update({
            where: { id: db_user.contractor_profile.id },
            data: { about: data.about },
          });
        }

        // Update experiences
        if (data.experiences) {
          await tx.contractor_experience.deleteMany({
            where: { contractor_profile_id: db_user.contractor_profile.id },
          });
          await tx.contractor_experience.createMany({
            data: data.experiences.map((exp) => ({
              contractor_profile_id: db_user.contractor_profile.id,
              company: exp.company,
              job_type: exp.job_type,
              designation: exp.designation,
              start_year: exp.start_year,
              end_year: exp.end_year,
            })),
          });
        }

        // Update services
        if (data.services) {
          await tx.contractor_services.deleteMany({
            where: { contractor_profile_id: db_user.contractor_profile.id },
          });
          await tx.contractor_services.createMany({
            data: data.services.map((service) => ({
              contractor_profile_id: db_user.contractor_profile.id,
              service_name: service,
            })),
          });
        }

        // Update service areas
        if (data.service_areas) {
          await tx.contractor_service_areas.deleteMany({
            where: { contractor_profile_id: db_user.contractor_profile.id },
          });
          await tx.contractor_service_areas.createMany({
            data: data.service_areas.map((area) => ({
              contractor_profile_id: db_user.contractor_profile.id,
              location: area.location,
              latitude: area.latitude,
              longitude: area.longitude,
            })),
          });
        }
      }
    });
  };

  //Update Profile Picture
  update_profile_picture = async ({ id, data }) => {
    const db_user = await helper.get_already_user({
      find_user_obj: { id },
    });
    if (!db_user.user_details.id) {
      throw responses.bad_request_response("Unable to update");
    }

    await helper.update_user_details({
      data,
      id: db_user.user_details.id,
    });
  };

  mark_profile_completed = async ({ id, tx }) => {
    await helper.mark_completed_user({ id, tx });
  };

  //Create User Profile
  create_profile = async ({ user, data }) => {
    if (user.is_completed) {
      throw responses.bad_request_response("Profile already created.");
    }
    await prisma.$transaction(async (tx) => {
      // Extract file key from URL if full URL is provided
      let profile_picture = data.profile_picture || null;
      if (profile_picture && profile_picture.includes('?')) {
        // Extract file key from presigned URL
        try {
          const url = new URL(profile_picture);
          profile_picture = url.pathname.substring(1); // Remove leading slash
        } catch (e) {
          // If URL parsing fails, try to extract path manually
          const match = profile_picture.match(/\/uploads\/[^?]+/);
          if (match) {
            profile_picture = match[0].substring(1); // Remove leading slash
          }
        }
      }

      // Common user details for both USER and CONTRACTOR
      const userDetailsData = {
        first_name: data.first_name,
        last_name: data.last_name,
        city: data.city,
        state: data.state,
        gender: data.gender,
        address: data.address,
        contact_phone: data.contact_phone,
        profile_picture: profile_picture,
        user_id: user.id,
      };

      await helper.create_user_details({
        data: userDetailsData,
        tx,
      });

      // If user is CONTRACTOR, create contractor profile
      if (user.user_type === "CONTRACTOR") {
        const contractorProfileData = {
          about: data.about,
          user_id: user.id,
          contractor_experiences: {
            create: data.experiences?.map((exp) => ({
              company: exp.company,
              job_type: exp.job_type,
              designation: exp.designation,
              start_year: exp.start_year,
              end_year: exp.end_year,
            })) || [],
          },
          contractor_documents: {
            create: [
              ...(data.business_license ? [{ document_type: "BUSINESS_LICENSE", document_url: data.business_license }] : []),
              ...(data.certifications?.map((cert) => ({
                document_type: "CERTIFICATION",
                document_url: cert,
              })) || []),
            ],
          },
          contractor_portfolios: {
            create: (data.portfolio_images || []).map((img) => ({
              image_url: img,
            })),
          },
          contractor_services: {
            create: (data.services || []).map((service) => ({
              service_name: service,
            })),
          },
          contractor_service_areas: {
            create: (data.service_areas || []).map((area) => ({
              location: area.location,
              latitude: area.latitude,
              longitude: area.longitude,
            })),
          },
        };

        await tx.contractor_profile.create({
          data: contractorProfileData,
        });
      }

      await this.mark_profile_completed({ id: user.id, tx });
    });

    // Return login-style response (access_token, refresh_token, is_profile_completed, user)
    const updated_user = await helper.get_already_user({
      find_user_obj: { id: user.id },
    });
    const { access_token, refresh_token } = await helper.create_user_session({
      user: updated_user,
      fcm_token: data.fcm_token || null,
    });
    const { db_user } = await this.get_user_profile({ id: user.id });
    return {
      access_token,
      refresh_token,
      is_profile_completed: true,
      user: db_user,
    };
  };

  //Get All Users
  get_all_user = async () => {
    const users = await prisma.users.findMany({
      include: {
        user_details: true,
      },
      where: {
        user_type: {
          not: "ADMIN",
        },
      },
    });
    return { users };
  };

  get_about = async ({ user, refresh_token }) => {
    console.log(user, refresh_token, " user, refresh_token");
    let query = `
    
    SELECT 
    
    u.id as user_id,
    u.email ,
    us.mute_notification as push_notification,
    ud.first_name,
    ud.last_name,
    ud.date_of_birth,
    ud.location,
    ud.latitude,
    ud.longitude,
    ud.contact_phone,
    ud.city,
    ud.state,
    ud.profile_picture,
    CAST(TIMESTAMPDIFF(YEAR, ud.date_of_birth, CURDATE()) AS FLOAT) AS age

    from users AS u
    JOIN user_details AS ud ON ud.user_id = u.id  
    JOIN user_sessions AS us ON us.user_id = u.id 
    WHERE 
    u.id = ?
    AND 
    us.refresh_token = ?
    `;

    const params = [user.id, refresh_token];

    return await prisma.$queryRawUnsafe(query, ...params);
  };

  get_referral = async ({ user_id }) => {
    const data = await prisma.referal_code.findFirst({
      where: {
        user_id,
      },
      select: {
        code: true,
      },
    });

    return { referral_code: data.code };
  };

  change_fcm = async ({ refresh_token, fcm_token }) => {
    return await prisma.user_sessions.updateMany({
      where: {
        refresh_token,
      },
      data: {
        fcm_token,
      },
    });
  };
}

module.exports = UserService;