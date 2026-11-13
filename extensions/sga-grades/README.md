# AuraGrade - Cargar notas al SGA

<img src="icons/icon-128.png" alt="Logo de AuraGrade" width="72" align="right">

Extensión de navegador que rellena en el SGA las notas ya **publicadas en AuraGrade**, verificando antes
el grupo, la materia y cada estudiante. **No envía nada**: el docente revisa los campos y pulsa «Enviar»
en el SGA.

Funciona en navegadores basados en Chromium (**Chrome, Edge, Brave, Opera, Vivaldi, Arc**) y en
**Firefox**. En Safari requiere un paso adicional con Xcode.

## 1. Consigue la carpeta de la extensión

- **Con el repositorio:** es la carpeta `extensions/sga-grades` (la que contiene `manifest.json`).
- **Sin el repositorio:** pide el ZIP al equipo de AuraGrade y descomprímelo en una carpeta **permanente**
  (por ejemplo `Documentos/AuraGrade-SGA`). El navegador la lee desde ahí: si la mueves o la borras, la
  extensión deja de funcionar.

Para generar el ZIP a partir del repositorio:

```bash
cd extensions/sga-grades && zip -r ../aura-grade-sga.zip . -x "fixtures/*" "tools/*" "README.md"
```

## 2. Instálala en tu navegador

### Chrome, Edge, Brave, Opera, Vivaldi y Arc (Chromium)

| Navegador | Dirección de extensiones |
| --- | --- |
| Google Chrome | `chrome://extensions` |
| Microsoft Edge | `edge://extensions` |
| Brave | `brave://extensions` |
| Opera | `opera://extensions` |
| Vivaldi | `vivaldi://extensions` |
| Arc | `chrome://extensions` |

1. Escribe la dirección de tu navegador en la barra y pulsa Enter.
2. Activa **Modo de desarrollador** (en Chrome, Brave, Vivaldi y Opera está arriba a la derecha; en Edge,
   abajo a la izquierda del panel lateral).
3. Pulsa **Cargar descomprimida** (en Edge se llama **Cargar desempaquetada**).
4. Elige la carpeta `sga-grades`, la que contiene `manifest.json`.
5. Fija el icono: pulsa el puzzle de la barra de herramientas y luego el **pin** junto a
   «AuraGrade - Cargar notas al SGA».

> Al reiniciar el navegador, Chrome o Edge pueden pedir que confirmes o desactives las extensiones en
> modo de desarrollador. Si desaparece, vuelve a activarla desde la misma página.

### Firefox (128 o superior)

1. Abre `about:debugging#/runtime/this-firefox`.
2. Pulsa **Cargar complemento temporal…**.
3. Elige el archivo `manifest.json` dentro de la carpeta `sga-grades`.
4. Fija el icono desde el menú de extensiones (el puzzle) con **Anclar a la barra de herramientas**.

> En Firefox la instalación es **temporal**: se quita al cerrar el navegador y hay que repetir los pasos
> cada vez. Para una instalación permanente la extensión debe firmarse en addons.mozilla.org como no
> listada, con `npx web-ext sign --channel=unlisted` (requiere una cuenta de desarrollador de Mozilla).

### Safari (macOS)

Safari solo carga extensiones empaquetadas como app. Con Xcode instalado:

```bash
xcrun safari-web-extension-converter extensions/sga-grades --app-name "AuraGrade SGA"
```

Compila y ejecuta el proyecto que se genera, y activa la extensión en **Safari → Ajustes →
Extensiones**. Mientras la app no esté firmada con una cuenta de desarrollador, activa también
**Desarrollo → Permitir extensiones sin firmar** cada vez que abras Safari.

### Comprueba que quedó instalada

Debes ver el icono del logo de AuraGrade en la barra. Al pasar el cursor dice «AuraGrade: cargar notas al
SGA». No pide permisos sobre ningún sitio web.

## 3. Uso, por actividad

1. En AuraGrade abre la tarea y pulsa **Notas para el SGA**. Se descarga un `.json` con las notas
   publicadas, identificadas por el documento del estudiante (el RA del SGA).
2. En el SGA abre la pantalla de captura de **esa** actividad (la que tiene un campo de nota por
   estudiante) e inicia sesión como siempre.
3. Pulsa el icono de la extensión. Se abre un panel con el logo de AuraGrade en la esquina inferior
   derecha. Arrastra el `.json` a la zona punteada o pulsa para elegirlo.
4. Revisa el resumen, confirma que son la misma actividad y el mismo curso, y pulsa **Rellenar**.
5. Los campos escritos quedan con borde verde. Revisa y pulsa «Enviar» tú.

## Verificación del curso

En el SGA un curso se identifica con **dos códigos**: el **grupo** (`PGINS2301QDOA`, el del encabezado,
compartido por varias materias) y la **materia** dentro del grupo (`000067`).
Por eso en AuraGrade cada curso es **una materia de un grupo** y se crea con los dos códigos
(«Código de grupo» y «Código de materia»); el grupo se guarda en mayúsculas y la materia son 6 dígitos.
Los mismos estudiantes cursan varias materias del grupo, así que el RA no distingue una materia de otra:
la materia se verifica aparte.

La extensión actúa cuando el docente ya está en la pantalla de captura de notas de la actividad, y
compara el archivo con lo que esa pantalla muestre:

- **Grupo:** lee los códigos de grupo de la pantalla; del desplegable de grupos solo cuenta la opción
  **seleccionada**, no las que lista.
