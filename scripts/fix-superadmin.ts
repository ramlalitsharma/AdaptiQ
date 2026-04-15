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
        const users = await db.collection('users').find({ email: email.toLowerCase() }).sort({ _id: -1 }).toArray();

        if (users.length > 1) {
            console.log(`Found ${users.length} records. Consolidating into the latest one (Clerk ID: ${users[0].clerkId})...`);

            const latestId = users[0]._id;
            const staleIds = users.slice(1).map(u => u._id);

            // 1. Update the latest record to Superadmin
            await db.collection('users').updateOne(
                { _id: latestId },
                {
                    $set: {
                        role: 'superadmin',
                        isSuperAdmin: true,
                        isAdmin: true,
                        isTeacher: true,
                        updatedAt: new Date()
                    }
                }
            );

            // 2. Delete stale records
            await db.collection('users').deleteMany({ _id: { $in: staleIds } });

            console.log('✅ Cleaned up stale records.');
            console.log('✅ Updated current record to superadmin.');
        } else if (users.length === 1) {
            console.log('Latest record is already superadmin or being updated...');
            await db.collection('users').updateOne(
                { _id: users[0]._id },
                {
                    $set: {
                        role: 'superadmin',
                        isSuperAdmin: true,
                        isAdmin: true,
                        isTeacher: true,
                        updatedAt: new Date()
                    }
                }
            );
            console.log('✅ Verified superadmin status on the single record.');
        } else {
            console.log('❌ No user record found to consolidate.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

main();
