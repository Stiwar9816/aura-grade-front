# Plan de integración de sesiones Redis — Backend y Frontend

**Proyecto:** Aura Grade  
**Fecha de corte:** 2026-07-25  
**Audiencia:** equipos Backend, Frontend, DevOps y QA  
**Estado:** propuesta lista para implementación coordinada

## 1. Objetivo

Reemplazar el JWT persistido como sesión autocontenida por un identificador de
sesión opaco respaldado por Redis, manteniendo a Next.js como BFF (Backend for
Frontend).

El navegador debe comunicarse únicamente con Next.js. Next.js administra la
cookie `HttpOnly` y reenvía el identificador opaco al backend. Redis y el
backend son la fuente de verdad de la sesión.

```text
Navegador
   │ Cookie HttpOnly
   ▼
Next.js BFF
   │ Authorization: Bearer <opaque-session-token>
   ▼
Backend REST / GraphQL
   │ hash(sessionToken)
   ▼
Redis
```

## 2. Estado actual del frontend

El frontend tiene implementado:

- Login, registro, logout y lectura de sesión mediante Route Handlers de
  Next.js.
- Cliente privado único para REST y GraphQL que añade `X-BFF-Secret`.
- Cookie `HttpOnly`, `Secure` en producción y `SameSite=Lax`.
- Cookie que contiene únicamente el identificador opaco de Redis.
- Restauración de la sesión mediante `GET /api/auth/me`.
- Revocación backend durante logout y endpoint BFF para logout-all.
- Proxy GraphQL en `/api/graphql`.
- Apollo Client apuntando únicamente al proxy del mismo origen.
- Soporte multipart para entrega de archivos.
- Protección básica de origen para solicitudes mutables.
- Eliminación del token y del usuario autenticado de `localStorage`.
- Propagación de `X-Request-ID`, `traceparent` y `Retry-After`.
- Tratamiento separado de `UNAUTHENTICATED`, `FORBIDDEN`, `429` y `503`.
- Deduplicación de solicitudes simultáneas a `/auth/me`.

### Trabajo restante después de F1–F4

1. Añadir la interfaz visual de “Cerrar todas las sesiones”.
2. Añadir la operación administrativa de revocación por usuario.
3. Incorporar middleware/layout de servidor para protección inicial cuando
   sea viable.
4. Añadir pruebas automatizadas unitarias, de integración y E2E.
5. Configurar en producción `AURA_GRADE_BFF_SECRET` con el mismo valor que
   `BFF_SHARED_SECRET`.
6. Retirar el alias backend `token` y desactivar JWT legado después de la
   ventana de compatibilidad.

## 3. Decisiones de arquitectura

### Responsabilidad de Next.js

- Recibir credenciales desde el navegador.
- Establecer y eliminar la cookie `HttpOnly`.
- Validar `Origin`/CSRF en las solicitudes del navegador.
- Reenviar el identificador de sesión al backend.
- No permitir que JavaScript lea el identificador.
- No decidir permisos ni roles.

### Responsabilidad del backend

- Validar credenciales.
- Crear identificadores de sesión opacos.
- Guardar, validar, renovar y revocar sesiones en Redis.
- Consultar el usuario vigente y comprobar `isActive`.
- Autorizar cada endpoint y resolver GraphQL.
- Aplicar expiración absoluta y por inactividad.
- Aplicar throttling y registrar eventos de seguridad.

### Responsabilidad de Redis

- Mantener sesiones compartidas entre instancias del backend.
- Expirar claves automáticamente mediante TTL.
- Permitir revocación inmediata.
- No almacenar el identificador original; solo su hash.

### Decisión sobre cookies

El backend no debe establecer cookies directamente. La cookie pertenece al
dominio del frontend y la administra Next.js. El backend entrega el
identificador únicamente a Next mediante una comunicación servidor a servidor.

## 4. Contrato REST requerido

La ruta base asumida es `/api/auth`. Si el backend usa otra ruta, debe
configurarse mediante `API_URL` en el frontend.

### 4.1 Login

```http
POST /api/auth/login
Content-Type: application/json
```

Solicitud:

