# 🚀 VIZ INDIA DIGITAL EXPO
> **24/7 Digital B2B Franchise Marketplace, AI Matchmaking & Deal Reconciliation Platform**

---

## 📌 1. Project Overview (Yeh App Kya Hai?)

**VIZ India Digital Expo** ek 24/7 virtual B2B marketplace hai jo India ke prospective **Investors / Franchisees** ko verified **Brands / Franchisors** se connect karta hai. 

Jaise physical exhibition halls (e.g. Pragati Maidan) mein Franchise Expos lagte hain, yeh platform uska poora **digital, interactive aur automated ecosystem** provide karta hai:
- **🚀 Branded Launch & Authentication Gateway (`/`):** App open karte hi official 3D geometric VIZ logo ke sath full-screen interactive launch portal khulta hai jisme 1-click persona switch, mobile OTP, aur email login available hai.
- **💬 Real-Time Direct Human-to-Human Messaging:** AI bot ko replace karke **Investor ↔ Brand Founder ↔ Admin** ke beech direct live chat system (Socket.io) banaya gaya hai. Isme image/photo sharing, typing indicators, read receipts, aur live online/offline green presence dot available hai.
- **🔔 Real-Time & In-App Notification Center:** Har activity (naya message, deal update, meeting schedule, KYC approval) par notification bell unread counter ke sath alert deta hai aur deep linking provide karta hai.
- **🏢 Brand Franchise & Deal Creation Engine:** Brand Admins bina platform admin ke wait kiye khud naye franchise listings (`/api/brands/create`) bana sakte hain jo KYC queue mein review hote hain, aur closed deals directly record (`/api/deals/create`) kar sakte hain.
- **🎬 24/7 Virtual Expo Floor:** Investors video pitch reels dekh sakte hain aur 2–4 brands ko side-by-side compare kar sakte hain.
- **📅 1-on-1 Discovery Meetings:** Investors brand leadership ke sath direct video meetings schedule aur join kar sakte hain.
- **💰 3% Platform Success Fee & GST Engine:** Har closed franchise deal par automated 3% commission + 18% GST invoice aur bank settlement reconciliation ledger maintain hota hai.
- **🍃 MongoDB Persistence & Non-Blocking Fallback:** Sara data (`Brands`, `Deals`, `Messages`, `Conversations`, `Notifications`, `Users`) MongoDB mein permanently persist hota hai with indexed collections.

---

## 🏗️ 2. Project Architecture (Folder Structure & Tech Stack)

```text
New App/
├── client-portal/     👉 Web Portal (React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Socket.io Client)
├── server/            👉 Backend API (Node.js, Express, TypeScript, Socket.io, Multer, Mongoose MongoDB)
├── mobile-app/        👉 Mobile App (React Native, Expo Router SDK 52+, Lucide-react-native)
└── README.md          👉 Complete Documentation & Architecture Guide
```

### 🛠️ Tech Stack:
| Component | Technologies Used |
| :--- | :--- |
| **Frontend Web Portal** | React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Socket.io Client, Axios |
| **Backend Server** | Node.js, Express.js, TypeScript, Socket.io, Multer file upload, JWT Authentication, Mongoose (MongoDB), In-Memory Fallback |
| **Mobile Application** | React Native, Expo Router (SDK 52+), Lucide-react-native |
| **Real-Time Communication** | Socket.io (WebSocket duplex events, conversation rooms, typing, presence) |
| **Image & Media Uploads** | Express Static Uploads (`/uploads/`) + Multer storage (URLs stored in MongoDB) |
| **Database Architecture** | MongoDB (Mongoose ORM) + Non-blocking In-Memory Store Fallback (`bufferCommands: false`) |

---

## 💬 3. Real-Time Direct Messaging System (Socket.io)

AI bot-only chat ko hata kar investor aur brand ke beech direct human communication integrate kiya gaya hai:

### ⚡ Key Capabilities:
- **1-on-1 Direct Chatting:** Investor ↔ Brand Founder direct connect hote hain (`ChatModal.tsx` & `/chats`).
- **Photo/Image Sharing:** Multer `/api/upload/image` ke through photos instant upload hoti hain aur chat mein render hoti hain.
- **Live Presence (Online/Offline):** Har user ke paas live green dot indicator dikhta hai jo Socket.io presence se real-time sync hota hai.
- **Typing Indicators:** Typing shuru karne par real-time *"Typing..."* feedback milta hai with automatic debounce.
- **Read Receipts:** Messages deliver hone aur dekhne par single/double checkmark status (`SENT`, `DELIVERED`, `SEEN`) update hota hai.
- **MongoDB Models:**
  ```ts
  // Message Model
  {
    conversationId: ObjectId,
    senderId: ObjectId,
    receiverId: ObjectId,
    text: String,
    imageUrl?: String,
    status: 'SENT' | 'DELIVERED' | 'SEEN',
    createdAt: Date
  }

  // Conversation Model
  {
    participants: [ObjectId],
    relatedBrandId?: ObjectId,
    lastMessage: String,
    lastMessageAt: Date,
    unreadCount: Map<String, Number>
  }
  ```

