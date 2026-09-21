# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es esto

FlowSync: proyecto de práctica (gestión de tareas en equipo). Monorepo con dos proyectos npm independientes que no comparten `package.json` ni se levantan con un único comando:

- `backend/` — API en AdonisJS 7 (`http://localhost:3333`)
- `frontend/` — React 19 + Vite (`http://localhost:5173`)

No hay proxy de Vite hacia el backend: en dev, CORS está abierto (`app.inDev ? true : []` en `backend/config/cors.ts`) y el frontend debe llamar a la API por su URL absoluta.

Rama actual `s1/start`: es el punto de partida del ejercicio. El frontend es aún la plantilla de Vite sin tocar (`frontend/src/App.tsx`); el backend ya tiene signup/login/logout/profile funcionando pero nada en el frontend los consume todavía.

## Comandos

### Raíz del repo

```bash
make setup   # npm install + .env + APP_KEY + migraciones, en backend/ y frontend/
make start   # levanta backend (3333) y frontend (5173) a la vez; Ctrl+C apaga ambos
```

`make setup` es idempotente: no reescribe un `.env` ya existente ni regenera `APP_KEY` si ya hay una. Para trabajar en un solo lado (tests, lint, comandos de `ace` sueltos) sigue haciendo falta `cd backend`/`cd frontend`, como abajo.

### Backend (`cd backend`)

```bash
npm install
cp .env.example .env && node ace generate:key   # solo la primera vez
node ace migration:run                          # aplica migraciones y regenera database/schema.ts
npm run dev                                     # node ace serve --hmr
npm test                                        # node ace test (suites unit + functional)
node ace test --files="users.spec.ts"           # un solo archivo
node ace test --suite=functional                # una sola suite
npm run lint                                    # eslint .
npm run format                                  # prettier --write .
npm run typecheck                               # tsc --noEmit
```

### Frontend (`cd frontend`)

```bash
npm install
npm run dev       # vite, en otra terminal (el backend se queda corriendo en la primera)
npm run build     # tsc -b && vite build
npm run lint      # oxlint
```

## Arquitectura del backend (AdonisJS 7)

### Imports por subpath, nunca relativos

`backend/package.json` define un mapa `imports` (`#controllers/*`, `#models/*`, `#validators/*`, `#transformers/*`, `#middleware/*`, `#database/*`, `#generated/*`, etc.). Todo el código nuevo debe importar con estos alias en vez de rutas relativas (`../../models/user`), siguiendo el patrón ya usado en los controladores existentes.

### `database/schema.ts` es generado, no se edita a mano

Adonis 7 genera las clases base (`UserSchema`, `AuthAccessTokenSchema`, con sus `@column`) a partir de las migraciones cada vez que corre `node ace migration:run`. Los modelos reales (`app/models/user.ts`) hacen `extends compose(UserSchema, withAuthFinder(hash))` en vez de declarar columnas ellos mismos. Para añadir/cambiar columnas: crear una migración nueva en `database/migrations/` y correr `node ace migration:run`; nunca tocar `database/schema.ts` directamente. Reglas de generación de schema personalizadas van en `database/schema_rules.ts` (vacío por ahora).

### Rutas y controladores van por registro generado, no por import directo

`start/routes.ts` no importa las clases de controlador: usa `controllers.NewAccount`, `controllers.AccessTokens`, etc. desde `#generated/controllers` (`.adonisjs/server/controllers.ts`), generado por el hook `indexEntities()` en `adonisrc.ts`. Al crear un controlador nuevo, este registro se regenera automáticamente al arrancar (`node ace serve`); no hace falta registrarlo a mano.

Los nombres de ruta (`.as('auth')`, `.as('profile')` combinados con el nombre de la acción) determinan las claves del cliente tipado que genera Tuyau (`.adonisjs/client/registry/`, hook `generateRegistry()` en `adonisrc.ts`), p. ej. `auth.new_account.store` → `POST /api/v1/auth/signup`. Si se renombra una ruta o un grupo, cambia la clave del registry — hay que revisar quién la consume.

### Respuestas de API: `serialize`, no `return` a pelo

`providers/api_provider.ts` añade `ctx.serialize()` a `HttpContext`, que envuelve toda respuesta en `{ data: ... }` (`ApiSerializer` con `wrap: 'data'`). Los controladores deben devolver `serialize(...)` (ver `profile_controller.ts`, `access_tokens_controller.ts`) para mantener una forma de respuesta consistente en toda la API, salvo casos como `AccessTokensController#destroy` que devuelven un mensaje plano.

Antes de serializar, los datos de dominio se dan forma con `BaseTransformer` (`app/transformers/user_transformer.ts`): `pick()` de los campos públicos del modelo. Un modelo nuevo que se vaya a exponer por API necesita su propio transformer siguiendo ese patrón, en vez de serializar el modelo Lucid directamente.

### Autenticación: dos guards

`config/auth.ts` define dos guards sobre el mismo modelo `User`:

- `api` (default): `tokensGuard` con `DbAccessTokensProvider` — auth por token para la API stateless (`Authorization: Bearer ...`).
- `web`: `sessionGuard` — auth por sesión/cookie, sin remember-me.

Las rutas protegidas usan `.use(middleware.auth())` (named middleware definido en `start/kernel.ts`, guard por defecto = `api`). `SilentAuthMiddleware` corre en el stack global del router y hace `auth.check()` sin bloquear, para que `auth.user` esté disponible sin exigir login.

### Validación y errores

Los validators usan VineJS (`app/validators/user.ts`); reglas compartidas (email, password) se factorizan como funciones (`email()`, `password()`) reutilizadas entre `signupValidator` y `loginValidator`. `app/exceptions/handler.ts` delega en el `ExceptionHandler` de Adonis sin lógica propia todavía.

### Base de datos

SQLite vía `better-sqlite3`, fichero en `backend/tmp/db.sqlite3` (`config/database.ts`). `schemaGeneration.enabled: true` es lo que mantiene `database/schema.ts` sincronizado con las migraciones.

## Frontend

Plantilla Vite + React 19 + TypeScript, sin librerías de routing/estado/HTTP añadidas todavía y sin cliente Tuyau instalado en `frontend/package.json` (aunque el backend ya expone el registry en `.adonisjs/client/registry/`). Lint con `oxlint` (`frontend/.oxlintrc.json`), no ESLint.

## Reglas de proceso
- Antes de tocar código: crear una rama nueva (`git checkout -b feat/<slug>`). Nunca
commitear directo en `main`/`s1/start`.
- Al cerrar la tarea: usar la skill `/commit`, luego `gh pr create` con una descripción
completa de los cambios en el cuerpo del PR.
- Después de abrir el PR: usar el subagente `adversarial-reviewer` sobre él, antes de
darlo por terminado.
- No repitas ese resumen en el chat: la sesión se va a perder, el PR no. Responde solo
con la URL del PR.