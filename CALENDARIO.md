# Cómo agregar eventos manuales

El archivo principal es `data/calendario.csv`. Conservá siempre su primera fila completa.

## Evento con imagen promocional

```csv
2026-10-31,Noche de disfraces,evento,19:00,Premios para los mejores disfraces,,,,,,,,,,assets/eventos/disfraces.webp
```

La imagen puede ser una ruta local dentro de la página o una dirección HTTPS. Si `imagen` queda vacía, la página no reserva ningún espacio para fotografías.

## Día cerrado con imagen predeterminada

```csv
2026-12-25,Cerrado,cerrado,,El bar permanecerá cerrado este día,,,,,,,,,,
```

Cuando `imagen` está vacía en un registro `cerrado`, se utiliza automáticamente `assets/cerrado.svg`.

## Día cerrado con una imagen propia

```csv
2027-01-01,Cerrado,cerrado,,Regresamos mañana,,,,,,,,,,assets/eventos/cerrado-enero.webp
```

Los partidos se agregan automáticamente. Las columnas de estadio, equipos y escudos son completadas por el GitHub Action y no es necesario escribirlas manualmente.

## Regla de los lunes

Los lunes se muestran como **cerrado** de forma automática. Un partido agregado por el sistema no abre el bar ni sustituye este cierre.

Para abrir un lunes por una actividad especial, agregá en Excel o directamente en `data/calendario.csv` una fila con esa fecha y escribí `evento` en la columna `tipo`. Por ejemplo:

```csv
2026-10-12,Actividad especial,evento,18:00,El bar abrirá por esta actividad,,,,,,,,,,
```

Al guardar desde Excel, conservá el archivo en formato CSV y no cambiés los nombres de las columnas de la primera fila.