---

## 🔔 4. Push & In-App Notification Center

- **In-App Bell Indicator:** Top navigation bar mein live unread counter badge ke sath Notification Center (`NotificationCenter.tsx`) available hai.
- **Real-Time Push:** Jab user offline ya doosre tab mein hota hai, backend automatically `Notification` record banata hai aur `notification:new` socket event emit karta hai.
- **Deep Linking:** Notification par click karte hi direct related conversation (`/chats/:id`) ya meeting par navigation hota hai.
- **MongoDB Model:**
  ```ts
  // Notification Model
  {
    userId: ObjectId,
    type: 'MESSAGE' | 'DEAL' | 'MEETING' | 'LEAD' | 'VERIFICATION',
    title: String,
    body: String,
    deepLink?: String,
    relatedId?: ObjectId,
    isRead: Boolean,
    createdAt: Date
  }
  ```

---

## 🏢 5. Brand Franchise & Deal Creation Module

Brand Admins ko self-service tools diye gaye hain:
1. **+ Add New Franchise Listing:** Multi-step wizard (`CreateFranchiseModal.tsx`):
   - **Step 1:** Basic Info (Brand Name, Tagline, Category, FOFO/FOCO Business Model).
   - **Step 2:** Investment Details (Min/Max INR, Franchise Fee, Royalty %, Space Sq.Ft.).
   - **Step 3:** Media Upload (Logo image upload, Pitch video URL, Banner image).
   - **Step 4:** Territory & Submit (Target expansion cities, existing outlets, instant KYC queue review submission).
2. **+ Record Closed Franchise Deal:** Closed deal wizard (`CreateDealModal.tsx`):
   - Active CRM leads se investor select karein ya naya investor specify karein.
   - Closed Deal Value (e.g. ₹25,00,000) enter karne par dynamic calculation hoti hai:
     - **3% VIZ Success Fee:** ₹75,000
     - **18% GST:** ₹13,500
     - **Total Invoice Amount:** ₹88,500
   - Instant deal booking & invoice generation.
3. **My Franchise Listings Tab:** Brand Portal mein brands apni saari listings review aur monitor kar sakte hain.

---

## 📡 6. Complete API & Socket.io Reference

### 💬 Real-Time Chats (`/api/chats`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/chats` | Logged-in user ke saare active conversations fetch karein |
| `POST` | `/api/chats/start` | Nayi 1-on-1 direct conversation initialize karein |
| `GET` | `/api/chats/:conversationId/messages` | Conversation ki chat history load karein (with pagination) |
| `PUT` | `/api/chats/:conversationId/read` | Messages ko read mark karein |

### 🖼️ Media Upload (`/api/upload`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/upload/image` | Image upload karke static URL (`/uploads/...`) return karein |

### 🔔 Notifications (`/api/notifications`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/notifications` | User ke recent notifications fetch karein |
| `PUT` | `/api/notifications/:id/read` | Single notification read mark karein |
| `PUT` | `/api/notifications/mark-all-read` | Saare notifications read mark karein |

### 🏢 Brands & Franchise Management (`/api/brands`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/brands` | Expo floor ke live verified brands fetch karein |
| `GET` | `/api/brands/:id` | Single brand details & financials |
| `POST` | `/api/brands/create` | Brand naya franchise listing create kare (KYC queue submission) |
| `PUT` | `/api/brands/:id/update` | Brand apni listing update kare |
| `GET` | `/api/brands/my-listings` | Brand owner apni saari listings dekhe |

### 💵 Deals & Commission (`/api/deals`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/deals/create` | Brand directly closed deal record kare (with 3% fee + 18% GST) |
| `GET` | `/api/deals/brand/:brandId` | Brand ke recorded deals fetch karein |

### 🔌 Socket.io Real-Time Events
| Event Name | Direction | Payload / Purpose |
| :--- | :--- | :--- |
| `user:online` | Client ➡️ Server | User connect hone par presence announce karna |
| `presence:query` | Client ➡️ Server | Target user ke live online status ki query |
| `presence:status` | Server ➡️ Client | Return `{ userId, isOnline }` |
| `join_conversation` | Client ➡️ Server | Dedicated conversation room join karna |
| `send_message` | Client ➡️ Server | Naya text/photo message bhejna |
| `message:receive` | Server ➡️ Client | Conversation room mein message broadcast karna |
| `message:typing` | Client ➡️ Server / Broadcast | Live typing feedback |
| `message:read` | Client ➡️ Server / Broadcast | Read receipt update (`SEEN`) |
| `notification:new` | Server ➡️ Client | Incoming real-time push notification alert |