```json
{
  "email": "docente@auragrade.com",
  "password": "********",
  "rememberMe": false
}
```

Respuesta `200`:

```json
{
  "user": {
    "id": "user-id",
    "name": "Ana",
    "last_name": "Pérez",
    "email": "docente@auragrade.com",
    "role": "Docente",
    "phone": 3000000000,
    "isActive": true,
    "document_type": "Cedula de ciudadania",
    "document_num": 123456789,
    "courses": [{"id": "course-id"}],
    "assignments": []
  },
  "sessionToken": "opaque-random-value",
  "token": "opaque-random-value",
  "expiresAt": "2026-07-25T23:00:00.000Z"
}
```

Durante la migración, `token` debe ser un alias temporal de `sessionToken`
porque el frontend actual todavía lee `token`. No debe ser un JWT.

Errores:

- `400`: entrada inválida.
- `401`: credenciales incorrectas, con mensaje genérico.
- `403`: usuario desactivado, si se desea distinguirlo.
- `429`: límite de intentos excedido.
- `503`: Redis o dependencia crítica no disponible.

### 4.2 Registro

```http
POST /api/auth/register
Content-Type: application/json
```

Solicitud:

```json
{
  "name": "Ana",
  "last_name": "Pérez",
  "email": "ana@auragrade.com",
  "password": "********",
  "role": "Estudiante",
  "document_type": "Cedula de ciudadania",
  "document_num": 123456789,
  "phone": 3000000000
}
```

La respuesta debe utilizar el mismo formato de login:

```json
{
  "user": {},
  "sessionToken": "opaque-random-value",
  "token": "opaque-random-value",
  "expiresAt": "2026-07-25T23:00:00.000Z"
}
```

### 4.3 Usuario de la sesión

```http
GET /api/auth/me
Authorization: Bearer <opaque-session-token>
Cache-Control: no-store
```

Respuesta `200`:

```json
{
  "user": {
    "id": "user-id",
    "name": "Ana",
    "last_name": "Pérez",
    "email": "ana@auragrade.com",
    "role": "Docente",
    "phone": 3000000000,
    "isActive": true,
    "courses": [{"id": "course-id"}],
    "assignments": []
  }
}
```

Respuesta para sesión ausente, expirada o revocada:

```http
HTTP/1.1 401 Unauthorized
```

```json
{
  "code": "UNAUTHENTICATED",
  "message": "Sesión inválida o expirada."
}
```

Redis no disponible debe producir `503`, no `401`. Un fallo temporal de
infraestructura no debe confundirse con credenciales inválidas.

### 4.4 Logout de la sesión actual

```http
POST /api/auth/logout
Authorization: Bearer <opaque-session-token>
```

Debe eliminar la clave Redis correspondiente. La operación debe ser
idempotente:

```json
{
  "success": true
}
```

Si la sesión ya no existe, el endpoint puede responder igualmente `200`.

### 4.5 Logout de todos los dispositivos

```http
POST /api/auth/logout-all
Authorization: Bearer <opaque-session-token>
```

Respuesta:

```json
{
  "success": true,
  "revokedSessions": 3
}
```

También puede implementarse incrementando `authVersion` en el usuario. Toda
sesión debe conservar el valor de `authVersion` con el que fue creada y
rechazarse cuando ya no coincida.

## 5. Contrato GraphQL

Next enviará:

```http
POST /graphql
Authorization: Bearer <opaque-session-token>
```

El guard GraphQL debe:

1. Extraer el identificador del encabezado.
2. Calcular su hash.
3. Buscar la sesión en Redis.
4. comprobar expiración absoluta e inactividad.
5. Cargar el usuario desde la base de datos.
6. Comprobar `isActive` y `authVersion`.
7. Adjuntar `user` y `session` al contexto GraphQL.
8. Renovar el TTL sin superar la expiración absoluta.

### Códigos GraphQL obligatorios

Sesión ausente, inválida, expirada o revocada:

