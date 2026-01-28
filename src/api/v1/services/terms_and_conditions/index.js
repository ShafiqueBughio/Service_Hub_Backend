const { prisma } = require("@configs/prisma");
const Responses = require("@constants/responses");

const responses = new Responses();

class TermsAndConditionService {
  create_terms_and_conditions = async ({ data }) => {
    const terms_and_conditions = await prisma.terms_and_conditions.findFirst();
    if (!terms_and_conditions) {
      const result = await prisma.terms_and_conditions.create({
        data,
      });
      return { terms_and_conditions: result };
    } else {
      const result = await prisma.terms_and_conditions.update({
        where: {
          id: terms_and_conditions.id,
        },
        data,
      });
      return { terms_and_conditions: result };
    }
  };

  get_terms_and_conditions = async () => {

    const terms_and_conditions = await prisma.terms_and_conditions.findFirst();
    if (!terms_and_conditions.id) {
      throw responses.not_found_response("Not found");
    }
    return { terms_and_conditions };
  };
}

module.exports = TermsAndConditionService;
