const fs = require("fs");
const path = require("path");
const readline = require("readline");

function printAnimated(text, delay = 80, onComplete) {
  const colors = [
    "\x1b[31m", // Red
    "\x1b[32m", // Green
    "\x1b[33m", // Yellow
    "\x1b[34m", // Blue
    "\x1b[35m", // Magenta
    "\x1b[36m", // Cyan
  ];
  const reset = "\x1b[0m";

  let index = 0;
  const interval = setInterval(() => {
    const color = colors[index % colors.length];
    process.stdout.write(color + text[index] + reset);
    index++;
    if (index === text.length) {
      clearInterval(interval);
      setTimeout(onComplete, 500); // Small pause after animation
    }
  }, delay);
}

// Animation + Actual logic
printAnimated("From Sandstech backend team", 80, () => {
  console.log("\nLets get started");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter the module name: ", function (moduleName) {
    const basePath = path.join(__dirname, "..", "src", "api", "v1");
    const pascalName = toPascalCase(moduleName);

    const structure = {
      controller: {
        dir: path.join(basePath, "controllers", moduleName),
        file: "index.js",
        content: getControllerTemplate(pascalName, moduleName),
      },
      service: {
        dir: path.join(basePath, "services", moduleName),
        file: "index.js",
        content: getServiceTemplate(pascalName, moduleName),
      },
      helper: {
        dir: path.join(basePath, "helpers"),
        file: `${moduleName}_helper.js`,
        content: getHelperTemplate(pascalName),
      },
      route: {
        dir: path.join(basePath, "routers", moduleName),
        file: "index.js",
        content: getRouteTemplate(pascalName, moduleName),
      },
      validation: {
        dir: path.join(basePath, "validations", moduleName),
        file: "index.js",
        content: getValidationTemplate(pascalName),
      },
    };

    for (const [type, { dir, file, content }] of Object.entries(structure)) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const filePath = path.join(dir, file);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Created: ${path.relative(basePath, filePath)}`);
      } else {
        console.log(`⚠️  Already exists: ${path.relative(basePath, filePath)}`);
      }
    }

    rl.close();
  });
});

// Utility and Template functions
function toPascalCase(name) {
  return name
    .split(/[_\- ]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

function getControllerTemplate(className, moduleName) {
  return `// ${className} Controller

const ${className}Service = require("@api/v1/services/${moduleName}");
const Responses = require("@constants/responses");

const responses = new Responses();
const service = new ${className}Service();

class ${className}Controller {
  // Controller methods
}

module.exports = ${className}Controller;
`;
}

function getServiceTemplate(className, moduleName) {
  return `// ${className} Service

const ${className}Helper = require("@api/v1/helpers/${moduleName}_helper");
const { prisma } = require("@configs/prisma");

const helper = new ${className}Helper();

class ${className}Service {
  // Service methods for ${className}
}

module.exports = ${className}Service;
`;
}

function getHelperTemplate(className) {
  return `// ${className} Helper

const { prisma } = require("@configs/prisma");

class ${className}Helper {
  // Helper methods
}

module.exports = ${className}Helper;
`;
}

function getRouteTemplate(className, moduleName) {
  return `// ${className} Routes

const ${className}Controller = require("@api/v1/controllers/${moduleName}");
const validate_request = require("@api/v1/middlewares/validate_request_joi.middleware");
const verify_token = require("@api/v1/middlewares/verify_token.middleware");
const ${className}Validations = require("@api/v1/validations/${moduleName}");
const express = require("express");
const router = express.Router();

const validations = new ${className}Validations();
const controller = new ${className}Controller();

// Define routes

module.exports = router;
`;
}

function getValidationTemplate(className) {
  return `// ${className} Validations

const Joi = require("joi");

class ${className}Validations {
  // Add Joi validation schemas here
}

module.exports = ${className}Validations;
`;
}
