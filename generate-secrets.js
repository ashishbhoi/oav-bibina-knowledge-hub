#!/usr/bin/env node

import crypto from "crypto";

console.log("🔐 Generating Secure Secrets for OAV Bibina Knowledge Hub\n");

// Generate SESSION_SECRET (64 character hex string)
const sessionSecret = crypto.randomBytes(32).toString("hex");
console.log("SESSION_SECRET (Copy this to your .env file):");
console.log(sessionSecret);
console.log("");

// Generate a shorter backup secret
const backupSecret = crypto.randomBytes(16).toString("base64url");
console.log("Alternative SESSION_SECRET (base64url, shorter):");
console.log(backupSecret);
console.log("");

// Generate random identifier for demo purposes
const randomId = crypto.randomUUID();
console.log("Random UUID (for reference):");
console.log(randomId);
console.log("");

console.log("📝 Instructions:");
console.log("1. Copy the SESSION_SECRET above to your .env file");
console.log("2. Get your Cloudflare credentials from the Cloudflare dashboard");
console.log(
    "3. For R2 credentials, create an API token in Cloudflare dashboard"
);
console.log("");

console.log("🔗 Cloudflare Setup Links:");
console.log("- Account ID: https://dash.cloudflare.com/ (right sidebar)");
console.log("- R2 API Tokens: https://dash.cloudflare.com/profile/api-tokens");
console.log(
    "- R2 Documentation: https://developers.cloudflare.com/r2/api/s3/tokens/"
);
