#!/usr/bin/env node

// verify-jwt-setup.js
// Run this to verify your JWT socket setup is correct

const fs = require("fs");
const path = require("path");

console.log("🔍 Verifying JWT Socket Setup...\n");

let errors = [];
let warnings = [];
let success = [];

// Check 1: Backend Dependencies
console.log("📦 Checking backend dependencies...");
try {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, "backend/package.json"), "utf8")
  );

  if (packageJson.dependencies.cookie || packageJson.dependencies.cookie) {
    success.push("✅ cookie package installed");
  } else {
    errors.push("❌ cookie package NOT installed - run: npm install cookie");
  }

  if (packageJson.dependencies["socket.io"]) {
    success.push("✅ socket.io installed");
  } else {
    errors.push("❌ socket.io NOT installed");
  }
} catch (err) {
  errors.push("❌ Cannot read backend/package.json");
}

// Check 2: Socket Handler
console.log("\n🔌 Checking socket handler...");
try {
  const socketHandler = fs.readFileSync(
    path.join(__dirname, "backend/src/socket/socketHandler.js"),
    "utf8"
  );

  if (socketHandler.includes("cookie.parse")) {
    success.push("✅ Socket handler uses cookie parser");
  } else {
    errors.push("❌ Socket handler does NOT use cookie parser");
  }

  if (
    socketHandler.includes("withCredentials: true") ||
    socketHandler.includes("credentials: true")
  ) {
    success.push("✅ CORS credentials enabled");
  } else {
    errors.push("❌ CORS credentials NOT enabled in socket handler");
  }

  if (socketHandler.includes("jwt.verify")) {
    success.push("✅ JWT verification implemented");
  } else {
    errors.push("❌ JWT verification NOT found");
  }
} catch (err) {
  errors.push("❌ Cannot read backend/src/socket/socketHandler.js");
}

// Check 3: Frontend Socket Service
console.log("\n🌐 Checking frontend socket service...");
try {
  const socketService = fs.readFileSync(
    path.join(__dirname, "frontend/src/services/socket.js"),
    "utf8"
  );

  if (socketService.includes("withCredentials: true")) {
    success.push("✅ Frontend sends credentials");
  } else {
    errors.push("❌ Frontend does NOT send credentials (withCredentials)");
  }

  if (
    socketService.includes("connect()") &&
    !socketService.includes("connect(userId)") &&
    !socketService.includes("connect(token)")
  ) {
    success.push("✅ Socket connect() takes no parameters (uses cookies)");
  } else {
    warnings.push("⚠️ Socket connect() may be passing manual token");
  }
} catch (err) {
  errors.push("❌ Cannot read frontend/src/services/socket.js");
}

// Check 4: MessageContext
console.log("\n💬 Checking MessageContext...");
try {
  const messageContext = fs.readFileSync(
    path.join(__dirname, "frontend/src/context/MessageContext.jsx"),
    "utf8"
  );

  if (
    messageContext.includes("socketService.connect()") &&
    !messageContext.includes("socketService.connect(user.id)") &&
    !messageContext.includes("socketService.connect(token)")
  ) {
    success.push("✅ MessageContext calls connect() without parameters");
  } else {
    warnings.push("⚠️ MessageContext may be passing token to connect()");
  }
} catch (err) {
  errors.push("❌ Cannot read frontend/src/context/MessageContext.jsx");
}

// Print Results
console.log("\n" + "=".repeat(60));
console.log("\n📊 VERIFICATION RESULTS:\n");

if (success.length > 0) {
  console.log("✅ SUCCESS:\n");
  success.forEach((msg) => console.log(`   ${msg}`));
  console.log();
}

if (warnings.length > 0) {
  console.log("⚠️  WARNINGS:\n");
  warnings.forEach((msg) => console.log(`   ${msg}`));
  console.log();
}

if (errors.length > 0) {
  console.log("❌ ERRORS:\n");
  errors.forEach((msg) => console.log(`   ${msg}`));
  console.log();
}

console.log("=".repeat(60));

if (errors.length === 0 && warnings.length === 0) {
  console.log("\n🎉 All checks passed! Your setup looks good.\n");
  console.log("Next steps:");
  console.log("  1. Restart backend: cd backend && npm start");
  console.log("  2. Restart frontend: cd frontend && npm run dev");
  console.log("  3. Login and check browser console for socket connection\n");
} else if (errors.length === 0) {
  console.log("\n⚠️  Setup has warnings but should work.\n");
  console.log("Review warnings above and make adjustments if needed.\n");
} else {
  console.log("\n❌ Setup has errors that need to be fixed.\n");
  console.log("Fix errors above before proceeding.\n");
}

// Additional Checks
console.log("📋 MANUAL VERIFICATION NEEDED:\n");
console.log("   1. Check your JWT cookie name in authController.js");
console.log("   2. Verify it matches in socketHandler.js (line ~33)");
console.log("   3. Check your JWT payload structure");
console.log("   4. Verify userId field matches in socketHandler.js (line ~47)");
console.log("   5. Ensure CORS origins match your actual URLs\n");

console.log("📖 See JWT-SETUP-GUIDE.md for detailed instructions.\n");
