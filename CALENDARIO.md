# Calendario, eventos y resultados

## Archivo que debe editarse

Los eventos manuales se administran en `data/eventos.xlsx`, hoja `Eventos`.

Columnas:

- `fecha`: fecha en formato `AAAA-MM-DD`.
- `nombre`: nombre visible del evento.
- `tipo`: `evento` o `cerrado`.
- `hora`: hora opcional.
- `descripcion`: texto promocional o explicación del cierre.
- `imagen`: ruta opcional como `assets/eventos/disfraces.webp`.

Si `imagen` está vacía en un evento, la página no deja ningún espacio vacío. Para un registro `cerrado`, se usa el aviso predeterminado si no se indica otra imagen.

No edite manualmente `data/calendario.csv`: GitHub Actions lo genera usando el Excel y los partidos de ESPN.

## Lunes cerrados

En la hoja `Configuracion`, `cerrar_lunes` está configurado como `SI`. El sistema agrega automáticamente un cierre a cada lunes, aunque exista un partido. El lunes solamente se abre cuando se agrega una actividad manual de tipo `evento` en `eventos.xlsx`.

Para desactivar esta regla, cambie `SI` por `NO` y vuelva a subir el Excel.

La opción `imagen_cerrado` permite cambiar la imagen predeterminada de los lunes cerrados.

## Resultados

El archivo `data/resultados.csv` se genera automáticamente con los partidos finalizados de los últimos 30 días. Incluye marcador, estadio, ganador y escudos. La página lo presenta debajo del calendario.

## Actualización

Después de subir `eventos.xlsx`, ejecute el workflow **Actualizar calendario y publicar página**. También se ejecuta automáticamente todos los días.
