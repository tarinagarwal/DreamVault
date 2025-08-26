import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import { Database, Resource, getModelByName } from "@adminjs/prisma";
import session from "express-session";
import { createClient } from "redis";
import { RedisStore } from "connect-redis";

import { prisma } from "./index.js";
import { Prisma } from "@prisma/client";

// Register Prisma adapter
AdminJS.registerAdapter({ Database, Resource });

const DEFAULT_ADMIN = {
  email: process.env.ADMIN_EMAIL || "admin@example.com",
  password: process.env.ADMIN_PASSWORD || "admin123", // Change this in production
};

const authenticate = async (email, password) => {
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    return Promise.resolve(DEFAULT_ADMIN);
  }
  return null;
};

// Function to get all model names from Prisma DMMF
const getAllModelNames = () => {
  return Prisma.dmmf.datamodel.models.map((model) => model.name);
};

// Function to create default options for models
const getDefaultModelOptions = (modelName) => {
  const baseOptions = {
    listProperties: [],
    filterProperties: [],
    showProperties: [],
    editProperties: [],
    actions: {},
  };

  // Special configuration for User model
  if (modelName === "User") {
    return {
      properties: {
        passwordHash: {
          isVisible: false, // Hide password hash
        },
        verificationOtp: {
          isVisible: false, // Hide OTP
        },
        resetPasswordToken: {
          isVisible: false, // Hide reset token
        },
        resetPasswordExpires: {
          isVisible: false, // Hide reset token expiry
        },
        otpExpiresAt: {
          isVisible: false, // Hide OTP expiry
        },
        id: {
          isVisible: { list: true, filter: true, show: true, edit: false },
        },
        createdAt: {
          isVisible: { list: true, filter: true, show: true, edit: false },
        },
        updatedAt: {
          isVisible: { list: true, filter: true, show: true, edit: false },
        },
      },
      actions: {
        // Disable delete action for safety
        delete: {
          isVisible: false,
        },
        // Customize edit action
        edit: {
          before: async (request) => {
            // Remove password hash from edit form
            if (request.payload?.passwordHash) {
              delete request.payload.passwordHash;
            }
            return request;
          },
        },
      },
      listProperties: [
        "id",
        "firstName",
        "lastName",
        "username",
        "email",
        "isVerified",
        "createdAt",
      ],
      filterProperties: [
        "firstName",
        "lastName",
        "username",
        "email",
        "isVerified",
        "createdAt",
      ],
      showProperties: [
        "id",
        "firstName",
        "lastName",
        "username",
        "email",
        "isVerified",
        "createdAt",
        "updatedAt",
      ],
      editProperties: [
        "firstName",
        "lastName",
        "username",
        "email",
        "isVerified",
      ],
    };
  }

  // Default configuration for other models
  return baseOptions;
};

// Function to dynamically generate resources
const generateResources = () => {
  const modelNames = getAllModelNames();
  console.log(`📋 Found ${modelNames.length} models: ${modelNames.join(", ")}`);

  return modelNames.map((modelName) => ({
    resource: {
      model: getModelByName(modelName),
      client: prisma,
    },
    options: getDefaultModelOptions(modelName),
  }));
};
export const setupAdminJS = (app) => {
  // Initialize Redis client
  let redisClient;
  let sessionStore;

  if (process.env.REDIS_URL) {
    try {
      redisClient = createClient({
        url: process.env.REDIS_URL,
      });

      redisClient.on("error", (err) => {
        console.error("❌ Redis Client Error:", err);
      });

      redisClient.on("connect", () => {
        console.log("✅ Connected to Redis");
      });

      redisClient.on("ready", () => {
        console.log("🚀 Redis client ready");
      });

      // Connect to Redis
      redisClient.connect().catch((err) => {
        console.error("❌ Failed to connect to Redis:", err);
        console.log("⚠️  Falling back to memory store");
      });

      // Initialize store
      sessionStore = new RedisStore({
        client: redisClient,
        prefix: "adminjs:",
      });

      console.log("🔧 Using Redis for session storage");
    } catch (error) {
      console.error("❌ Redis setup failed:", error);
      console.log("⚠️  Falling back to memory store");
    }
  } else {
    console.log("⚠️  No REDIS_URL found, using memory store");
  }

  // AdminJS configuration
  const adminOptions = {
    resources: generateResources(),
    branding: {
      companyName: "Auth Template Admin",
      logo: false,
      softwareBrothers: false,
    },
    rootPath: "/admin",
  };

  const admin = new AdminJS(adminOptions);

  const sessionConfig = {
    resave: true,
    saveUninitialized: true,
    secret: process.env.JWT_SECRET || "admin-session-secret",
    cookie: {
      httpOnly: process.env.NODE_ENV === "production",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
    name: "adminjs",
    ...(sessionStore && { store: sessionStore }),
  };

  // Build authenticated router
  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
      authenticate,
      cookieName: "adminjs",
      cookiePassword: process.env.JWT_SECRET || "admin-session-secret",
    },
    null,
    sessionConfig
  );

  // Mount admin router
  app.use(admin.options.rootPath, adminRouter);

  console.log(
    `🔧 AdminJS started on http://localhost:${process.env.PORT || 5000}${
      admin.options.rootPath
    }`
  );
  console.log(`📧 Admin login: ${DEFAULT_ADMIN.email}`);
  console.log(`🔑 Admin password: ${DEFAULT_ADMIN.password}`);

  return admin;
};
