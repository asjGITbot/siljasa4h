# SILJASA4H — PAW Radar Inmobiliario

Interfaz web del proyecto PAW Radar Inmobiliario. Repositorio **público** con archivos estáticos en `dist/`. **No contiene** el backend Python, credenciales, bases de datos ni documentos privados.

## Publicación
La interfaz se publica mediante **GitHub Pages** con el workflow [PAW Radar — GitHub Pages](.github/workflows/pages.yml).

**Primera activación requerida en GitHub:** [Settings → Pages](https://github.com/asjGITbot/siljasa4h/settings/pages) → **Build and deployment → Source → GitHub Actions**. El primer despliegue se inicia por un push a `main` o manualmente con `Run workflow` en Actions.

**URL prevista, pendiente de confirmación de despliegue:** https://asjgitbot.github.io/siljasa4h/

La interfaz está separada del backend. Hasta conectar la API privada, solo estará disponible la vista estática; las oportunidades de demo son ficticias y están identificadas como tales.

## Arquitectura
- **GitHub Pages:** frontend público HTML/CSS/JavaScript.
- **PC Windows:** servidor FastAPI y motor de captación inmobiliaria en localhost.
- **Supabase Local en Docker:** PostgreSQL y datos privados, nunca expuestos mediante GitHub Pages.
- **Cloudflare Tunnel + Access:** futura conexión HTTPS autenticada desde frontend hacia FastAPI local; requiere configuración y pruebas independientes.
- **dist/config.js:** campo `PAW_CONFIG.apiBase` vacío hasta validar el túnel, autenticación, CORS y CSP. Nunca introducir secretos.

## Pendientes
- Habilitar GitHub Pages en Settings y verificar despliegue.
- Verificar FastAPI con `PAW_STORAGE=postgres` y los 40 registros importados.
- Configurar Cloudflare Tunnel, Access y validación de autenticación del lado servidor.
- Implementar y validar conectores REM@JU y bancarios.

No publicar API Python, Supabase Studio, PostgreSQL, contraseñas o tokens directamente.
