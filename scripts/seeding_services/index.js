const { prisma } = require("@configs/prisma");

const seeding_data = require("../seeding_data");

class SeedingService {
  truncate_table_data = async ({ table, where }) => {
    return await prisma[table].deleteMany({ where });
  };

  get_table_data = async ({ table, where }) => {
    return await prisma[table].findMany({ where });
  };

  create_table_data = async ({ table, data }) => {
    const create_promises = data.map((item) =>
      prisma[table].create({ data: item })
    );
    return await Promise.all(create_promises);
  };

  seed_admin = async () => {
    try {
      const admin = await this.get_table_data({
        table: "users",
        where: { user_type: "ADMIN" },
      });

      if (admin.length > 0) return console.log("already created");

      await this.truncate_table_data({
        table: "users",
        where: { user_type: "ADMIN" },
      });

      await this.create_table_data({
        table: "users",
        data: seeding_data.admin_data,
      });
    } catch (error) {
      console.error("something went wrong", error);
    }
  };

  seed_terms_and_conditions = async () => {
    const existed = await this.get_table_data({
      table: "terms_and_conditions",
    });

    if (existed.length > 0)
      return console.log("already seeded terms and c9onditions");

    await this.create_table_data({
      table: "terms_and_conditions",
      data: seeding_data.terms_and_conditions,
    });
  };

  seed_about_app = async () => {
    const existed = await this.get_table_data({
      table: "about_app",
    });

    if (existed.length > 0) return console.log("already seeded about app");

    await this.create_table_data({
      table: "about_app",
      data: seeding_data.about_app,
    });
  };

  seed_privacy_policy = async () => {
    const existed = await this.get_table_data({
      table: "privacy_policy",
    });

    if (existed.length > 0) return console.log("already seeded privacy policy");

    await this.create_table_data({
      table: "privacy_policy",
      data: seeding_data.privacy_policy,
    });
  };
}

module.exports = SeedingService;
