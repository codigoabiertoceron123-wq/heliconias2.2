# 🌿 Heliconias Report

## 📊 Descripción del proyecto

Desarrollo de una plataforma web de inteligencia de datos para el Parque de las Heliconias, enfocada en la gestión, análisis y generación de reportes estadísticos sobre sus visitantes.

> "Antes manejábamos toda la información en papel y era muy fácil perder datos o demorarnos buscando registros. Con esta plataforma todo está centralizado, se puede consultar rápidamente y ya no dependemos de hojas de Excel ni de conteos manuales. Nos ha ahorrado mucho tiempo en el proceso."

— **Administrador del Parque de las Heliconias**

---

## 🚀 Características destacadas

- Visualización de estadísticas mediante gráficos interactivos  
- Análisis por género, edad y otros indicadores  
- Consulta de información por rangos de fechas  
- Gráficos de barras para facilitar la interpretación  
- Gestión y programación de eventos  
- Exportación de reportes estadísticos  
- Generación automática de informes  
- Actualización de métricas en tiempo real  

---

## 🛠️ Tecnologías utilizadas

- HTML  
- CSS  
- JavaScript  
- PostgreSQL  
- Supabase  
- GitHub  

---

## 🎯 Objetivo del sistema

Centralizar la información del parque, reducir el uso de papel y Excel, y mejorar la toma de decisiones mediante datos organizados, accesibles y visuales.

---

## 👩‍💻 Autor

Proyecto desarrollado por **Ángela Romero Meléndez, Jhonnatan Ceron Amariles, Nicolas Gutierrez**

---

## 📁 Estructura del proyecto (refactor modular)

```
heliconias2.2/
├── *.html                 # 16 páginas (sin JS/CSS inline)
├── js/
│   ├── core/              # Módulos compartidos (carga clásica, file:// friendly)
│   │   ├── config.js      # Cliente Supabase único (window.supabaseClient)
│   │   ├── utils.js       # Fechas, colores, números, DOM (window.HUtils)
│   │   ├── ui.js          # Reloj, logout, carga/error/vacío, Swal (window.HUI)
│   │   ├── charts.js      # Helpers Chart.js (window.HCharts)
│   │   ├── export.js      # Exportar Excel/PNG (window.HExport)
│   │   ├── filters.js     # Filtros de fecha y edad (window.HFilters)
│   │   ├── data.js        # Acceso a datos Supabase (window.HData)
│   │   ├── modal.js       # Apertura/cierre de modales (window.HModal)
│   │   ├── nav.js         # Header común: reloj, sesión, ayuda (window.HNav)
│   │   └── nav-mobile.js  # Menú hamburguesa lateral (derecha → izquierda)
│   └── pages/
│       ├── edad/          # Sistema de edad (state, utils, data, filters, charts, tables, modals, export, ui, index)
│       ├── ciudad/        # Sistema de ciudad
│       ├── institucion/   # Sistema de institución
│       ├── nacionalidad/  # Sistema de nacionalidad
│       ├── genero/        # Sistema de género
│       └── <pagina>/page/ # JS extraído de cada HTML (sin inline)
├── css/
│   ├── base/
│   │   ├── reset.css      # Reset, scrollbar verde, utilidades (card, card-green)
│   │   └── layout.css     # Layout base (header, nav, top-bar)
│   ├── components/
│   │   ├── buttons.css    # Botones compartidos
│   │   ├── alerts.css     # Estilos SweetAlert
│   │   └── hamburger.css  # Menú hamburguesa + responsive móvil
│   └── pages/             # CSS específico de cada página (dedup aplicado)
└── db/
    └── config.php
```

### ✨ Mejoras de interfaz (este refactor)

- **Menú hamburguesa lateral**: botón en el header que abre un sidebar deslizante de **derecha a izquierda** con overlay y cierre al hacer clic fuera o tecla `Escape`. Mismo diseño en las 16 páginas.
- **Responsive móvil**: menú oculto en pantallas pequeñas, header adaptable, tarjetas en una columna, botones y fechas reajustados.
- **Paleta de colores mantenida**: verde `#2e7d32`, verde oscuro `#195b35`, verde claro `#4caf50`, con scrollbar y selección de texto en verde.
- **JS modularizado**: los 4 sistemas grandes se dividieron de archivos monolíticos de 100–208 KB en módulos de 1–70 KB por especialización (datos, filtros, gráficas, tablas, modales, exportación, UI).
- **CSS compartido**: reglas duplicadas en ≥4 páginas extraídas a `css/base/` y `css/components/` (reset, layout, botones, alertas, hamburguesa).
- **Sin build step**: scripts clásicos (sin ES modules), funciona abriendo los HTML directamente (`file://`).
- **APIs preservadas**: `window.EdadSystem`, `window.CiudadSystem`, etc. y los `onclick` siguen funcionando.