```json
{
  "errors": [
    {
      "message": "Sesión inválida o expirada.",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

Sesión válida, pero permiso insuficiente:

```json
{
  "errors": [
    {
      "message": "No tienes permisos para esta operación.",
      "extensions": {
        "code": "FORBIDDEN"
      }
    }
  ]
}
```

`FORBIDDEN` no debe invalidar ni eliminar la sesión.

## 6. Modelo Redis recomendado

Generar el identificador con un CSPRNG:

```ts
const sessionToken = randomBytes(32).toString("base64url");
```

Guardar únicamente su hash:

```ts
const sessionHash = createHash("sha256")
  .update(sessionToken)
  .digest("hex");

const key = `session:${sessionHash}`;
```

Contenido mínimo:

```json
{
  "userId": "user-id",
  "createdAt": 1784995200000,
  "lastActivityAt": 1784995200000,
  "absoluteExpiresAt": 1785024000000,
  "rememberMe": false,
  "authVersion": 4
}
```

No almacenar:

- Contraseña o hash de contraseña.
- Perfil académico.
- Entregas, cursos o rúbricas.
- Identificador de sesión sin hash.
- JWT alternativo.

### TTL sugerido

| Escenario | Inactividad | Expiración absoluta |
|---|---:|---:|
| Sesión normal | 30 minutos | 8 horas |
| Recordarme | 7 días | 30 días |
| Administrador | 15 minutos | 4 horas |

El TTL efectivo debe ser:

```text
min(TTL de inactividad, tiempo restante hasta expiración absoluta)
```

No es necesario renovar Redis en cada consulta si produce demasiadas
escrituras. Puede actualizarse `lastActivityAt` y el TTL como máximo una vez
cada 1–5 minutos por sesión.

## 7. Invalidación obligatoria

El backend debe invalidar la sesión actual o todas las sesiones cuando:

- El usuario cierra sesión.
- Cambia la contraseña.
- Se desactiva la cuenta.
- Cambia el rol o los permisos.
- Un administrador revoca accesos.
- Se detecta una sesión comprometida.

Se recomienda `authVersion` para invalidación global:

1. El usuario tiene `authVersion` en base de datos.
2. La sesión copia ese valor al crearse.
3. Cada validación compara ambos valores.
4. Cambiar contraseña, rol o estado incrementa `authVersion`.

## 8. Throttler ya existente: configuración requerida

| Operación | Límite recomendado | Clave |
|---|---:|---|
| Login | 5/minuto | IP + email normalizado |
| Recuperación | 3/15 minutos | IP + email normalizado |
| Registro | 5/hora | IP |
| Logout | 30/minuto | sesión |
| `/auth/me` | 120/minuto | sesión |

Requisitos adicionales:

- Responder `429` y, si es posible, `Retry-After`.
- No revelar si un correo existe.
- Agregar retraso progresivo ante intentos fallidos.
- Compartir el almacenamiento del throttler entre instancias.
- No usar solamente la IP del BFF como clave.

### IP real detrás de Next

El backend verá la IP de Next si no existe configuración adicional. Backend,
Frontend y DevOps deben acordar:

1. Qué proxy sobrescribe de forma confiable `X-Forwarded-For`.
2. Qué saltos de proxy son confiables.
3. Cómo Next reenviará una IP ya validada.
4. Que el backend ignore encabezados de IP provenientes de orígenes que no
   sean el BFF o el proxy oficial.

Hasta resolverlo, combinar email normalizado con límites globales conservadores
evita que todos los usuarios compartan únicamente la IP de Next.

## 9. Cambios de integración en el frontend

Los cambios F1–F7 están implementados. F8 conserva pendiente únicamente la
decisión de infraestructura sobre IP confiable.

### F1. Propagar `rememberMe` — completado

Archivo:

```text
src/app/api/auth/login/route.ts
```

Agregar `rememberMe` al cuerpo enviado a `/auth/login`.

### F2. Adoptar `sessionToken` — completado

Login y registro deben aceptar `sessionToken`. Durante la transición conservar
el fallback a `token`.

### F3. Simplificar la cookie — completado

Cuando Redis sea la fuente de verdad:

- La cookie debe contener solamente el identificador opaco.
- No debe contener snapshot del usuario.
- Puede eliminarse el cifrado AES del payload.
- `AUTH_SESSION_SECRET` dejará de ser necesario para este flujo.
- La cookie conserva `HttpOnly`, `Secure`, `SameSite=Lax` y `Path=/`.

El identificador sigue siendo un secreto y nunca debe retornarse al cliente
React.

### F4. Validar sesión con `/auth/me` — completado

```text
src/app/api/auth/session/route.ts
```

Debe:

1. Leer la cookie.
2. Llamar a `/api/auth/me`.
3. Retornar el usuario vigente.
4. Eliminar la cookie solo ante `401`.
5. Conservarla y retornar `503` ante Redis/backend temporalmente indisponible.

Debe eliminarse el `PATCH` que modifica el snapshot local de usuario. Después
de actualizar el perfil mediante GraphQL, el frontend vuelve a consultar
`/auth/me`.

### F5. Revocar Redis durante logout — completado

```text
src/app/api/auth/logout/route.ts
```

Debe:

1. Leer el identificador de la cookie.
2. Llamar a `/api/auth/logout`.
3. Eliminar la cookie incluso si la revocación devuelve un error.
4. Registrar el fallo de revocación sin registrar el identificador.

### F6. Corregir `FORBIDDEN` — completado

```text
src/app/api/graphql/route.ts
src/lib/apolloClient.ts
```

- `UNAUTHENTICATED`: eliminar cookie y dirigir a login.
- `FORBIDDEN`: conservar sesión y mostrar acceso denegado.
- `503`: conservar sesión y mostrar indisponibilidad temporal.

### F7. Alinear expiración de cookie y Redis — completado

El backend debe retornar `expiresAt`. Next no debe establecer una cookie que
viva más que la expiración absoluta de Redis.

### F8. Propagar trazabilidad — parcial

Next debe reenviar o crear:

- `X-Request-ID`
- `traceparent`, si existe OpenTelemetry
- IP validada según la decisión de infraestructura

Nunca debe reenviar al backend una cabecera `Authorization` enviada por el
navegador. Next siempre construye la suya desde la cookie.

## 10. Seguridad entre BFF y backend

Si el backend no está limitado a una red privada, agregar autenticación de
servicio:

- mTLS, preferido; o
- `BFF_SHARED_SECRET` rotatorio; o
- identidad administrada por la infraestructura.

El backend no debe confiar en `X-Forwarded-For`, `X-Request-ID` ni encabezados
internos provenientes de Internet.

CORS no es la defensa principal porque el navegador no llama al backend. La
red, el gateway y la autenticación de servicio deben restringir el acceso.

## 11. Observabilidad

Registrar:

- Creación de sesión.
- Login exitoso y fallido.
- Revocación actual y global.
- Sesión expirada.
- Sesión inválida.
- Cambio de `authVersion`.
- Usuario desactivado con sesión activa.
- Redis no disponible.

No registrar:

- Identificador de sesión.
- Cookie.
- Contraseña.
- Encabezado `Authorization`.

Para correlación se puede registrar un prefijo del hash de la sesión, por
ejemplo los primeros 10–12 caracteres.

Métricas sugeridas:

- `auth_login_success_total`
- `auth_login_failure_total`
- `auth_session_created_total`
- `auth_session_invalid_total`
- `auth_session_revoked_total`
- `auth_redis_error_total`
- latencia p50/p95/p99 de validación de sesión

## 12. Orden de implementación y despliegue

### Fase 0 — Contrato y pruebas

- Aprobar este contrato entre Backend y Frontend.
- Definir TTL definitivos.
- Definir política para administradores.
- Definir formato de IP confiable.
- Crear pruebas de contrato automatizadas.

### Fase 1 — Backend compatible

- Implementar `SessionService` sobre Redis.
- Crear sesión opaca al iniciar sesión y registrarse.
- Retornar `sessionToken` y alias temporal `token`.
- Hacer que el guard acepte la sesión opaca.
- Si existen JWT activos, aceptar temporalmente JWT y sesión opaca.

El frontend actual puede transportar el identificador opaco sin cambios porque
lo trata como una cadena y lo reenvía como Bearer.

### Fase 2 — Backend completo

- Publicar `/auth/me`.
- Publicar `/auth/logout`.
- Publicar `/auth/logout-all`.
- Aplicar `authVersion`.
- Aplicar throttling y observabilidad.
- Normalizar códigos REST y GraphQL.

### Fase 3 — Frontend conectado a Redis

- Implementar F1–F8.
- Simplificar la cookie para que solo contenga el identificador.
- Eliminar snapshot cifrado y `AUTH_SESSION_SECRET`.
- Validar cada restauración mediante `/auth/me`.
- Revocar Redis al cerrar sesión.

### Fase 4 — Retiro de JWT legado

- Esperar como mínimo la expiración máxima de los JWT existentes.
- Deshabilitar validación JWT.
- Eliminar secretos y librerías JWT que ya no sean necesarias.
- Eliminar el alias `token` cuando Frontend consuma `sessionToken`.

Si no es posible soportar ambos esquemas temporalmente, Backend y Frontend deben
desplegarse de forma coordinada.

## 13. Matriz de pruebas de integración

| Caso | Resultado esperado |
|---|---|
| Login válido | Redis crea sesión y Next establece cookie |
| Login inválido | `401`, sin cookie y sin revelar si existe email |
| Login limitado | `429` con respuesta estable |
| Recarga del navegador | Next consulta `/auth/me` y recupera usuario |
| GraphQL autenticado | Backend adjunta usuario al contexto |
| Sesión inexistente | REST `401` / GraphQL `UNAUTHENTICATED` |
| Permiso insuficiente | GraphQL `FORBIDDEN`, cookie permanece |
| Logout | Redis elimina sesión y Next elimina cookie |
| Logout repetido | `200`, operación idempotente |
| Redis caído | `503`, cookie no se elimina |
| Cuenta desactivada | Sesión revocada y siguiente petición devuelve `401` |
| Cambio de contraseña | Todas las sesiones anteriores quedan inválidas |
| Cambio de rol | Se invalida o rota la sesión |
| Recordarme desactivado | Cookie de sesión y TTL normal |
| Recordarme activado | Cookie persistente sin superar expiración Redis |
| Dos instancias backend | Ambas validan la misma sesión |
| Reinicio backend | La sesión permanece en Redis |
| Archivo multipart | Proxy reenvía archivo y sesión correctamente |
| Origen externo al BFF | Next devuelve `403` |

## 14. Criterios de aceptación

La migración se considera terminada cuando:

1. El navegador no contiene JWT ni datos de sesión legibles por JavaScript.
2. La cookie contiene únicamente un identificador opaco.
3. Redis es la única fuente de verdad de la sesión.
4. Logout revoca Redis antes de terminar.
5. `/auth/me` devuelve siempre el usuario vigente.
6. Desactivar usuario o cambiar contraseña invalida sesiones.
7. `UNAUTHENTICATED` y `FORBIDDEN` tienen comportamientos diferentes.
8. Redis caído no se reporta como credenciales inválidas.
9. Throttler identifica usuarios sin agruparlos a todos bajo la IP del BFF.
10. Ningún log contiene cookies, contraseñas o identificadores originales.
11. Las pruebas de la matriz anterior pasan en staging.
12. JWT legado queda retirado después de la ventana de compatibilidad.

## 15. Decisiones pendientes recomendadas

| Decisión | Recomendación inicial |
|---|---|
| Inactividad normal | 30 minutos |
| Expiración absoluta normal | 8 horas |
| Recordarme | 7 días de inactividad / 30 días absolutos |
| Administradores | 15 minutos / 4 horas |
| Sesiones simultáneas | 5 por usuario |
| Cambio de contraseña | Revocar todas |
| Cambio de rol | Revocar todas |
| Backend accesible | Solo red privada o mTLS |
| Compatibilidad JWT | Ventana igual a su expiración máxima actual |

## 16. Referencias técnicas

- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [Redis: session store con Node.js](https://redis.io/docs/latest/develop/use-cases/session-store/nodejs/)
- [Redis: expiración y TTL](https://redis.io/docs/latest/commands/expire/)
- [NestJS: autenticación y guards](https://docs.nestjs.com/security/authentication)
- [NestJS: guards con GraphQL](https://docs.nestjs.com/graphql/other-features)
- [NestJS: rate limiting](https://docs.nestjs.com/security/rate-limiting)
