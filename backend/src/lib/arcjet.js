import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";
import { ENV } from "./env.js";

const isProduction = ENV.NODE_ENV === "production";

// Base Arcjet instance with comprehensive protection
export const aj = arcjet({
  key: ENV.ARCJET_KEY,
  rules: [
    shield({ mode: isProduction ? "LIVE" : "DRY_RUN" }),
    detectBot({
      mode: isProduction ? "LIVE" : "DRY_RUN",
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
      ],
    }),
    tokenBucket({
      mode: isProduction ? "LIVE" : "DRY_RUN",
      refillRate: 50,
      interval: 60,
      capacity: 100,
    }),
  ],
});

// Strict rate limit for auth endpoints
export const ajAuth = arcjet({
  key: ENV.ARCJET_KEY,
  rules: [
    shield({ mode: isProduction ? "LIVE" : "DRY_RUN" }),
    detectBot({
      mode: isProduction ? "LIVE" : "DRY_RUN",
      allow: [], // Block all bots on auth endpoints
    }),
    tokenBucket({
      mode: isProduction ? "LIVE" : "DRY_RUN",
      refillRate: 5,
      interval: 60,
      capacity: 10,
    }),
  ],
});

// Medium rate limit for profile updates
export const ajProfile = arcjet({
  key: ENV.ARCJET_KEY,
  rules: [
    shield({ mode: isProduction ? "LIVE" : "DRY_RUN" }),
    detectBot({
      mode: isProduction ? "LIVE" : "DRY_RUN",
      allow: [],
    }),
    tokenBucket({
      mode: isProduction ? "LIVE" : "DRY_RUN",
      refillRate: 10,
      interval: 60,
      capacity: 20,
    }),
  ],
});

// Add this back for warehouse/general API routes
export const ajGeneral = arcjet({
  key: ENV.ARCJET_KEY,
  rules: [
    shield({ mode: isProduction ? "LIVE" : "DRY_RUN" }),
    tokenBucket({
      mode: isProduction ? "LIVE" : "DRY_RUN",
      refillRate: 50,
      interval: 60,
      capacity: 100,
    }),
  ],
});
