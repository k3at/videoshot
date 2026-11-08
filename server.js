/* ================================================================
   videoshot — خادم الإشارات (Signaling Server)
   يشغّل WebSocket لنقل عروض WebRTC بين المتصفحات.
   ================================================================ */

const WebSocket = require('ws');
const http = require('http');

const PORT = process.env.PORT || 3001;

const server = http.createServer();
const wss = new WebSocket.Server({ server });

// rooms: Map<roomId, Set<ws>>
// clients: Map<ws, { clientId, roomId, name }>
const rooms = new Map();
const clients = new Map();

function sendTo(ws, message) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function broadcastToRoom(roomId, message, senderWs = null) {
  const members = rooms.get(roomId);
  if (!members) return;
  const data = JSON.stringify(message);
  members.forEach((ws) => {
    if (ws !== senderWs && ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });
}

function findWsByClientId(roomId, targetClientId) {
  const members = rooms.get(roomId);
  if (!members) return null;
  for (const ws of members) {
    const c = clients.get(ws);
    if (c && c.clientId === targetClientId) return ws;
  }
  return null;
}

function leaveRoom(ws) {
  const client = clients.get(ws);
  if (!client || !client.roomId) return;

  const roomId = client.roomId;
  const members = rooms.get(roomId);
  if (members) {
    members.delete(ws);
    if (members.size === 0) {
      rooms.delete(roomId);
    } else {
      broadcastToRoom(
        roomId,
        { type: 'peer-left', from: client.clientId, room: roomId },
        ws
      );
    }
  }
  client.roomId = null;
}

wss.on('connection', (ws) => {
  const clientId = 'c_' + Math.random().toString(36).slice(2, 9);
  clients.set(ws, { clientId, roomId: null, name: 'زائر' });

  ws.on('message', (raw) => {
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      return;
    }

    const { type, room, to, name, sdp, candidate, text } = data;
    const client = clients.get(ws);
    if (!client) return;

    switch (type) {
      case 'join': {
        if (client.roomId) {
          leaveRoom(ws);
        }
        client.roomId = room;
        client.name = name || 'زائر';

        if (!rooms.has(room)) rooms.set(room, new Set());
        rooms.get(room).add(ws);

        // إNotify الآخرين بانضمام زميل جديد
        broadcastToRoom(
          room,
          { type: 'peer-joined', from: clientId, name: client.name, room },
          ws
        );

        // أرسل قائمة الزملاء الحاليين حتى يبدأ هذا العميل بالاتصال بهم
        const members = rooms.get(room);
        const peers = [];
        members.forEach((mws) => {
          if (mws !== ws) {
            const m = clients.get(mws);
            if (m) peers.push({ id: m.clientId, name: m.name });
          }
        });

        sendTo(ws, { type: 'joined', id: clientId, room, peers });
        break;
      }

      case 'offer':
      case 'answer':
      case 'candidate': {
        if (!room) break;
        const targetWs = findWsByClientId(room, to);
        if (targetWs) {
          sendTo(targetWs, {
            type,
            from: clientId,
            name: client.name,
            sdp,
            candidate,
          });
        }
        break;
      }

      case 'chat': {
        if (!room) break;
        broadcastToRoom(
          room,
          { type: 'chat', from: clientId, name: client.name, text },
          ws
        );
        break;
      }

      case 'leave': {
        leaveRoom(ws);
        break;
      }
    }
  });

  ws.on('close', () => {
    leaveRoom(ws);
    clients.delete(ws);
  });

  ws.on('error', () => {
    leaveRoom(ws);
    clients.delete(ws);
  });
});

server.listen(PORT, () => {
  console.log(`Signaling server running on ws://localhost:${PORT}`);
});
