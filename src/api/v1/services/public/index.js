const { prisma } = require("@configs/prisma");

class PublicService {
  get_reasons = async ({ type }) => {
    return await prisma.reason.findMany({
      where: {
        reason_type: type,
      },
    });
  };

  get_categories = async ({}) => {
    return await prisma.category.findMany({});
  };

  get_professions = async ({}) => {
    return await prisma.profession.findMany({});
  };

  get_single_nested_profession = async ({ profession_id }) => {
    return await prisma.profession.findUnique({
      where: {
        id: profession_id,
      },
      include: {
        sub_profession: true,
      },
    });
  };
}

module.exports = PublicService;
