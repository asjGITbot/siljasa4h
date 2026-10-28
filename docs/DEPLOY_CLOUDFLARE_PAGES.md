# Despliegue PAW — Cloudflare Pages + PC local
## Decisión (2026-10-28)
Este repositorio permanece **privado**. Su frontend estático vive en `dist/`. GitHub Pages no se puede habilitar en este repositorio con el plan actual (GitHub muestra "Upgrade or make this repository public"). **No hacer público el repositorio para solucionarlo.**
Usar **Cloudflare Pages** con integración a GitHub. El sitio publicado puede ser público aunque el repositorio permanezca privado. Si debe ser de uso familiar, proteger también el frontend mediante Cloudflare Access.

## Publicar interfaz — acción manual inicial en Cloudflare
1. Abrir https://dash.cloudflare.com/ → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. Conectar GitHub autorizando únicamente el repositorio `asjGITbot/siljasa4h` si Cloudflare ofrece selección de repositorios.
3. Seleccionar `siljasa4h`, rama de producción `main`.
4. Framework: **None** / sin framework.
5. Build command: `exit 0` (o vacío si el asistente lo permite).
6. Build output directory: **dist**.
7. Desplegar. Cloudflare asignará un dominio `<proyecto>.pages.dev` que debe comprobarse, nunca inventarse.
8. Comprobar que carga `index.html` y que funciona la interfaz (modo estático). Los registros sintéticos de la pestaña Demo **no son oportunidades reales**.

Al conectar el repo, los siguientes pushes a `main` se publican automáticamente mediante Cloudflare.

## Backend y base de datos permanecen en la PC
- FastAPI en `127.0.0.1` (puerto de PAW validado por el operador).
- Supabase PostgreSQL en contenedor Docker local.
- El scraping y los documentos se procesan localmente.
- Para acceso desde la web, configurar **Cloudflare Tunnel** con un hostname HTTPS dedicado que apunte solo a FastAPI, **no** al puerto PostgreSQL, Studio o Docker.
- Proteger la API con **Cloudflare Access** y una capa de autenticación/verificación en el servidor: no confiar únicamente en cookies o CORS.
- Configurar orígenes CORS permitidos, preflight OPTIONS y política CSP para el hostname definitivo. La CSP actual de `dist/index.html` restringe `connect-src 'self'`; debe ajustarse a la URL real de API antes de habilitar tráfico remoto.
- Solo después de validar Access, autenticación y `/api/health` con PostgreSQL, editar `dist/config.js` para configurar `PAW_CONFIG.apiBase` con la URL HTTPS pública de la API. Nunca poner tokens ni contraseñas allí.
- **No exponer FastAPI sin autenticación**, no abrir puertos de PostgreSQL ni publicar credenciales en GitHub.

## Estado
- Frontend: archivos en GitHub, **despliegue Cloudflare pendiente de configuración inicial**.
- Backend y Supabase: ejecución local por validar extremo a extremo con `PAW_STORAGE=postgres`.
- REM@JU y conectores bancarios: aún no integrados.
- GitHub Pages: workflow eliminado para evitar fallas continuas por restricción del plan.

## Documentación oficial
- https://developers.cloudflare.com/pages/framework-guides/deploy-anything/
- https://developers.cloudflare.com/pages/configuration/git-integration/
- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
