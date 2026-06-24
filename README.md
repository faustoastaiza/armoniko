# Living by Armóniko — Sitio web

Sitio web del **Living by Armóniko**, hotel boutique en el corazón de Laureles, Medellín.
14 suites tipo apartamento, gastronomía integrada, aliados y tours.

🔗 **Producción:** [armoniko.malaidea.co](https://armoniko.malaidea.co)

## Stack

HTML, CSS y JavaScript vanilla — sin frameworks ni dependencias de build.

- **Tipografías:** Marcellus (display) + Jost (body) vía Google Fonts
- **Date picker:** Flatpickr (CDN)
- **Reservas:** integración con SiteMinder / Direct-Book
- **Imágenes:** WebP optimizado

## Estructura

```
.
├── index.html              # Home (hero video, suites, galería, reseñas, ubicación)
├── habitaciones.html       # Listado de suites con slider
├── suite-*.html            # Detalle de cada suite + lightbox
├── servicios.html          # Gastronomía (4 restaurantes), rooftop, coworking, tours
├── aliados.html            # Beneficios para huéspedes (restaurantes, salud, wellness)
├── tours.html              # 16 experiencias en Medellín y Antioquia
├── nosotros.html           # Historia de la marca
├── politicas-de-privacidad.html
├── css/
│   ├── variables.css       # Design tokens (paleta, tipografía, espaciados)
│   └── styles.css          # Estilos
├── js/
│   └── main.js             # Interacciones (booking, sliders, filtros, lightbox, modales)
├── img/                    # Imágenes optimizadas por sección
└── .htaccess               # MIME types, gzip, cache, headers
```

## Desarrollo local

Al ser un sitio estático, basta con servir la carpeta:

```bash
npx serve .
# o
python3 -m http.server 8000
```

## Diseño

Estética *cinematic warm-luxury*: paleta cream/ink/olive/terracotta.
Sistema de design tokens centralizado en `css/variables.css`.
