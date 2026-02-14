# Correcciones para Video en Móvil - WebRTC

## Problemas Identificados

### 1. **Error Crítico en `addTrack()` (PRINCIPAL)**
**Ubicación**: Línea 536 (antes)
```javascript
// ❌ INCORRECTO
sharerPeerConnection.addTrack(track, localStream);
```

**Problema**: El segundo parámetro de `addTrack()` debe ser un array de streams, no un objeto stream directo.

**Solución Aplicada**:
```javascript
// ✅ CORRECTO
const sender = sharerPeerConnection.addTrack(track);
```

### 2. **Configuración de Audio en Móviles**
**Problema**: En móviles, solicitar audio junto con video mediante `getUserMedia()` puede causar problemas con la captura.

**Solución**: Desactivar audio en móviles y usar solo video
```javascript
if (isMobile) {
    localStream = await navigator.mediaDevices.getUserMedia({
        video: mobileConfig.video,
        audio: false  // Cambio: era mobileConfig.audio
    });
}
```

### 3. **Falta de Validación del Track**
**Problema**: El track podría no estar en estado "live" inmediatamente después de `getUserMedia()`.

**Solución**: Agregada validación y logs detallados del estado del track
```javascript
const videoTrack = localStream.getVideoTracks()[0];
if (videoTrack) {
    console.log('Video track estado:', {
        enabled: videoTrack.enabled,
        readyState: videoTrack.readyState,
        settings: videoTrack.getSettings()
    });
}
```

### 4. **Parámetros Faltantes en `createOffer()`**
**Problema**: Sin especificar explícitamente, `createOffer()` podría no incluir video en la SDP.

**Solución**:
```javascript
const offer = await sharerPeerConnection.createOffer({
    offerToReceiveAudio: false,
    offerToReceiveVideo: true
});
```

### 5. **Manejo Incorrecto de Streams en Espectador**
**Problema**: Crear un `MediaStream` vacío y agregar tracks manualmente puede fallar en algunos navegadores.

**Solución**: Usar el stream que viene en el evento 'track'
```javascript
viewerPeerConnection.addEventListener('track', (event) => {
    // Usar streams que vienen con el evento (preferible)
    if (event.streams && event.streams.length > 0) {
        remoteStream = event.streams[0];
    } else {
        // Fallback
        remoteStream.addTrack(event.track);
    }
});
```

### 6. **CSS Insuficiente para Móviles**
**Problema**: El video remoto podría no ocupar el espacio correcto en móviles.

**Solución**: Agregadas media queries y propiedades CSS mejoradas
```css
@media (max-width: 768px) {
    video {
        width: 100%;
        max-height: 70vh;
        object-fit: contain;
    }
}
```

## Cambios Realizados

### Archivo: `index.html`

1. ✅ Línea 398: Agregado `facingMode: 'user'` a mobileConfig
2. ✅ Línea 500-540: Mejorada lógica de `getUserMedia()` con validación
3. ✅ Línea 536: Corregido `addTrack(track)` sin parámetro incorrecto
4. ✅ Línea 625: Agregados parámetros a `createOffer()`
5. ✅ Línea 900: Mejorado manejo de tracks en espectador
6. ✅ Línea 104-113: Mejorado CSS para video en móviles

## Hipótesis del Problema Original

El problema se debía principalmente a que:

1. **`framesSent: 0`** sugería que aunque el track se agregaba, no se codificaba
2. Esto ocurría porque el parámetro incorrecto en `addTrack()` podría estar interfiriendo con la negociación de codecs
3. La falta de audio en móviles evitaba problemas de sincronización
4. Los paramétros explícitos en `createOffer()` aseguran que la SDP incluya correctamente el video

## Cómo Probar

### Caso 1: Móvil como Compartidor
1. Abre la app en un dispositivo móvil
2. Selecciona "Compartir pantalla"
3. Ingresa tu nombre y haz clic en "Compartir"
4. Copia el ID de la sala
5. Abre la app en otro dispositivo y conecta como espectador
6. Verifica que el video se transmita (framesSent > 0)

### Caso 2: Escritorio como Compartidor, Móvil como Espectador
1. Abre la app en un escritorio
2. Selecciona "Compartir pantalla" y elige una ventana
3. Copia el ID generado
4. Abre la app en móvil y conecta como espectador
5. Verifica que la pantalla aparezca en el móvil

## Logs a Verificar

```
[MÓVIL] Video track estado: { enabled: true, readyState: "live", ... }
[COMPARTIDOR] Track agregado al transceiver: { mid: "0", track: "video", trackState: "live" }
STATS SHARER outbound-rtp video: { bytesSent: > 0, framesSent: > 0 }
[ESPECTADOR] Track REMOTO RECIBIDO: video state: live
STATS inbound-rtp video: { bytesReceived: > 0, framesDecoded: > 0 }
```

Si `framesSent` y `bytesReceived` son > 0, el video se está transmitiendo correctamente.

## Recomendaciones Adicionales

Si aún hay problemas:

1. **Verificar navegador**: Safari en iOS puede requerir configuración especial
2. **Verificar HTTPS**: Algunos navegadores requieren HTTPS para acceso a cámara/micrófono
3. **Verificar permisos**: Asegurar que se otorguen permisos de cámara
4. **Revisar consola**: Los logs detallados ahora facilitan diagnosticar dónde falla

## Cambios Siguientes Sugeridos

1. Agregar un botón para cambiar entre cámara frontal/trasera en móvil
2. Agregar control de bitrate para conexiones lentas
3. Implementar reintento automático si la conexión falla
4. Agregar indicador visual de estado de la conexión
