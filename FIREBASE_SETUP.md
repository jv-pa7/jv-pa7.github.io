# 🔧 Configurar Firebase para Acceso Multidispositivo

La aplicación ahora soporta **Firebase Realtime Database** para compartir pantalla entre múltiples dispositivos (PC, móvil, tablet, etc.).

## Opción 1: Con Firebase ✨ (Recomendado)

### Paso 1: Crear proyecto en Firebase
1. Ve a [**Firebase Console**](https://console.firebase.google.com/)
2. Haz clic en "Nuevo proyecto"
3. Ingresa un nombre (ej: `webrtc-screen-share`)
4. Continúa sin Analytics
5. Espera a que se cree el proyecto

### Paso 2: Habilitar Realtime Database
1. En la consola, ve a **Realtime Database**
2. Haz clic en "Crear base de datos"
3. Elige ubicación: `us-central1` (o la más cercana)
4. Selecciona "Comenzar en modo prueba" 
   - ⚠️ **Importante**: Después, cambiarás a reglas seguras

### Paso 3: Configurar reglas de seguridad
1. En **Realtime Database** → **Reglas**
2. Reemplaza el contenido con esto:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true,
        ".delete": true,
        ".validate": "newData.hasChildren(['roomId', 'sharerName', 'offer'])"
      }
    }
  }
}
```

3. Haz clic en "Publicar"

### Paso 4: Obtener credenciales
1. Ve a **Configuración del proyecto** (engranaje)
2. En la pestaña **General**, busca "Tu aplicaciones web"
3. Haz clic en **Añadir app** → **Web**
4. Copia la configuración

### Paso 5: Actualizar el código
1. Abre `index.html`
2. Busca esta sección:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project.firebaseio.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

3. Reemplaza con TUS valores de Firebase
4. Guarda el archivo
5. Haz push a GitHub Pages

### Ejemplo completo:
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyA_z-kJ3vQxgY1K9pL8mN0oP1qR2sT3u4V",
    authDomain: "webrtc-screen-share.firebaseapp.com",
    databaseURL: "https://webrtc-screen-share.firebaseio.com",
    projectId: "webrtc-screen-share",
    storageBucket: "webrtc-screen-share.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:a1b2c3d4e5f6g7h8i9j0k1l2"
};
```

---

## Opción 2: Sin Firebase (Modo Local)

Si no configuras Firebase, la app funcionará en **modo local** pero solo dentro del mismo navegador/dispositivo.

### Limitaciones:
- ❌ No funciona entre dispositivos diferentes
- ❌ Solo localStorage (misma máquina)

### Para usar: Simplemente mantén `firebaseConfig` con valores por defecto

---

## 🧪 Prueba de configuración

### Compartidor (PC):
1. Abre la app
2. Selecciona "Compartir pantalla/cámara"
3. Ingresa tu nombre
4. Copia el ID de la sala

### Espectador (Móvil/Tablet):
1. Abre la app en otro dispositivo
2. Selecciona "Ver pantalla remota"
3. Ingresa el ID de la sala
4. ¡Listo! Deberías ver la pantalla del compartidor

---

## 🔒 Notas de Seguridad

- Las reglas de Firebase permiten acceso público pero **SOLO si conoces el ID de la sala**
- No guardes credenciales sensibles en el cliente
- Considera usar autenticación en producción
- Para mayor seguridad, genera IDs de sala más aleatorios

---

## ⚙️ Troubleshooting

### "Firebase no configurado"
- Verifica que los valores en `firebaseConfig` sean correctos
- Abre la consola (F12) y busca errores

### Cambios que no se sincronnizan entre dispositivos
- Asegúrate de que Firebase está habilitado
- Recarga ambos navegadores
- Verifica la conexión a internet

### Puertos bloqueados
- Firebase usa HTTPS, debería funcionar en cualquier red
- Si no funciona, intenta en tu red local

---

## 📚 Recursos

- [Firebase Docs](https://firebase.google.com/docs)
- [WebRTC](https://webrtc.org/)
- [GitHub Pages](https://pages.github.com/)
