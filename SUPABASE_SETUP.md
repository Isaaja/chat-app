# Supabase Setup Guide

## 1. Environment Variables

Buat file `.env.local` di root project dan tambahkan:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Database Configuration
DATABASE_URL=your_database_url
DIRECT_URL=your_direct_database_url
```

## 2. Database Setup

1. **Generate Prisma Client:**

   ```bash
   npx prisma generate
   ```

2. **Run Database Migrations:**

   ```bash
   npx prisma migrate dev
   ```

3. **Seed Database:**
   ```bash
   npm run db:seed
   ```

## 3. Supabase Table Structure

Pastikan tabel di Supabase sesuai dengan schema Prisma:

- `room` - Tabel untuk chat rooms
- `participant` - Tabel untuk participants/users
- `room_participant` - Junction table untuk relasi many-to-many
- `comment` - Tabel untuk messages/comments

## 4. Features

✅ **Clean Code Implementation:**

- Type-safe Supabase client
- Proper error handling
- Modular service structure
- No redundant code

✅ **Database Operations:**

- Fetch all chat data
- Create rooms
- Add participants
- Create comments
- Get room by ID

✅ **Sample Data:**

- 3 sample rooms
- 5 sample participants
- 10 sample comments
- Proper relationships
