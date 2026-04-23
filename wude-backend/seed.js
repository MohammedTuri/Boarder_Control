import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seedWude() {
    try {
        console.log('Seeding Wude database...');

        // 1. Clear existing demo data
        await pool.query('TRUNCATE wude_users, wude_likes, wude_matches CASCADE');

        const users = [
            { email: 'user1@wude.app', password: 'hashed_password', name: 'Selamawit Tekle', age: 24, gender: 'woman', looking: 'man', bio: 'Architecture student. I love jazz and exploring ancient cultures.', location: 'Addis Ababa, Ethiopia', premium: true, photo: 'https://images.unsplash.com/photo-1523824921871-d6f1a31951bc' },
            { email: 'user2@wude.app', password: 'hashed_password', name: 'James Wilson', age: 30, gender: 'man', looking: 'woman', bio: 'Tech entrepreneur and traveler. Looking for a partner to build a life with.', location: 'London, UK', premium: false, photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d' },
            { email: 'user3@wude.app', password: 'hashed_password', name: 'Fatima Al-Sayed', age: 27, gender: 'woman', looking: 'man', bio: 'Doctor with a passion for humanitarian work. Values kindness and family.', location: 'Dubai, UAE', premium: true, photo: 'https://images.unsplash.com/photo-1531123897727-8f129e16fd3c' },
            { email: 'user4@wude.app', password: 'hashed_password', name: 'Marcus Chen', age: 29, gender: 'man', looking: 'woman', bio: 'Artist and cook. I believe food is the best way to the heart.', location: 'New York, USA', premium: false, photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce' },
            { email: 'user5@wude.app', password: 'hashed_password', name: 'Zainab Juma', age: 25, gender: 'woman', looking: 'man', bio: 'Graphic designer and nature lover. Looking for a soulful connection.', location: 'Nairobi, Kenya', premium: false, photo: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2' },
            { email: 'user6@wude.app', password: 'hashed_password', name: 'Sofia Rodriguez', age: 28, gender: 'woman', looking: 'man', bio: 'Journalist and storyteller. Seeking someone to share new chapters with.', location: 'Madrid, Spain', premium: true, photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d' }
        ];

        for (const u of users) {
            await pool.query(
                'INSERT INTO wude_users (email, password_hash, full_name, age, gender, looking_for, bio, location, is_premium, photo_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
                [u.email, u.password, u.name, u.age, u.gender, u.looking, u.bio, u.location, u.premium, u.photo]
            );
        }

        console.log('Wude: Database seeded with 6 profiles. 🚀');
        process.exit(0);
    } catch (err) {
        console.error('Seed failed:', err.message);
        process.exit(1);
    }
}

seedWude();
