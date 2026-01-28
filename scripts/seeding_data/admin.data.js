const data = [
  {
    email: "admin@ccc.com",
    is_email_verified: true,
    user_type: "ADMIN",
    is_completed: true,
    user_secrets: {
      create: {
        //admin@123
        password:
          "$2a$10$SyCQOGDJjVVun2yYFD1qlOL9H6bVvK7BVoW3fkfLstrLoOmTzvJri",
        otp_expiration: new Date(),
      },
    },
  },
];

module.exports = data;
