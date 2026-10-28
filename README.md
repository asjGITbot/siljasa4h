# SILJASA4H — PAW Radar Inmobiliario (frontend)

Este repositorio publica **solo archivos estáticos** mediante GitHub Pages. No contiene base de datos, credenciales, datos de clientes ni servicios Python.

La API privada se ejecutará en la PC mediante FastAPI y Supabase PostgreSQL (Docker). Se accederá mediante Cloudflare Tunnel **protegido con Cloudflare Access**, nunca por exposición directa de puertos.

## Sitio

En GitHub: Settings → Pages → Build and deployment → GitHub Actions. El workflow publica `dist/`. El sitio de Pages puede ser público incluso si el repositorio es privado.

En `dist/config.js` configurar `apiBase` únicamente cuando exista endpoint HTTPS con Access funcionando. **Nunca poner contraseñas ni tokens** en `config.js`.

Si falta esa conexión, el sitio muestra interfaz estática sin búsqueda real. La extracción REM@JU/bancos aún está pendiente.

Para evitar problemas de cookies de terceros, lo recomendado es personalizar el dominio de Pages (`radar.tudominio`) y colocar la API en otro subdominio del mismo dominio (`api.tudominio`). Cloudflare Access necesita manejo explícito de CORS/preflight para llamadas desde el navegador.
