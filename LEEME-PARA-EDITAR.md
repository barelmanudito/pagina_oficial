# Editar el calendario y las fotos del menú

## Calendario

Abrí `data/calendario.csv` con un editor de texto o Excel. La primera fila es el encabezado; agregá una fila por actividad, partido o cierre.

| Columna | Valor |
| --- | --- |
| `fecha` | Fecha en formato `AAAA-MM-DD`, por ejemplo `2026-12-31`. |
| `nombre` | Nombre que verá el visitante. |
| `tipo` | `evento`, `partido` o `cerrado`. Una fila `cerrado` prevalece sobre cualquier actividad del mismo día. |
| `hora` | Opcional; por ejemplo `19:00`. |
| `descripcion` | Opcional; breve información para el visitante. |

Ejemplos de formato (reemplazá `AAAA-MM-DD` por fechas confirmadas antes de agregarlos al CSV):

```csv
fecha,nombre,tipo,hora,descripcion
AAAA-MM-DD,LDA vs Equipo visitante,partido,19:00,Partido de local
AAAA-MM-DD,Noche de karaoke,evento,20:00,Actividad especial del bar
AAAA-MM-DD,Día sin servicio,cerrado,,El bar permanecerá cerrado
```

Las filas `evento` y `cerrado` son manuales. Las filas `partido` pueden escribirse manualmente, pero el GitHub Action incluido en `.github/workflows/actualizar-partidos.yml` las reemplaza con todos los próximos partidos de la Primera División de Costa Rica y conserva intactas las demás filas.

## Primera División automática con GitHub Actions

El flujo se ejecuta cada mañana y también se puede iniciar desde la pestaña **Actions** de GitHub con el botón **Run workflow**. Consulta el calendario público de la Primera División costarricense en ESPN sin clave de API, incluye los partidos de todos los equipos, conserva los eventos y cierres manuales y actualiza solamente las filas con `tipo=partido`.

Para activarlo, subí todo el contenido de esta carpeta a la raíz del repositorio de GitHub, incluida la carpeta oculta `.github`. En **Settings → Actions → General → Workflow permissions**, seleccioná **Read and write permissions**. Después ejecutá una vez **Actualizar partidos de Primera División** desde la pestaña Actions. El flujo hará un commit nuevo únicamente cuando cambie `data/calendario.csv`.

No hace falta guardar ningún token de la fuente deportiva: el endpoint utilizado es público. El token temporal que GitHub usa para guardar el CSV lo crea GitHub automáticamente y no aparece en el código.

El archivo admite comas y punto y coma como separadores. Para escribir una coma dentro de una descripción, poné el campo entre comillas dobles. Si usás Excel, guardá como CSV UTF-8 y verificá que la fecha conserve el formato `AAAA-MM-DD`.

Al cambiar el archivo en tu computadora, actualizá la página desde un servidor local para ver los cambios. Por ejemplo, dentro de esta carpeta podés ejecutar `python -m http.server 8000` y abrir `http://localhost:8000`. Abrir `index.html` directamente con doble clic impide que el navegador lea el CSV. Para que los cambios aparezcan en la web publicada, hay que publicar nuevamente los archivos.

## Fotos de productos

Guardá tus fotos en `assets/productos/` y cambiá la ruta correspondiente en `menu-photos.js`. Ya hay una línea por cada producto, todas apuntando a la misma imagen provisional. Por ejemplo:

```js
"chifrijo": "assets/productos/chifrijo.webp",
```

Para productos recortados sobre fondo transparente, usá WebP o PNG. La página muestra la imagen completa detrás del nombre, la descripción y el precio, y la reduce automáticamente cuando alcanza primero el ancho o la altura máxima disponible, sin recortarla ni cambiar el tamaño de la jarra. En una pantalla de escritorio, el área máxima visible es de aproximadamente **232 px de ancho por 256 px de alto**; en celulares, el ancho se adapta al espacio disponible. El archivo fuente puede ser más grande: para que se vea nítido en pantallas de alta densidad se recomienda al menos 464 × 512 px, conservando la proporción del producto y sin márgenes transparentes innecesarios. También admite fotos horizontales JPG o WebP. Cada imagen se carga cuando el visitante se acerca a esa jarra. Guardá el archivo con el mismo nombre y extensión que escribiste en `menu-photos.js`.

En celulares, todas las jarras reutilizan la única animación `assets/beer-mobile.webp`. La página la carga solamente cuando una jarra se acerca al área visible y desactiva los efectos individuales de escarcha, gotas y burbujas. Las fotos transparentes de los productos permanecen separadas, por lo que no es necesario crear una animación distinta para cada bebida o plato.

La página `menu.html` es la carta independiente preparada para enlazar desde un código QR. Reutiliza `app.js`, `menu-glass.js`, `menu-photos.js` y todos los recursos del menú principal; por eso cualquier cambio de productos, precios o fotografías aparece en las dos páginas.

## Redes sociales

Los enlaces de Facebook e Instagram están en `index.html` y `menu.html`. Los horarios y enlaces de Google Maps y Waze también aparecen en ambas páginas. Si alguno cambia, actualizalo en los dos archivos.

WhatsApp se muestra sin enlace mientras no haya un número confirmado. Para activarlo, cambiá su `<div class="social-link social-link-pending">` por un `<a class="social-link" href="https://wa.me/506XXXXXXXX" target="_blank" rel="noopener noreferrer">` y cerrá ese bloque con `</a>`. Sustituí `XXXXXXXX` por los ocho dígitos del número del bar, sin espacios ni guiones, y cambiá el texto “Contacto próximamente” por “Escribinos”.
