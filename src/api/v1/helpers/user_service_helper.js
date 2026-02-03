const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const TokenService = require("@v1_services/token");
const { prisma } = require("@configs/prisma");
const Responses = require("@constants/responses");

const token_service = new TokenService(process.env.JWT_SECRET_KEY);
const responses = new Responses();

class UserServiceHelpers {
  //Generate OTP

  generate_random_numeric_code = ({ length }) => {
    let otp = "";
    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10); // Generates a random digit (0-9)
    }
    return otp;
  };

  hash_password = async ({ password, identifier, salt_rounds = 10 }) => {
    return await bcrypt.hash(password + identifier, salt_rounds);
  };

  match_password = async ({ password, identifier, hashed_password }) => {
    return await bcrypt.compare(password + identifier, hashed_password);
  };

  //Facebook Login
  verify_facebook_token = async ({ token }) => {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/me?access_token=${token}`
      );
      const { name, id } = response.data;
      return { user_name: name, password: id };
    } catch (error) {
      throw responses.server_error_response("Error verifying facebook token");
    }
  };

  //Apple Login
  verify_apple_token = async ({ token }) => {
    try {
      const { header, payload } = jwt.decode(token, { complete: true });

      if (
        header.alg !== "RS256" ||
        payload.iss !== "https://appleid.apple.com" ||
        payload.aud !== "com.your.app.bundleId" ||
        Date.now() >= payload.exp * 1000
      ) {
        throw responses.bad_request_response("Invalid Apple token");
      }
      return {
        email: payload.email || "",
        user_name: payload?.user_name || "",
        profile_picture: payload?.profile_picture || "",
      };
    } catch (error) {
      throw responses.server_error_response("Error verifying Apple token");
    }
  };

  // Verify Google Token
  verify_google_token = async ({ token }) => {
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const { sub, email, picture, name } = payload;
      return {
        email,
        profile_picture: picture,
        user_name: name,
      };
    } catch (error) {
      console.log(error);
      throw responses.server_error_response("Error verifying Google token");
    }
  };

  // Validate Identifier
  validate_identifier = (identifier) => {
    const phone_regex = /^\+?1?\s?(\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}$/;
    const email_regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (phone_regex.test(identifier)) {
      return "phone";
    } else if (email_regex.test(identifier)) {
      return "email";
    } else {
      throw new Error("invalid identifier"); // Simplified for debugging
    }
  };

  //Update User
  update_user = async ({ id, data, tx }) => {
    if (tx) {
      return await tx.users.update({
        data,
        where: {
          id,
        },
      });
    }
    return await prisma.users.update({
      data,
      where: {
        id,
      },
    });
  };

  //Update User Details
  update_user_details = async ({ id, data, tx }) => {
    console.log(id, "id");
    if (tx) {
      return await tx.user_details.update({
        data,
        where: {
          id,
        },
      });
    }
    return await prisma.user_details.update({
      data,
      where: {
        id,
      },
    });
  };

  mark_completed_user = async ({ id, tx }) => {
    if (tx) {
      return await tx.users.update({
        where: {
          id,
        },
        data: {
          is_completed: true,
        },
      });
    }
    return prisma.users.update({
      where: {
        id,
      },
      data: {
        is_completed: true,
      },
    });
  };

  //Create User Details
  create_user_details = async ({ data, tx }) => {
    if (tx) {
      return await tx.user_details.create({
        data,
      });
    }
    return await prisma.user_details.create({
      data: {
        ...data,
      },
    });
  };

  create_provider_documents = async ({
    documents,
    user_id,
    media_name,
    tx,
  }) => {
    const data = documents.map((url) => ({
      media_name,
      media_file: url,
      user_id,
    }));

    return await tx.user_media.createMany({
      data,
    });
  };

  //Create Sessions
  create_user_session = async ({ user, fcm_token }) => {
    //getting access_token and refresh_token
    const access_token = token_service.generate_access_token(
      user.id,
      user.user_type
    );
    const refresh_token = token_service.generate_refresh_token(
      user.id,
      user.user_type
    );

    //creating session
    const session_data = { refresh_token, user_id: user.id };
    if (fcm_token) {
      session_data.fcm_token = fcm_token;
    }
    await prisma.user_sessions.create({
      data: session_data,
    });

    return { access_token, refresh_token };
  };

  initiat_user_referral_code = async ({ user_id }) => {
    return await prisma.referal_code.create({
      data: {
        user_id,
        code: this.generate_random_numeric_code({ length: 8 }),
      },
    });
  };

  reffered_by_queries = async ({ code, user_id, tx }) => {
    const exists = await tx.referal_code.findUnique({
      where: {
        code,
      },
    });

    if (!exists) {
      throw responses.bad_request_response("In correct referral code");
    }

    await tx.users.update({
      where: {
        id: user_id,
      },
      data: {
        referred_by: exists.id,
      },
    });

    await tx.users.update({
      where: {
        id: exists.user_id,
      },
      data: {
        reward_points: {
          increment: 5,
        },
      },
    });

    await tx.user_transaction.create({
      data: {
        user_id: exists.user_id,
        points: 5,
        transaction_type: "CREDIT",
        details: "Reward -- Got a sign up",
        reffered_user_transaction_id: user_id,
      },
    });
  };

  //Update User Secret
  update_user_secret = async ({ otp, _exp, password, id }) => {
    const update_data = {};
    otp && (update_data.otp = otp);
    _exp && (update_data.otp_expiration = _exp);
    password && (update_data.password = password);

    await prisma.user_secrets.update({
      data: update_data,
      where: {
        id,
      },
    });
  };

  // Get already a user – trim identifier so "  email@x.com  " matches DB
  get_already_user = async ({ identifier, identifier_type, find_user_obj }) => {
    if (find_user_obj) {
      return await prisma.users.findFirst({
        where: find_user_obj,
        include: {
          user_secrets: true,
          user_details: true,
          contractor_profile: true,
        },
      });
    }
    const trimmed = typeof identifier === "string" ? identifier.trim() : identifier;
    const find_user_where = {};
    find_user_where[identifier_type] = trimmed;
    return await prisma.users.findFirst({
      where: find_user_where,
      include: {
        user_secrets: true,
        user_details: true,
        contractor_profile: true,
      },
    });
  };

  refresh_access_token = (refresh_token) => {
    return token_service.refresh_access_token(refresh_token);
  };
}

module.exports = UserServiceHelpers;
