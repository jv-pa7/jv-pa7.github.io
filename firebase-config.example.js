// 🔐 EJEMPLO DE CONFIGURACIÓN - Crear firebase-config.js basado en esto
// ⚠️ NO VERSIONARESTE en git si contiene keys secretas

// Opción 1: Si usas Firebase con API Key pública (para cliente)
// Puedes exponer esta key porque Firebase Rules la protegen
window.FIREBASE_CONFIG = {
    apiKey: "AIzaSyAGqWW1KhV1f6N2LRfpNMsZjNWr_AQNN68",
    databaseURL: "https://webrdp-4f0c6-default-rtdb.europe-west1.firebasedatabase.app"
};

// Opción 2: Si migraste a backend (Node.js)
// Entonces esta será la URL del servidor, no de Firebase
// window.BACKEND_CONFIG = {
//     apiUrl: "https://tu-servidor.com/api"
// };