---

## 🚀 7. Project Ko Run Kaise Karein? (Quick Start)

### Step 1: Backend Server Start Karein
Terminal 1 mein:
```powershell
cd "c:\Users\jhasa\OneDrive\Desktop\New App\server"
npm run dev
```

### Step 2: Web Client Portal Start Karein
Terminal 2 mein:
```powershell
cd "c:\Users\jhasa\OneDrive\Desktop\New App\client-portal"
npm run dev
```
> Web Portal: `http://localhost:5173` (Direct Launch & Auth Landing Page)

---

## 📁 8. Complete File Structure Map

```text
New App/
├── README.md                              <-- Complete updated documentation
├── server/
│   ├── src/
│   │   ├── config/database.ts             <-- MongoDB connection with non-blocking fallback
│   │   ├── controllers/                   <-- Chat, Notification, Upload, Brand, Deal, Lead, Meeting, Admin
│   │   ├── models/                        <-- Chat (Message, Conversation), Notification, Brand, User, Deal, Lead, Meeting
│   │   ├── routes/                        <-- Chat, Notification, Upload, Brand, Deal, Lead, Meeting, Admin routes
│   │   ├── store/inMemoryStore.ts         <-- Active dev fallback store with messages & notifications
│   │   └── server.ts                      <-- Express & Socket.io server with real-time event handlers
│   └── uploads/                           <-- Static image storage directory for chat photos & brand media
├── client-portal/
│   ├── src/
│   │   ├── components/
│   │   │   ├── VizLogo.tsx                <-- 3D geometric crystal emblem & branding
│   │   │   ├── Navbar.tsx                 <-- Top navigation bar with Notification Center & Direct Chats
│   │   │   ├── NotificationCenter.tsx     <-- Bell dropdown with live unread badge & deep links
│   │   │   ├── ChatModal.tsx              <-- 1-on-1 human chat popup with image uploads & typing indicators
│   │   │   ├── CreateFranchiseModal.tsx   <-- Multi-step franchise listing submission wizard
│   │   │   ├── CreateDealModal.tsx        <-- Closed deal recording wizard with 3% fee + 18% GST
│   │   │   ├── BrandReelCard.tsx          <-- Video pitch reel card with 'Chat with Founder'
│   │   │   ├── CompareModal.tsx           <-- 2-4 Brand side-by-side comparison
│   │   │   └── LoginModal.tsx             <-- Persona switcher & auth modal
│   │   ├── context/
│   │   │   ├── AuthContext.tsx            <-- Auth state & persona switching
│   │   │   └── SocketContext.tsx          <-- Real-time Socket.io, presence tracking & notifications
│   │   ├── pages/
│   │   │   ├── AuthLandingView.tsx        <-- Full-app launch terminal at '/' (preserving launch UX)
│   │   │   ├── InvestorExpoView.tsx       <-- Main expo floor with 'Chat with Founder'
│   │   │   ├── BrandPortalView.tsx        <-- Brand Leads Kanban, Franchise Listings & Deal recording
│   │   │   ├── ChatInboxView.tsx          <-- Dedicated full-screen chat inbox (/chats)
│   │   │   ├── AdminDashboardView.tsx     <-- Super Admin & 3% commission reconciliation
│   │   │   └── BrandDetailView.tsx        <-- Deep-dive brand specifications & financials
│   │   ├── services/api.ts                <-- Axios clients for chat, notification, upload, brands, deals
│   │   ├── App.tsx                        <-- Main app routing & SocketProvider wrapper
│   │   └── index.css                      <-- Tailwind CSS & custom design tokens
└── mobile-app/
    ├── app/
    │   ├── (tabs)/
    │   │   ├── index.tsx                  <-- Mobile home with category & budget filters
    │   │   ├── showcase.tsx               <-- Reels-style vertical video pitches
    │   │   ├── meetings.tsx               <-- Mobile video call meetings
    │   │   ├── deals.tsx                  <-- Mobile deals tracker
    │   │   └── profile.tsx                <-- Investor profile & settings
    ├── services/api.ts                    <-- Mobile API client
    ├── package.json                       <-- Expo SDK 52 dependencies
    └── app.json                           <-- Expo app configuration
```

---

*VIZ India Digital Expo — Transforming Indian Franchise Expansion through Technology & AI.*
