const { prisma } = require("@configs/prisma");
const Responses = require("@constants/responses");

const responses = new Responses();

class PrivacyPolicyService {
  create_privacy_policy = async ({ data }) => {
    const privacy_policy = await prisma.privacy_policy.findFirst();

    if (!privacy_policy) {
      const result = await prisma.privacy_policy.create({
        data,
      });

      return { privacy_policy: result };
    } else {
      const result = await prisma.privacy_policy.update({
        where: {
          id: privacy_policy.id,
        },
        data,
      });

      return { privacy_policy: result };
    }
  };

  get_privacy_policy = async ({}) => {
    const privacy_policy = await prisma.privacy_policy.findFirst();
    if (!privacy_policy.id) {
      throw responses.not_found_response("Not Found");
    }
    return { privacy_policy };
  };
}

module.exports = PrivacyPolicyService;
