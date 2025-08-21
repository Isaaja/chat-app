# Chat API Guide

Panduan lengkap untuk menggunakan Chat API yang sudah dibuat untuk mengirim pesan di group atau personal chat.

## 🚀 Fitur yang Tersedia

- ✅ Mengirim pesan ke group chat
- ✅ Mengirim pesan personal
- ✅ Membuat group chat baru
- ✅ Mengambil pesan dengan pagination
- ✅ Validasi input dan error handling
- ✅ Support berbagai tipe pesan (text, image, file, audio, video)

## 📁 Struktur File

```
src/
├── app/api/chat/
│   ├── route.ts              # GET semua room
│   ├── group/route.ts        # POST membuat group
│   ├── message/route.ts      # POST/GET pesan ke room
│   └── personal/route.ts     # POST/GET pesan personal
├── services/
│   └── chat.ts              # Service functions
├── features/chat/
│   ├── hooks/
│   │   └── useChat.ts       # Custom React hook
│   └── components/
│       └── ChatExample.tsx  # Contoh komponen
└── API_ENDPOINTS.md         # Dokumentasi API
```

## 🔧 Setup dan Instalasi

1. **Pastikan database sudah setup:**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

2. **Jalankan development server:**

   ```bash
   npm run dev
   ```

3. **Test endpoint dengan script:**
   ```bash
   node test-endpoints.js
   ```

## 📡 Endpoint API

### 1. Mengirim Pesan ke Group/Personal

```http
POST /api/chat/message
Content-Type: application/json

{
  "roomId": 1,
  "senderId": "user123",
  "message": "Hello everyone!",
  "type": "text"
}
```

### 2. Mengirim Pesan Personal

```http
POST /api/chat/personal
Content-Type: application/json

{
  "senderId": "user123",
  "receiverId": "user456",
  "message": "Hi there!",
  "type": "text"
}
```

### 3. Mengambil Pesan dari Room

```http
GET /api/chat/message?roomId=1&limit=50&offset=0
```

### 4. Mengambil Pesan Personal

```http
GET /api/chat/personal?senderId=user123&receiverId=user456&limit=50&offset=0
```

### 5. Membuat Group Chat

```http
POST /api/chat/group
Content-Type: application/json

{
  "name": "My Group Chat",
  "imageUrl": "https://example.com/image.jpg",
  "participants": [
    {
      "id": "user123",
      "name": "John Doe",
      "role": 1
    }
  ]
}
```

## 🎣 React Hook Usage

### Import dan Setup

```typescript
import { useChat } from "@/features/chat/hooks/useChat";

function MyChatComponent() {
  const {
    messages,
    rooms,
    loading,
    error,
    sendMessageToRoom,
    sendPersonalChat,
    loadRoomMessages,
    loadPersonalMessages,
    createNewGroup,
    clearError,
  } = useChat();

  // ... component logic
}
```

### Mengirim Pesan ke Group

```typescript
const handleSendGroupMessage = async () => {
  try {
    await sendMessageToRoom(
      1, // roomId
      "user123", // senderId
      "Hello everyone!", // message
      "text" // type (optional)
    );
  } catch (error) {
    console.error("Failed to send message:", error);
  }
};
```

### Mengirim Pesan Personal

```typescript
const handleSendPersonalMessage = async () => {
  try {
    await sendPersonalChat(
      "user123", // senderId
      "user456", // receiverId
      "Hi there!", // message
      "text" // type (optional)
    );
  } catch (error) {
    console.error("Failed to send message:", error);
  }
};
```

### Mengambil Pesan

```typescript
const handleLoadMessages = async () => {
  try {
    // Load room messages
    await loadRoomMessages(1, 50, 0);

    // Or load personal messages
    await loadPersonalMessages("user123", "user456", 50, 0);
  } catch (error) {
    console.error("Failed to load messages:", error);
  }
};
```

### Membuat Group Baru

```typescript
const handleCreateGroup = async () => {
  try {
    await createNewGroup(
      "My New Group", // name
      [
        // participants
        { id: "user123", name: "John Doe", role: 1 },
        { id: "user456", name: "Jane Smith", role: 1 },
      ],
      "https://example.com/group-image.jpg" // imageUrl (optional)
    );
  } catch (error) {
    console.error("Failed to create group:", error);
  }
};
```

## 🔄 Service Functions

### Import Service Functions

```typescript
import {
  sendMessage,
  sendPersonalMessage,
  getMessages,
  getPersonalMessages,
  createGroup,
} from "@/services/chat";
```

### Menggunakan Service Functions

```typescript
// Send message to room
const messageResponse = await sendMessage({
  roomId: 1,
  senderId: "user123",
  message: "Hello!",
  type: "text",
});

// Send personal message
const personalResponse = await sendPersonalMessage({
  senderId: "user123",
  receiverId: "user456",
  message: "Hi there!",
  type: "text",
});

// Get messages with pagination
const messages = await getMessages(1, 50, 0);

// Create new group
const group = await createGroup({
  name: "My Group",
  participants: [{ id: "user123", name: "John Doe", role: 1 }],
  imageUrl: "https://example.com/image.jpg",
});
```

## 🎨 Contoh Komponen Lengkap

Lihat file `src/features/chat/components/ChatExample.tsx` untuk contoh komponen React yang lengkap dengan semua fitur.

## 🧪 Testing

### Manual Testing

1. Jalankan development server: `npm run dev`
2. Buka browser ke `http://localhost:3000`
3. Import dan gunakan `ChatExample` component
4. Test semua fitur melalui UI

### Automated Testing

```bash
# Test dengan script Node.js
node test-endpoints.js
```

## 📋 Tipe Pesan yang Didukung

- `text` - Pesan teks biasa
- `image` - Gambar
- `file` - File dokumen
- `audio` - File audio
- `video` - File video

## 🔒 Validasi dan Error Handling

### Validasi Input

- Semua field required diperiksa
- Tipe data divalidasi
- Room dan participant existence diperiksa
- Permission untuk mengirim pesan diperiksa

### Error Responses

```json
{
  "error": "Error message description"
}
```

**Status Codes:**

- `400` - Bad Request (invalid input)
- `403` - Forbidden (no permission)
- `404` - Not Found (resource not found)
- `500` - Internal Server Error

## 🚀 Deployment

1. **Setup environment variables:**

   ```env
   DATABASE_URL="your-database-url"
   DIRECT_URL="your-direct-database-url"
   ```

2. **Deploy ke platform pilihan:**
   - Vercel: `vercel --prod`
   - Netlify: `netlify deploy --prod`
   - Railway: `railway up`

## 📚 Referensi

- [API Documentation](./API_ENDPOINTS.md)
- [Prisma Schema](./prisma/schema.prisma)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [React Hooks](https://react.dev/reference/react/hooks)

## 🤝 Contributing

1. Fork repository
2. Buat feature branch
3. Commit changes
4. Push ke branch
5. Buat Pull Request

## 📄 License

MIT License - lihat file LICENSE untuk detail.
