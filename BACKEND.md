# Backend integration guide

This document is for **backend engineers** wiring real-time chat, tickets, and user data to the **ajaxter-chat** client (drawer chat widget for React.js / Next.js). The widget today loads static/demo data from `chatData.json`; your services replace that data and the `TODO` hooks in the source.

---

## 1a. Presence status (home bar: ACTIVE / AWAY / DND)

| Field | Purpose |
|-------|---------|
| `widget.presenceStatus` | Optional value from your **DB** included in chat config — initializes the status control (overrides session-only cache). |
| `widget.presenceUpdateUrl` | **`POST`** JSON: `{ "widgetId", "apiKey", "viewerUid?", "status" }` when the user changes status. Persist in your database; respond with `2xx`. |

The client still writes the last choice to `sessionStorage` as a local fallback when the server omits `presenceStatus`.

---

## 1b. Viewer blocked (spam / not in allow lists)

The config payload may include:

| Field | Type | Purpose |
|-------|------|---------|
| `widget.viewerBlocked` | `boolean` | When `true`, the widget **does not** show home, chats, tickets, or menus — only a centered message and a form to request re-enablement. |
| `users[].viewerBlocked` / `developers[].viewerBlocked` | `boolean` (optional) | When `true` on the row whose `uid` matches the current viewer (`widget.viewerUid` or React `viewer.uid`), the same blocked UI applies. |
| `widget.blockedViewerMessage` | `string` (optional) | Overrides the default copy (spam notice). |
| `widget.reenableRequestUrl` | `string` (optional) | Absolute `POST` URL. Body JSON: `{ "widgetId", "apiKey", "viewerUid?", "message" }`. |

**Server-side rule (recommended):** Set `viewerBlocked: true` when the authenticated viewer is **not** present in your allowed user list, ticket participants, or chat membership — or when they are explicitly spam-blocked. The client only reads the flag; list checks belong on the API that serves `chatData.json` (or a dedicated session endpoint).

---

## 1c. Host app identity (React `viewer` prop)

The widget accepts an optional **`viewer`** prop (`ChatWidgetViewer`): `uid`, `name`, `type` (`developer` | `user`), and optional `projectId`. These **override** `viewerUid`, `viewerName`, and `viewerType` from `chatData.json` and set `viewerProjectId` on the effective config. **`type`** drives the same UI as remote `viewerType` (e.g. staff vs end user). When **`projectId`** is set, directory and recent-chat lists only include users whose `ChatUser.project` matches exactly (your API should align `project` with the host app’s project id or label).

---

## 1. Authentication and bootstrap

### Config bootstrap (already implemented)

The widget requests configuration with:

| Mechanism | Detail |
|-----------|--------|
| **HTTP** | `GET` to the configured config URL (default base in `src/config/index.ts`) |
| **Query params** | `?key=<apiKey>&widget=<widgetId>` (matches env `REACT_APP_CHAT_API_KEY` / `NEXT_PUBLIC_CHAT_API_KEY` and `*_CHAT_WIDGET_ID`) |
| **Purpose** | Returns JSON shaped like `RemoteChatData`: `widget`, `developers`, `users`, `sampleChats`, `sampleTickets`, `blockedUsers` |

Your backend should validate `key` + `widget`, apply CORS for the embedding origins, and return the same field names the TypeScript types expect (`src/types/index.ts`).

### Recommended additional auth for APIs / WebSocket

For production, tie every request to:

- **Widget ID** (`widget.id`)
- **Viewer identity** — map `widget.viewerUid` + `widget.viewerType` (`user` | `developer`) to your user/session model
- Optional **JWT** or session cookie on REST and socket handshake

---

## 2. Data shapes (contract with the client)

Canonical definitions: **`src/types/index.ts`**.

### `ChatUser`

Used for support agents, customers, and developers in lists.

- `uid`, `name`, `email`, `mobile`, `project`, `type` (`developer` | `user`), `avatar`, `status` (`online` | `away` | `offline`), `designation`

### `ChatMessage`

Used for every bubble (text, voice, attachment).

| Field | Notes |
|-------|--------|
| `id` | Server-generated unique id |
| `senderId` | Sender’s `uid` (client uses `'me'` for local optimistic UI — normalize to real uid server-side) |
| `receiverId` | Peer `uid` |
| `text` | Body; for attachments often filename or caption |
| `timestamp` | ISO 8601 string |
| `type` | `text` \| `voice` \| `attachment` \| `emoji` |
| `status` | `sent` \| `delivered` \| `read` |
| `attachmentName`, `attachmentSize`, `attachmentUrl`, `attachmentMime` | For files; URLs should be **https** after upload, not blob URLs |
| `voiceDuration`, `voiceUrl` | Voice messages; `voiceUrl` must be a playable URL after storage |

### `Ticket`

| Field | Notes |
|-------|--------|
| `id`, `title`, `description`, `status`, `priority`, `createdAt`, `updatedAt`, `assignedTo` | Align with ticket list + detail screens |

### Block list

`blockedUsers` in config is `string[]` of **blocked user uids** (client filters lists).

---

## 3. Real-time: WebSocket (or Socket.IO) events

The client hooks contain **TODO** placeholders. Below is a **recommended event map**; names can be renamed if you keep a single mapping layer in the app.

### Room model

- **Room ID** = conversation id. Common choice: `roomId = <participantA_uid>_<participantB_uid>` sorted, or a UUID per thread stored in DB.
- When the user opens a chat with `activeUser.uid`, the client should **join** that room and **leave** when switching chats or disconnecting.

