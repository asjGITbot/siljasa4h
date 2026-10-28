# SILJASA4H — PAW Radar Inmobiliario (frontend)

Este repositorio es **privado** y contiene solo los archivos estáticos de la interfaz en `dist/`. No incluye backend Python, bases de datos ni credenciales.

## Publicación
El despliegue mediante **GitHub Pages no es compatible con la configuración actual del repositorio privado y su plan**. Por ese motivo se eliminó el workflow fallido. No es necesario volver público el repositorio.

**Destino elegido:** Cloudflare Pages, conectado directamente a este repositorio privado. Guía de configuración: [docs/DEPLOY_CLOUDFLARE_PAGES.md](docs/DEPLOY_CLOUDFLARE_PAGES.md).

## Arquitectura
- GitHub: repositorio privado, versiones y código de la interfaz.
- Cloudflare Pages: frontend HTML/CSS/JavaScript servido por HTTPS.
- PC local: FastAPI y motor de captación.
- Docker local: Supabase PostgreSQL.
- Cloudflare Tunnel + Access: futuro acceso remoto autorizado a la API.
- `dist/config.js`: URL HTTPS pública de la API (pendiente). Nunca agregar contraseñas ni tokens.

## Estado actual
- Frontend subido a GitHub: sí.
- Despliegue inicial Cloudflare Pages: **pendiente de autorización/configuración en Cloudflare**.
- Backend y PostgreSQL: disponibles localmente, pendiente de verificación final de la conexión a PostgreSQL.
- Búsqueda de REM@JU y remates bancarios: aún pendiente.
- Modo Demo: datos sintéticos, no oportunidades reales.

**Seguridad:** no abrir puertos directos al público, no subir secretos ni conectar `config.js` hasta validar autenticación, CORS y CSP.
