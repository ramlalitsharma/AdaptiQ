import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'adaptiq';

async function main() {
    if (!MONGODB_URI) {
        console.error('MONGODB_URI is not defined in .env.local');
        process.exit(1);
    }

    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const db = client.db(MONGODB_DB_NAME);

        const email = 'ramlalitsharma01@gmail.com';
        console.log(`🔍 Checking data for email: ${email}`);

        const manifest = await db.collection('superadmin_manifest').findOne({ email: email.toLowerCase() });
        console.log('Manifest entry:', manifest ? '✅ Found' : '❌ NOT FOUND');

        const users = await db.collection('users').find({ email: email.toLowerCase() }).toArray();
        console.log(`\nFound ${users.length} records in "users" collection for this email:`);
        users.forEach((u, i) => {
            console.log(`Record #${i + 1}:`);
            console.log('  - _id:', u._id);
            console.log('  - clerkId:', u.clerkId);
            console.log('  - role:', u.role);
            console.log('  - isSuperAdmin:', u.isSuperAdmin);
        });

        // Check all users with superadmin role to see if there are duplicates
        const allSupers = await db.collection('users').find({ role: 'superadmin' }).toArray();
        console.log(`\nFound ${allSupers.length} superadmins in DB.`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

main();