- **Materia:** la materia actual es la que aparece **en negrita** en el árbol de materias («000067 - …»).
  El árbol se despliega a mano en el SGA; si está cerrado, no hay nada que leer.
- **Coinciden ambos:** «Curso verificado» y solo confirmas la actividad.
- **Alguno no coincide:** bloqueo total, no se rellena nada (por ejemplo, la otra materia del mismo grupo).
- **No se pudo leer:** el panel dice qué falta y la casilla de confirmación nombra el curso, la materia y
  el grupo que debes tener abiertos; sin marcarla no se rellena.
- **Curso de AuraGrade sin códigos** (creado antes de este cambio): solo confirmación manual, y el panel
  avisa que hay que editar el curso.

## Qué hace y qué nunca hace

- Empareja por **RA** y comprueba que el nombre coincida (acentos y orden no importan). Si no
  coincide, ese campo no se rellena y se lista.
- Escribe la nota **tal cual está publicada**: sin redondeo (2.99 queda 2,99). Usa coma decimal, como
  muestra el SGA en las notas ya guardadas (`3,40`); si el campo la altera, reintenta con punto.
- Un estudiante sin nota publicada queda **vacío**: nunca se escribe 0 por defecto.
- No toca campos que ya tienen otra nota, salvo que marques «Reemplazar».
- No rellena notas fuera del rango que indica el SGA (p. ej. «entre 0 y 5.00»).
- Después de escribir cada nota la lee de vuelta. Si el campo del SGA la alteró (por ejemplo por su
  límite de 3 caracteres), la deshace y la marca en rojo; nunca deja un valor distinto en silencio.
- No marca «ausente» ni pulsa «Enviar».

### Privacidad y permisos

- Solo pide `activeTab` y `scripting`: actúa únicamente en la pestaña donde pulsas el icono, y solo en ese
  momento. No tiene permisos sobre ningún sitio.
- No hace peticiones de red ni envía el archivo a ningún servidor: el `.json` se lee en tu navegador.
- No guarda ni lee contraseñas del SGA; usa la sesión que ya tienes abierta.

## Actualizar y desinstalar

- **Actualizar:** reemplaza el contenido de la carpeta por la versión nueva y, en la página de extensiones,
  pulsa el botón de recargar (flecha circular) de la tarjeta. Recarga también la página del SGA.
- **Desinstalar:** en la página de extensiones pulsa **Quitar**. Puedes borrar la carpeta después.

## Si el SGA cambia su pantalla

La extensión busca los campos `input.nota` y el RA en la primera celda de cada fila. Si el SGA cambia
ese HTML, el ajuste está en `readRows()` de `content.js`.

## Para desarrolladores

```
manifest.json   Nombre, íconos y permisos (Manifest V3; también lo lee Firefox).
background.js   Al pulsar el icono inyecta brand.js, core.js y content.js en la pestaña activa.
core.js         Lógica pura: validar el archivo, emparejar, verificar el curso (con pruebas).
content.js      Panel y lectura/escritura de la página del SGA.
brand.js        Logo embebido como data URI (generado; no editar a mano).
icons/          Íconos 16/32/48/128 generados desde public/logo2.png.
fixtures/       Página que replica el HTML del SGA para probar.
tools/          make-icons.sh: regenera icons/ y brand.js desde el logo de la app (macOS).
```

- **Pruebas:** `pnpm test` ejecuta la lógica de emparejamiento y verificación de `core.js`.
- **Página de prueba:** `fixtures/actividad.html` replica el HTML del SGA. Parámetros:
  `?group=PGINS2301QDOA&subject=000067` (desplegable de grupos y árbol de materias),
  `?mask=truncate` (campo que recorta a `maxlength`) y `?mask=dotonly` (campo que solo entiende punto).
- **Cambiar el logo:** reemplaza `public/logo2.png` y ejecuta `sh extensions/sga-grades/tools/make-icons.sh`.
- **Guía visual del panel:** usa la de la app: cobalto `#2855ad` y violeta `#65509a` del logo (degradado de la
  cabecera), tipografía Inter, botones de 8 px y tarjetas de 12 px, bordes grises y el mismo anillo de foco
  que `.input-primary`. Los colores de estado son verde, ámbar y rojo.

## Autor

**Stiwar Asprilla**

- GitHub: [@Stiwar9816](https://github.com/Stiwar9816)
- Docker Hub: [stiwar1098](https://hub.docker.com/u/stiwar1098)
- LinkedIn: [Stiwar Asprilla](https://www.linkedin.com/in/stiwar-asprilla/)

El manifest solo admite un enlace público, así que declara el autor (`author`) y LinkedIn como página de
la extensión (`homepage_url`, el enlace «Sitio web» de los detalles en Chrome, Edge y Firefox). Las demás
redes están aquí y en el README principal; no se añaden claves propias al manifest porque el navegador las
marcaría como «clave no reconocida».

### Estado de pruebas

Probado:

- La lógica, con pruebas automáticas.
- El panel completo (arrastrar el archivo, verificar grupo y materia, bloquear, rellenar con coma o
  punto) sobre la página de prueba, inyectando los mismos scripts.
- La carga como extensión sin empaquetar en Chromium (Chrome for Testing 151): queda habilitada, sin
  errores ni advertencias de manifest, con su icono y su enlace de autor.

**No probado:** la carga en Edge, Firefox y Safari (Edge y los demás Chromium comparten motor, así que
deberían comportarse igual), ni el uso de la extensión en el SGA real. Si algo no abre, revisa la
consola de extensiones de tu navegador y avisa al equipo.
