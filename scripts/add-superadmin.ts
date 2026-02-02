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
        const collection = db.collection('superadmin_manifest');

        const email = 'ramlalitsharma01@gmail.com';

        const result = await collection.updateOne(
            { email: email.toLowerCase() },
            { $set: { email: email.toLowerCase(), updatedAt: new Date() } },
            { upsert: true }
        );

        if (result.upsertedCount > 0) {
            console.log(`✅ Success: Added ${email} to superadmin manifest.`);
        } else {
            console.log(`ℹ️ Info: ${email} is already in the manifest.`);
        }

        // Also update the user record if it exists to reflect the role immediately
        await db.collection('users').updateOne(
            { email: email.toLowerCase() },
            { $set: { role: 'superadmin', isSuperAdmin: true, isAdmin: true, isTeacher: true } }
        );
        console.log(`✅ Updated user record for ${email} in the database.`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

main();
