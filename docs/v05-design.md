# v0.5-ui — guía de diseño (contrato para todas las pantallas)

Base: los tokens de v0.4 (ADR-16). Referencia de nivel: Descubrir y Perfil de mascota de v0.4. Paleta y fuentes no cambian.

## Idea central
La foto de la mascota es lo único protagonista. Todo lo demás (navegación, listas, formularios, paneles) es papel crema, vidrio y tipografía, en silencio. Cada pantalla tiene **un** elemento que manda (una foto, un número, una acción principal) y el resto lo acompaña.

## Sistema
| Pieza | Regla |
|---|---|
| Página | Fondo `.paper` (ya lo pone el layout). Margen lateral `px-4`. Fin de página `pb-8` (o `pb-28` si hay barra de acciones fija). |
| Cabecera | `<PageHeader title subtitle back action aside>`: un único `h1` de 30 px, subtítulo de una frase en `cocoa-500`. Volver = `back` (nombre accesible "Volver"). Nada de etiquetas encima del título. |
| Secciones | `<Section title aside>`: `h2` de 18 px; `aside` = conteo o enlace discreto. 24 px entre secciones. |
| Listas | `<ListGroup>` + `<ListRow leading title subtitle trailing to|onClick>`: tarjeta única con separadores finos (estilo iOS agrupado). Para colecciones de mascotas: grilla de `PetCard` (2 columnas). |
| Tarjetas | `Card` (= `.surface-2`, radio 3xl). No anidar tarjetas dentro de tarjetas. |
| Superficies | `.surface-1` grupos/fondos de sección · `.surface-2` tarjetas · `.surface-3` controles flotantes · `.glass` sobre fotos y barras fijas · `.glass-dark` sobre fotos oscuras. |
| Números / KPIs | `<StatTile value label tone icon>`; `tabular-nums`. |
| Botones | `Button` (variantes existentes). Una sola acción `primary`/`like`/`success` por vista; el resto `outline`/`soft`/`ghost`. Iconos solos: `<IconButton label>`. |
| Barra de acciones fija | `sticky bottom-0` con `.glass`, `px-4 pt-3 pb-safe-b`, botones `block`. |
| Estados vacíos | `EmptyState`: dicen qué hacer, con acción si existe. |
| Carga | `<Skeleton>` con la forma del contenido final; nunca un spinner suelto. |
| Formularios | `.label` + `.input`; agrupar campos en `Card` con `p-4 space-y-4`; errores con `role="alert"` (ya existen; mantenerlos). |
| Radios | control `xl`/`full` → tarjeta `3xl` → hoja `4xl/5xl`. |
| Movimiento | Solo responde a acciones (abrir, confirmar, cambiar). Nada de entradas escalonadas en cada lista. `prefers-reduced-motion` ya está cubierto por CSS; en Framer Motion usar `useReducedMotion()` si se añade un movimiento con `transform`. |
| Foco | `:focus-visible` global (anillo terra). No quitar `outline` en ningún control. |
| Contraste | Texto de cuerpo ≥ `cocoa-500` sobre crema/blanco. `cocoa-300/400` solo para iconos decorativos o texto ≥ 18 px. |

## Prohibido
- Cambiar rutas, datos, servicios, copy, `data-hu`, `data-tour`, `id`, `aria-label`, nombres accesibles o el comportamiento de una HU. Ver `docs/test-selectors.txt`.
- Etiquetas en MAYÚSCULAS, flechas `→` en botones, gradientes decorativos, sombras nuevas fuera de los tokens, tarjetas idénticas para todo.
- Dependencias nuevas.

## Escritorio
En escritorio la app vive dentro del marco de teléfono (`DeviceFrame`), así que se diseña para 390 px. El back-office de admin también se ve en ese marco: debe leerse como herramienta seria (tablas compactas, filtros, estados con color semántico), no como lista plana.