### Client → server

| Event (suggested name) | Payload | When |
|------------------------|---------|------|
| `join` | `{ roomId: string, widgetId?: string }` | User opens a 1:1 chat (`useChat` → `selectUser`) |
| `leave` | `{ roomId: string }` | User leaves chat / switches peer |
| `message` | Full `ChatMessage` (or your DTO + file refs after upload) | User sends text / voice / attachment metadata |
| `typing_start` | `{ roomId, userId }` | Optional typing indicator |
| `typing_stop` | `{ roomId, userId }` | Optional |
| `chat:pause` / `chat:resume` | `{ roomId, targetUserId, paused: boolean }` | Staff pauses chat (mirror state to both sides) |
| `chat:report` | `{ roomId, reporterId, reason? }` | Report chat |
| `user:block` / `user:unblock` | `{ blockedUid }` | Block / unblock |
| `ticket:create` | `{ title, description, priority }` | New ticket (or use REST only) |
| `transfer` | `{ fromRoomId, toUserId, note? }` | Developer transfer (client adds a system message) |

### Server → client

| Event (suggested name) | Payload | Purpose |
|------------------------|---------|---------|
| `message` | `ChatMessage` | New inbound message (any participant) |
| `message:ack` | `{ messageId, status: 'delivered' \| 'read' }` | Delivery / read receipts |
| `chat:paused` | `{ roomId, paused: boolean }` | Sync pause state |
| `ticket:created` | `Ticket` | Confirm creation |
| `ticket:updated` | `Ticket` or partial | List + detail refresh |
| `error` | `{ code, message }` | Auth / validation / rate limit |

### Implementation notes (`src/hooks/useChat.ts`)

- After `join`, subscribe to `message` for that room (or globally filter by `roomId`).
- On `sendMessage`, emit `message` with the payload the server persists; optionally wait for ack to set `id` / `status`.

---

## 4. WebRTC signalling (voice / video calls)

Signalling is **not** implemented over the network yet (`src/hooks/useWebRTC.ts`).

### Client → server (suggested)

| Event | Payload |
|-------|---------|
| `call-offer` | `{ offer: RTCSessionDescriptionInit, to: peerUid, from: viewerUid, callId? }` |
| `call-answer` | `{ answer: RTCSessionDescriptionInit, to: peerUid, callId? }` |
| `ice-candidate` | `{ candidate: RTCIceCandidateInit, to: peerUid, callId? }` |
| `call-end` | `{ callId, to?: peerUid }` |

### Server responsibility

- Route offer/answer/ICE to the correct peer (same widget, authorized users).
- Optional TURN credentials if STUN-only is insufficient.

---

## 5. REST API (recommended alongside or instead of some socket events)

These are **not** wired in the package yet; the UI expects data from `chatData.json` or in-memory state. Expose REST (or GraphQL) for:

| Operation | Method / path (example) | Response |
|-----------|-------------------------|----------|
| List users for widget | `GET /widgets/:widgetId/users?role=…` | `ChatUser[]` |
| Chat history | `GET /widgets/:widgetId/rooms/:roomId/messages?before=&limit=` | `ChatMessage[]` |
| Upload attachment | `POST /widgets/:widgetId/uploads` (multipart) | `{ url, name, size, mimeType }` |
| List tickets | `GET /widgets/:widgetId/tickets` | `Ticket[]` |
| Ticket detail | `GET /widgets/:widgetId/tickets/:ticketId` | `Ticket` |
| Create ticket | `POST /widgets/:widgetId/tickets` | `Ticket` |
| Update ticket | `PATCH /widgets/:widgetId/tickets/:ticketId` | `Ticket` |
| Recent conversations | `GET /widgets/:widgetId/recent-chats` | Summary rows matching `RecentChat` shape in UI |
| Block list | `GET/PATCH /widgets/:widgetId/blocks` | `string[]` (uids) |

Use the same **api key / widget id** (and user auth) on every call.

---

## 6. Feature checklist for backend

| Feature | Backend needs |
|---------|----------------|
| Send / receive messages | WebSocket `message` + persistence; optional `message:ack` |
| User lists (Support / New Conversation) | `ChatUser[]` from config or `GET /users` |
| Chat history | `GET` history or initial payload in `join` response |
| Tickets CRUD | REST and/or socket; IDs stable for deep links |
| Pause / report / block | Dedicated endpoints or socket events + persistence |
| Transfer | Message insert + optional `transfer` event |
| Voice / file | Upload endpoint; store URLs in `ChatMessage` |
| Calls | WebRTC signalling events + optional call records |
| Session restore | Client uses `sessionStorage` locally; server can ignore or add `GET /session` later |

---

## 7. Files to patch on the frontend when integrating

| File | Role |
|------|------|
| `src/hooks/useChat.ts` | Connect `join` / `message` emit & listeners |
| `src/hooks/useWebRTC.ts` | Connect ICE / offer / answer |
| `src/hooks/useRemoteConfig.ts` | Optionally merge live API responses with config |
| `src/components/ChatWidget.tsx` | Tickets / recent chats from API instead of JSON only |

---

## 8. Versioning

Package version: see **`package.json`**. When you change DTOs, bump API version or use feature flags in `widget` config so older widgets stay compatible.

---

For embedding and env setup, see the main **[README.md](./README.md)**.
