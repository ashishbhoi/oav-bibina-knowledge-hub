#!/usr/bin/env node

// Simple password hashing utility
// Usage: node scripts/hash-password.js [password]

import bcrypt from 'bcryptjs';

const password = process.argv[2];

if (!password) {
	console.error('Usage: node scripts/hash-password.js <password>');
	console.error('Example: node scripts/hash-password.js mySecurePassword123');
	process.exit(1);
}

async function hashPassword() {
	try {
		const salt = await bcrypt.genSalt(12);
		const hash = await bcrypt.hash(password, salt);

		// Clear password from memory immediately after use
		process.argv[2] = undefined;

		console.log('Hashed Password:', hash);
		console.log('\nSQL Command to create admin user:');
		console.log(
			`INSERT INTO Admin (id, username, password_hash)
             VALUES (1, 'admin', '${hash}');`
		);
		console.log('\nWrangler command:');
		console.log(
			`wrangler d1 execute oav-knowledge-hub-db --command="INSERT INTO Admin (id, username, password_hash) VALUES (1, 'admin', '${hash}')"`
		);
	} catch (error) {
		console.error('Error hashing password:', error);
		process.exit(1);
	}
}

hashPassword(password);
