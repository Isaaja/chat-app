# API Endpoints Documentation

## Chat Endpoints

### 1. Mengirim Pesan ke Group/Personal Chat

**POST** `/api/chat/message`

Mengirim pesan ke room yang sudah ada (group atau personal).

**Request Body:**

```json
{
  "roomId": 1,
  "senderId": "user123",
  "message": "Hello everyone!",
  "type": "text"
}
```

**Parameters:**

- `roomId` (number, required): ID room tempat mengirim pesan
- `senderId` (string, required): ID pengirim pesan
- `message` (string, required): Isi pesan
- `type` (string, optional): Tipe pesan - "text", "image", "file", "audio", "video" (default: "text")

**Response (201):**

```json
{
  "id": 1,
  "type": "text",
  "message": "Hello everyone!",
  "sender": {
    "id": "user123",
    "name": "John Doe",
    "role": 1
  },
  "room": {
    "id": 1,
    "name": "Group Chat",
    "image_url": null,
    "participant": [
      {
        "id": "user123",
        "name": "John Doe",
        "role": 1
      }
    ]
  },
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### 2. Mengambil Pesan dari Room

**GET** `/api/chat/message?roomId=1&limit=50&offset=0`

Mengambil pesan dari room tertentu dengan pagination.

**Query Parameters:**

- `roomId` (number, required): ID room
- `limit` (number, optional): Jumlah pesan per halaman (default: 50)
- `offset` (number, optional): Offset untuk pagination (default: 0)

**Response (200):**

```json
{
  "room": {
    "id": 1,
    "name": "Group Chat",
    "image_url": null,
    "participant": [
      {
        "id": "user123",
        "name": "John Doe",
        "role": 1
      }
    ]
  },
  "comments": [
    {
      "id": 1,
      "type": "text",
      "message": "Hello everyone!",
      "sender": {
        "id": "user123",
        "name": "John Doe",
        "role": 1
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 1
  }
}
```

### 3. Mengirim Pesan Personal

**POST** `/api/chat/personal`

Mengirim pesan personal antara dua user. Jika room personal belum ada, akan dibuat otomatis.

**Request Body:**

```json
{
  "senderId": "user123",
  "receiverId": "user456",
  "message": "Hi there!",
  "type": "text"
}
```

**Parameters:**

- `senderId` (string, required): ID pengirim pesan
- `receiverId` (string, required): ID penerima pesan
- `message` (string, required): Isi pesan
- `type` (string, optional): Tipe pesan - "text", "image", "file", "audio", "video" (default: "text")

**Response (201):**

```json
{
  "id": 1,
  "type": "text",
  "message": "Hi there!",
  "sender": {
    "id": "user123",
    "name": "John Doe",
    "role": 1
  },
  "room": {
    "id": 2,
    "name": "Personal: John Doe & Jane Smith",
    "image_url": null,
    "participant": [
      {
        "id": "user123",
        "name": "John Doe",
        "role": 1
      },
      {
        "id": "user456",
        "name": "Jane Smith",
        "role": 1
      }
    ]
  },
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### 4. Mengambil Pesan Personal

**GET** `/api/chat/personal?senderId=user123&receiverId=user456&limit=50&offset=0`

Mengambil pesan personal antara dua user.

**Query Parameters:**

- `senderId` (string, required): ID pengirim
- `receiverId` (string, required): ID penerima
- `limit` (number, optional): Jumlah pesan per halaman (default: 50)
- `offset` (number, optional): Offset untuk pagination (default: 0)

**Response (200):**

```json
{
  "room": {
    "id": 2,
    "name": "Personal: John Doe & Jane Smith",
    "image_url": null,
    "participant": [
      {
        "id": "user123",
        "name": "John Doe",
        "role": 1
      },
      {
        "id": "user456",
        "name": "Jane Smith",
        "role": 1
      }
    ]
  },
  "comments": [
    {
      "id": 1,
      "type": "text",
      "message": "Hi there!",
      "sender": {
        "id": "user123",
        "name": "John Doe",
        "role": 1
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 1
  }
}
```

### 5. Membuat Group Chat

**POST** `/api/chat/group`

Membuat group chat baru dengan participants.

**Request Body:**

```json
{
  "name": "My Group Chat",
  "imageUrl": "https://example.com/image.jpg",
  "participants": [
    {
      "id": "user123",
      "name": "John Doe",
      "role": 1
    },
    {
      "id": "user456",
      "name": "Jane Smith",
      "role": 1
    }
  ]
}
```

**Parameters:**

- `name` (string, required): Nama group chat
- `imageUrl` (string, optional): URL gambar group
- `participants` (array, optional): Array of participant objects

**Response (201):**

```json
{
  "room": {
    "id": 1,
    "name": "My Group Chat",
    "image_url": "https://example.com/image.jpg",
    "participant": [
      {
        "id": "user123",
        "name": "John Doe",
        "role": 1
      },
      {
        "id": "user456",
        "name": "Jane Smith",
        "role": 1
      }
    ]
  },
  "comments": []
}
```

### 6. Mengambil Semua Room

**GET** `/api/chat`

Mengambil semua room (group dan personal) dengan pesan terbaru.

**Response (200):**

```json
{
  "results": [
    {
      "room": {
        "id": 1,
        "name": "Group Chat",
        "image_url": null,
        "participant": [
          {
            "id": "user123",
            "name": "John Doe",
            "role": 1
          }
        ]
      },
      "comments": [
        {
          "id": 1,
          "type": "text",
          "message": "Hello everyone!",
          "sender": "user123"
        }
      ]
    }
  ]
}
```

## Error Responses

Semua endpoint dapat mengembalikan error response dengan format:

```json
{
  "error": "Error message description"
}
```

**Status Codes:**

- `400`: Bad Request - Invalid input parameters
- `403`: Forbidden - User tidak memiliki akses
- `404`: Not Found - Resource tidak ditemukan
- `500`: Internal Server Error - Server error

## Contoh Penggunaan

### Mengirim pesan ke group:

```javascript
const response = await fetch("/api/chat/message", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    roomId: 1,
    senderId: "user123",
    message: "Hello everyone!",
    type: "text",
  }),
});
```

### Mengirim pesan personal:

```javascript
const response = await fetch("/api/chat/personal", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    senderId: "user123",
    receiverId: "user456",
    message: "Hi there!",
    type: "text",
  }),
});
```

### Mengambil pesan dari room:

```javascript
const response = await fetch("/api/chat/message?roomId=1&limit=20&offset=0");
const data = await response.json();
```
