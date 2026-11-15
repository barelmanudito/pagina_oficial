# Administración del contenido

El panel está preparado en `admin/`, pero el acceso real requiere conectar un
servicio OAuth compatible con Decap. No está conectado todavía.

## Completar la instalación

1. Configurar un servicio OAuth compatible con el backend GitHub de Decap, con
   endpoints de autenticación y callback. GitHub Pages no ejecuta ese servicio.
   Referencia oficial: https://decapcms.org/docs/backends-overview/
2. Registrar la aplicación OAuth en GitHub con el callback que indique ese servicio.
   Guardar el client secret exclusivamente en los secretos del servicio, nunca en
   el repositorio. Restringir los orígenes permitidos a la URL real del panel.
3. En `admin/config.yml`, reemplazar `backend.base_url` por la URL HTTPS del servicio
   y ajustar `auth_endpoint` según su documentación. El repositorio y la rama ya
   están configurados como `barelmanudito/pagina_oficial`, `main`.
4. Invitar la cuenta GitHub de la encargada como colaboradora con permiso de escritura.
   Activar 2FA. Este permiso permite modificar el repositorio completo; el formulario
   simplifica la edición, pero no establece permisos limitados por carpeta.
5. En GitHub, seleccionar Pages → Source → GitHub Actions y permitir escritura del
   token del workflow. Verificar las reglas de protección de `main`: el modo de
   publicación directa necesita poder guardar en esa rama.
6. Subir los cambios y comprobar el Action. Abrir la dirección pública de la página
   seguida de `/admin/` (normalmente `/pagina_oficial/admin/`).

El CMS es gratuito. El servicio de acceso debe elegirse y comprobarse por separado;
no se presupone una suscripción ni se contrata ningún servicio con estos archivos.

## Uso diario desde Windows

Las aplicaciones de Windows y Android incluyen **Momentos** para administrar
`data/galeria.json` y las fotos en `assets/momentos/`. Se publican únicamente en la
galería web; no se envían a Facebook ni Instagram. La sección **Redes sociales**
es independiente y solo acepta eventos, con confirmación y permisos Meta configurados.
Los módulos están preparados; el envío real a redes requiere conectar las cuentas
del bar siguiendo `META-Y-ANDROID.md` de la carpeta de la aplicación.

Abrir el panel en Edge o Chrome e iniciar sesión con GitHub.

- **Productos y categorías:** abrir un grupo y agregar o editar sus productos.
  Completar nombre, precio, descripción y foto. `Disponible` permite ocultar un
  producto sin borrarlo. Arrastrar los elementos de las listas cambia su orden.
  El identificador debe ser único, por ejemplo `hamburguesa-especial`.
- **Eventos y cierres:** agregar una entrada con fecha, nombre y tipo. La hora
  utiliza formato de 24 horas. La imagen es opcional y puede cargarse desde la PC.
  Eliminar una entrada la quita del calendario en la siguiente publicación.
- **Configuración del calendario:** elegir si los lunes cierran automáticamente.
  Un evento manual en lunes anula el cierre automático de ese lunes.
- Pulsar **Publicar**. Esperar a que termine el workflow de GitHub Actions y
  actualizar la página. Publicar una imagen sola no la asigna a un producto:
  también hay que seleccionarla en su formulario y publicar ese contenido.

Preferir imágenes WebP o JPG de tamaño moderado. No borrar de la biblioteca una
imagen utilizada por otro producto o evento. No subir información privada: los
archivos de una página pública son visibles para los visitantes.

## Cómo funciona

Los eventos manuales se eliminan automáticamente de `data/eventos.json` al cumplir
un mes calendario desde su fecha, durante la actualización diaria de GitHub Actions
o una nueva publicación. Si el mes siguiente es más corto, vence el último día
de ese mes (31 de enero → 28/29 de febrero). La limpieza utiliza la fecha de Costa Rica.
La aplicación recibe la lista actualizada al sincronizar; los cierres manuales,
los partidos automáticos y la galería de Momentos conservan sus reglas propias.

La aplicación de Windows mantiene una copia local del repositorio por HTTPS y
comprueba actualizaciones al abrir. Las vistas previas usan esas fotos y conservan
los borradores pendientes. No necesita Git instalado.

La página muestra un carrusel con los próximos eventos manuales; se oculta por
completo cuando no hay eventos futuros. Los eventos sin foto tienen una tarjeta
con su nombre y fecha.

El calendario deportivo cubre el mes actual completo en Costa Rica, más 15 días
anteriores al primer día y 15 posteriores al último. Incluye partidos jugados,
programados y resultados de Primera División y de la Selección mayor masculina
de Costa Rica. Las consultas de selección se filtran por el equipo 214 de ESPN.
Los datos dependen de los encuentros que publique la fuente deportiva.

- `data/menu.json`: única fuente del menú. El Action valida los datos y genera
  `menu-data.js`, compartido por la portada y la carta QR.
- `data/eventos.json`: única fuente de eventos manuales. Se migró el Excel inicial;
  ya no editar `eventos.xlsx` ni ejecutar el importador antiguo para administrar el sitio.
- `data/configuracion-calendario.json`: reglas de cierre.
- `data/calendario.csv` y `data/resultados.csv`: archivos generados. No editarlos.
- Al publicar contenido, se combinan los eventos con los partidos ya guardados,
  sin depender de una consulta a ESPN. La ejecución diaria y la manual consultan ESPN.
- Un partido y un evento del mismo día aparecen juntos. Un cierre explícito tiene
  prioridad y muestra el aviso de cierre para ese día.
- El Action no modifica los archivos que escribe Decap. El historial de GitHub
  permite recuperar cambios anteriores.

## Verificación antes de entregar acceso

Publicar un evento con foto el día de un partido; comprobar ambos en el calendario.
Cambiar precio y foto de un producto y verificar portada y QR. Ocultarlo y volverlo
a habilitar. Borrar el evento y comprobar que no reaparece tras ejecutar el Action.
Verificar que una cuenta sin permisos no pueda publicar.

## Ofertas de productos

El precio normal (`price`) se conserva. El campo opcional `discountPrice` define
el precio de oferta: debe ser mayor que cero y menor que el normal. Borrarlo
quita la oferta. Los productos no disponibles no aparecen en las promociones.
La portada muestra las ofertas antes del menú en una fila compacta, con foto,
porcentaje y precio de oferta. La carta conserva los precios Antes/Ahora;
la carta QR y la selección también usan el precio de oferta.
No se han activado descuentos reales: se eligen desde la app o el administrador.

## Galería de Momentos

Las fotos visibles se muestran en un carrusel con desplazamiento táctil y flechas.
Si hay más fotos de las que caben, avanza automáticamente cada 4,5 segundos;
se puede pausar y respeta la preferencia de movimiento reducido del dispositivo.
Al seleccionar una foto se abre ampliada dentro de la página, con navegación
entre imágenes. Se cierra con el botón de cierre, Escape o el fondo exterior.
Sin fotos visibles se conserva el aviso de próxima galería.
