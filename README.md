# 🖥️ Escritorio Remoto WebRTC - Guía de Configuración

Aplicación de escritorio remoto basada en WebRTC con soporte multidispositivo vía Firebase Realtime Database.

## ⚡ Inicio Rápido

### 1. Clonar el repositorio
```bash
git clone https://github.com/jv-pa7/jv-pa7.github.io.git
cd jv-pa7.github.io
```

### 2. Configuración de Firebase (Opcional)

Para acceso **multidispositivo** (PC ↔ Móvil):

```bash
cp firebase-config.example.js firebase-config.js
```

El archivo `firebase-config.js` se agregó a `.gitignore` para evitar publicar credenciales.

### 3. Abrir en navegador
```bash
# Localmente
open index.html

# O usar un servidor HTTP
npx http-server
```

## 🔐 Seguridad: Opciones para proteger la API Key

### Opción A: Firebase Rules (Recomendado para MVP)
**Ventaja**: Rápido, funciona sin cambios en el código  
**Desventaja**: API Key visible en el HTML

1. Ir a Firebase Console
2. Realtime Database → Rules
3. Pegar:
```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

### Opción B: Backend Node.js + Express (RECOMENDADO para Producción)
**Ventaja**: Máxima seguridad, API Key nunca sale del servidor  
**Desventaja**: Requiere servidor Node.js

#### Setup:

```bash
mkdir backend && cd backend
npm init -y
npm install express firebase-admin cors dotenv
```

**Crear `.env`**:
```
FIREBASE_DATABASE_URL=https://webrdp-4f0c6-default-rtdb.europe-west1.firebasedatabase.app
PORT=3000
```

**server.js**:
```javascript
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Usar credenciales de serviceAccountKey.json
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = admin.database();

// El cliente llama a estos endpoints en lugar de Firebase directo
app.post('/api/rooms/:roomId/offer', async (req, res) => {
    try {
        await db.ref(`rooms/${req.params.roomId}`).update({
            offer: req.body.offer,
            sharerName: req.body.sharerName
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/rooms/:roomId', async (req, res) => {
    try {
        const snapshot = await db.ref(`rooms/${req.params.roomId}`).once('value');
        res.json(snapshot.val());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`✅ Servidor escuchando puerto ${process.env.PORT}`);
});
```

**Actualizar HTML** para usar backend:
```javascript
// Cambiar inicialización
const API_BASE = 'http://localhost:3000/api';

// En lugar de firebase.database(), usar fetch:
async function saveOffer(roomId, offer) {
    return fetch(`${API_BASE}/rooms/${roomId}/offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offer)
    });
}
```

**Desplegar**:
- **Heroku**: `npx heroku login && heroku create && git push heroku main`
- **Railway**: Conectar repo, agregar vars de entorno
- **Render**: Similar a Railway
- **AWS EC2**: `npm start` en instancia pequeña

## 🚀 Características

- ✅ Compartir **pantalla completa** (PC/Mac)
- ✅ Compartir **cámara** (móviles/escritorio)
- ✅ **Multidispositivo**: PC ↔ Móvil en tiempo real
- ✅ **Sin JSON**: Interface simple (solo copiar/pegar ID)
- ✅ **Firebase Realtime**: Sincronización automática
- ✅ **ICE Candidates**: Intercambio bidireccional
- ✅ **Fallback Local**: localStorage si Firebase falla
- ✅ **IDs cortos**: 5 caracteres (ej: A3XKQ)

## 🐛 Debugging

Abre **Console (F12)** y busca:

### ✅ Éxito
```
🎧 PRE-registrando listener para candidates
✅ .once(value) completado
🎧 Registrando .on(child_added)
📥 🔔 .on(child_added) DISPARÓ!
✅ ✓ GUARDADO en Firebase
✅ STATS SHARER outbound-rtp video: {bytesSent: > 0, framesSent: > 0}
```

### ❌ Problemas
```
❌ Error en .on(child_added): → Firebase issue
⚠️ Sin inbound-rtp video → ICE candidates no llegan
✅ STATS outbound-rtp video: {bytesSent: 0} → No hay conexión de medios
⚠️ Sin candidate-pair o ICE stuck en "new": la red entre pares no permite
    conexión directa. Añade un servidor TURN o prueba con ambos equipos
    en la misma LAN.
```

## 📊 Monitoreo de Rendimiento

El app reporta stats cada 2 segundos:

**Sharer** debe mostrar:
- `bytesSent` > 0 (actualmente 0 = PROBLEMA)
- `framesSent` > 0

**Viewer** debe mostrar:
- `bytesReceived` > 0
- `framesDecoded` > 0
- `candidate-pair succeeded` (estado EXITO del ICE)

## ❓ Solución de Problemas

### "bytesSent: 0"
**Causa**: Video no se transmite  
**Debugging**:
1. ¿Aparece `candidate-pair succeeded`? Si no → ICE candidates fallando
2. Revisar Console para `📥 🔔 .on(child_added) DISPARÓ!`
3. Si no aparece → El listener `.on()` no funciona

### "Sin inbound-rtp video"
**Causa**: El viewer no recibe datos de video  
**Debugging**:
1. Revisar que sharer tenga `bytesSent` > 0
2. Revisar que viewer tenga `candidate-pair succeeded`
3. Abrir DevTools → Network → Ver req a Firebase

### Conexión a Firebase falla
**Soluciones**:
1. Verificar firebaseConfig tiene URLs correctas
2. Revisar Firebase Console → Realtime Database → Rules
3. Verificar que `db` no sea null: `console.log(window.db)`
4. Si usa backend: verificar que servidor está corriendo

## 📱 Dispositivos Soportados

- ✅ Chrome/Edge (Windows, Mac, Linux)
- ✅ Safari (Mac, iOS 14+)
- ✅ Firefox (todos)
- ✅ Samsung Browser (Android)
- ❌ IE11 (WebRTC no soportado)

## 📝 Estructura de Carpetas

```
.
├── index.html                 # App principal (SPA)
├── firebase-config.js         # Config (gitignored)
├── firebase-config.example.js # Ejemplo de config
├── .gitignore                 # Evita publicar keys
├── README.md                  # Este archivo
├── LICENSE                    # MIT
└── backend/                   # Opcional: servidor Node.js
    ├── server.js
    ├── .env
    └── package.json
```

## 🔗 Referencias

- [WebRTC MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [Firebase Realtime Database](https://firebase.google.com/docs/database)
- [Firebase Rules Documentation](https://firebase.google.com/docs/database/security)

## 📄 Licencia

MIT License