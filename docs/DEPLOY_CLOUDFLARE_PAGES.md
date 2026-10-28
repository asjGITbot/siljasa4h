# Aviso: guía de Cloudflare Pages sustituida

Esta guía correspondía al período en que `asjGITbot/siljasa4h` era un repositorio privado y el plan de GitHub no habilitaba Pages.

**Ya no aplica.** El repositorio pasó a ser **público** y se decidió publicar su frontend mediante **GitHub Pages** sin mezclarlo con otros proyectos.

## Despliegue vigente
1. Abrir https://github.com/asjGITbot/siljasa4h/settings/pages
2. Seleccionar **Build and deployment → Source → GitHub Actions**.
3. El archivo `.github/workflows/pages.yml` despliega únicamente `dist/` ante cada cambio en `main`; también tiene `workflow_dispatch` para ejecución manual.
4. Comprobar la ejecución en https://github.com/asjGITbot/siljasa4h/actions y usar el enlace `Visit site` de Settings → Pages.

## Backend
- El backend FastAPI se mantiene en la PC.
- Supabase PostgreSQL permanece en Docker local.
- Cuando esté listo, Cloudflare **Tunnel + Access** conectará el navegador a la API; no es lo mismo que Cloudflare Pages.
- Antes de configurar `PAW_CONFIG.apiBase`, validar autenticación del servidor, orígenes CORS, CSP y conexión real a PostgreSQL.
- No abrir puertos de base de datos ni introducir secretos en el frontend.

La publicación de archivos estáticos **no** implica que el radar de remates esté funcionando en línea.
