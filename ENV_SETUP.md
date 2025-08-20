# Environment Variables Setup

## 🔧 Required Environment Variables

Buat file `.env.local` di root project dan tambahkan variabel berikut:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Database Configuration (for Prisma)
DATABASE_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres
```

## 📋 Cara Mendapatkan Supabase Credentials

1. **Buka [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Pilih project Anda atau buat project baru**
3. **Pergi ke Settings > API**
4. **Copy URL dan anon key**

## 🗄️ Database Setup

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

## 🔍 Troubleshooting

### Error: "Missing Supabase environment variables"

- Pastikan file `.env.local` ada di root project
- Pastikan nama variabel benar (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- Restart development server setelah menambah environment variables

### Error: "Supabase connection failed"

- Periksa URL dan key Supabase
- Pastikan project Supabase aktif
- Periksa network connection

### Error: "No rooms found"

- Jalankan seed database: `npm run db:seed`
- Periksa apakah tabel sudah dibuat di Supabase
- Periksa Row Level Security (RLS) settings di Supabase
