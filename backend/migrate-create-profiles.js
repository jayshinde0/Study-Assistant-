import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './src/models/User.js';
import StudentProfile from './src/models/StudentProfile.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
console.log('📝 MONGODB_URI:', process.env.MONGODB_URI ? 'Loaded' : 'Not found');

async function migrateProfiles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all users without profiles
    const usersWithoutProfiles = await User.find({ studentProfile: { $exists: false } });
    console.log(`📊 Found ${usersWithoutProfiles.length} users without profiles`);

    if (usersWithoutProfiles.length === 0) {
      console.log('✅ All users already have profiles');
      await mongoose.connection.close();
      return;
    }

    let created = 0;
    for (const user of usersWithoutProfiles) {
      try {
        // Create profile
        const profile = new StudentProfile({
          userId: user._id,
          name: user.name,
          email: user.email,
          username: user.username,
          totalXP: user.xp || 0,
          currentStreak: user.streak || 0,
          totalQuizzesTaken: user.totalQuizzesTaken || 0,
          averageAccuracy: user.averageAccuracy || 0
        });
        await profile.save();

        // Link profile to user
        user.studentProfile = profile._id;
        await user.save();

        created++;
        console.log(`✅ Created profile for ${user.name} (${user.email})`);
      } catch (error) {
        console.error(`❌ Error creating profile for ${user.email}:`, error.message);
      }
    }

    console.log(`\n✅ Migration complete! Created ${created} profiles`);
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateProfiles();
