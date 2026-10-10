# Arquitectura de FlowSync

Este documento muestra, en dos diagramas C4 escritos en Mermaid, cómo está montado FlowSync hoy. El primero (contenedores) enseña las piezas desplegables y cómo se hablan: una SPA de React, una API AdonisJS y una base de datos SQLite. El segundo (componentes) abre el frontend y la API y enseña sus módulos internos: rutas, controladores, validadores, modelos y transformers por un lado; rutas, guards, páginas y cliente HTTP por el otro. Solo aparece lo que se ha podido verificar leyendo el código (`backend/start/routes.ts`, `backend/app/**`, `backend/config/database.ts`, `frontend/src/**`); lo que no está en el código no se dibuja.

## Diagrama de contenedores

```mermaid
C4Container
    title FlowSync — contenedores

    Person(user, "Miembro del equipo", "Gestiona las tareas del espacio compartido")

    System_Boundary(flowsync, "FlowSync") {
        Container(spa, "Frontend", "React 19, Vite 8, react-router, Tailwind v4, shadcn/ui", "SPA en localhost:5173. Guarda el token en localStorage (flowsync.token)")
        Container(api, "Backend API", "AdonisJS 7, Lucid 22, VineJS 4", "API REST bajo /api/v1 en localhost:3333. Respuestas envueltas en { data }")
        ContainerDb(db, "Base de datos", "SQLite (better-sqlite3)", "tmp/db.sqlite3: tablas users, auth_access_tokens y tasks")
    }

    Rel(user, spa, "Usa", "navegador")
    Rel(spa, api, "Llama", "JSON/HTTP, Authorization: Bearer")
    Rel(api, db, "Lee y escribe", "Lucid / Knex")
```

## Diagrama de componentes

```mermaid
C4Component
    title FlowSync — componentes del frontend y de la API

    Container_Boundary(spa, "Frontend (React)") {
        Component(routes, "AppRoutes", "react-router", "/login y /register (PublicOnlyRoute); /tasks, /tasks/:id y /profile (ProtectedRoute)")
        Component(authprov, "AuthProvider + useAuth", "React context", "Sesión: token en localStorage, rehidratada con GET /account/profile")
        Component(pages, "Páginas", "React", "LoginPage, RegisterPage, TasksPage, TaskPage, ProfilePage")
        Component(widgets, "Componentes propios", "React", "TaskItem, TaskFilter, AuthLayout, FieldError, FullScreenLoader")
        Component(apilib, "lib/api.ts", "fetch", "Único punto de contacto con el backend; desenvuelve { data } y traduce errores a ApiError")
    }

    Container_Boundary(api, "Backend API (AdonisJS)") {
        Component(router, "start/routes.ts", "Router", "Grupos auth, account y tasks bajo /api/v1; auth() sobre account y tasks")
        Component(mw, "Middleware", "AdonisJS", "force_json_response, cors, bodyparser, initialize_auth, silent_auth y auth")
        Component(authctl, "Controladores de cuenta", "AccessTokensController, NewAccountController, ProfileController", "Alta, login, logout y perfil")
        Component(taskctl, "Controladores de tareas", "TasksController, TaskStatusesController, TaskDueDatesController", "Lista, detalle, alta, cambio de estado y de fecha de vencimiento")
        Component(valid, "Validadores", "VineJS (validators/user.ts, validators/task.ts)", "Validan la entrada de cada controlador")
        Component(models, "Modelos", "Lucid (User, Task)", "Task pertenece a un User (assignee); User emite access tokens")
        Component(trans, "Transformers", "BaseTransformer", "UserTransformer, TaskTransformer, TaskDetailTransformer, TaskAssigneeTransformer")
        Component(serial, "ApiSerializer", "providers/api_provider.ts", "serialize() envuelve cada respuesta en { data }")
    }

    ContainerDb(db, "SQLite", "tmp/db.sqlite3", "users, auth_access_tokens, tasks")

    Rel(routes, pages, "Monta")
    Rel(routes, authprov, "Guards consultan la sesión")
    Rel(pages, widgets, "Usan")
    Rel(pages, authprov, "Leen el token y la sesión")
    Rel(pages, apilib, "Llaman")
    Rel(authprov, apilib, "Perfil y logout")
    Rel(apilib, router, "HTTP/JSON", "/api/v1/*")

    Rel(router, mw, "Pasa por")
    Rel(router, authctl, "Despacha")
    Rel(router, taskctl, "Despacha")
    Rel(authctl, valid, "Valida con")
    Rel(taskctl, valid, "Valida con")
    Rel(authctl, models, "Usa")
    Rel(taskctl, models, "Usa")
    Rel(authctl, trans, "Serializa con")
    Rel(taskctl, trans, "Serializa con")
    Rel(trans, serial, "Salida envuelta por")
    Rel(models, db, "Lee y escribe", "Lucid")
```

## Notas de lectura

- **Rutas de la API** (`backend/start/routes.ts`): `POST /auth/signup`, `POST /auth/login`, `GET /account/profile`, `POST /account/logout`, `GET|POST /tasks`, `GET /tasks/:id`, `PATCH /tasks/:id/status`, `PUT /tasks/:id/due-date`. Todas bajo `/api/v1`; las de `account` y `tasks` exigen sesión.
- **Cada controlador de tareas** usa el transformer que le corresponde: la lista, el alta y el cambio de estado usan `TaskTransformer`; el detalle y la fecha de vencimiento usan `TaskDetailTransformer`. Ambos serializan el responsable con `TaskAssigneeTransformer`.
- Los componentes de `frontend/src/components/ui/` son los generados por shadcn y no se dibujan.
