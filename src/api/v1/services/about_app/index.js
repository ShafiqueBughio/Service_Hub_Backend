const { prisma } = require("@configs/prisma");
const Responses = require("@constants/responses");

const responses = new Responses();

class AboutAppService {
  create_about_app = async ({ data }) => {
    const about_app = await prisma.about_app.findFirst();

    if (!about_app) {
      const result = await prisma.about_app.create({
        data,
      });

      return { about_app: result };
    } else {
      const result = await prisma.about_app.update({
        where: {
          id: about_app.id,
        },
        data,
      });

      return { about_app: result };
    }
  };

  get_about_app = async () => {
    const about_app = await prisma.about_app.findFirst();

    if (!about_app.id) {
      throw responses.not_found_response("Not Found");
    }


    return { about_app };
  };
}

module.exports = AboutAppService;
