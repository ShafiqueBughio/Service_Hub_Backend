require("module-alias/register");
const env = require("dotenv");
env.config();

const prompts = require("@inquirer/prompts");
const SeedingService = require("./seeding_services");

const seeding_service = new SeedingService();

const SEEDING_ACTIONS = {
  admin: {
    fn: () => seeding_service.seed_admin(),
    success: "✅ Seeded Admin!",
  },
  about_app: {
    fn: () => seeding_service.seed_about_app(),
    success: "✅ Seeded About App!",
  },
  privacy_policy: {
    fn: () => seeding_service.seed_privacy_policy(),
    success: "✅ Seeded Privacy Policy!",
  },
  terms_and_conditions: {
    fn: () => seeding_service.seed_terms_and_conditions(),
    success: "✅ Seeded Terms and Conditions!",
  },
};

async function runPrompt() {
  try {
    const answer = await prompts.select({
      message: "What would you like to seed?",
      choices: [
        { name: "All Data", value: "all" },
        ...Object.keys(SEEDING_ACTIONS).map((key) => ({
          name: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          value: key,
        })),
      ],
    });

    if (answer === "all") {
      await Promise.all(
        Object.values(SEEDING_ACTIONS).map((action) => action.fn())
      );
      console.log("🌱 Successfully seeded all data!");
    } else if (SEEDING_ACTIONS[answer]) {
      await SEEDING_ACTIONS[answer].fn();
      console.log(SEEDING_ACTIONS[answer].success);
    } else {
      console.log("⚠️ Invalid choice.");
    }
  } catch (error) {
    console.error("❌ Something went wrong:", error);
  } finally {
    process.exit();
  }
}

runPrompt();
