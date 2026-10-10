# Capability de tareas

La lista de trabajo compartida del equipo: una sola lista con todas las tareas del espacio, donde apuntar algo cuesta escribir un título y donde el responsable y el estado de cada tarea se leen sin abrir nada. Sirve para responder «¿en qué anda cada uno?» sin preguntar a nadie.

**El comportamiento exacto vive en la spec, no aquí:** [`openspec/specs/tasks/spec.md`](../../../openspec/specs/tasks/spec.md). Este README es un mapa del código y de cómo probarlo, y por eso no repite las reglas: enlaza el requisito de la spec donde se definen.

## Qué hace

Una tarea tiene título, estado, responsable y, opcionalmente, una fecha de vencimiento. Se crea, se lista (acotada o no por estado), se consulta suelta, se le cambia el estado y se le pone, cambia o quita la fecha. Toda la capability exige sesión.

## Endpoints

Todos bajo `/api/v1/tasks` y con `Authorization: Bearer <token>`. Rutas en `backend/start/routes.ts`.

| Método y ruta | Controlador | Para qué |
|---|---|---|
| `GET /tasks` | `TasksController.index` | Lista; `?status=` acota por un estado |
| `POST /tasks` | `TasksController.store` | Crea una tarea a partir del título |
| `GET /tasks/:id` | `TasksController.show` | Una tarea con su vencimiento; exige `?today=AAAA-MM-DD` |
| `PATCH /tasks/:id/status` | `TaskStatusesController.update` | Cambia el estado |
| `PUT /tasks/:id/due-date` | `TaskDueDatesController.update` | Fija, cambia o retira la fecha (`dueDate`, más `today`) |

La referencia detallada (parámetros, cuerpos, códigos y esquemas) es el documento OpenAPI que sirve la propia API: `GET /api.json` (UI en `GET /api`). Está anotado a mano en los controladores y los esquemas compartidos están en `backend/app/openapi/schemas.ts`.

## Reglas de negocio

Cada regla está en la spec; aquí solo se dice dónde buscarla y dónde se aplica en el código.

| Tema | Requisito de la spec | Dónde se aplica |
|---|---|---|
| Alta solo con título; nace pendiente y a nombre de quien la crea | «Creación de una tarea con solo el título» | `TasksController.store` |
| Título obligatorio y de hasta 200 caracteres | «Ninguna tarea sin título», «Aviso ante un título demasiado largo» | `createTaskValidator` (`app/validators/task.ts`) |
| Lista única, orden y alcance por defecto | «Una sola lista compartida del espacio» | `TasksController.index`, `DEFAULT_LIST_STATUSES` en el modelo |
| Qué se ve del responsable (sin email) | «Lo que cada tarea muestra de su responsable» | `TaskAssigneeTransformer` |
| Tres estados fijos y cambio libre entre ellos | «Tres estados fijos», «Cambio de estado de cualquier tarea» | `TASK_STATUSES` en el modelo, `updateTaskStatusValidator` |
| Sesión obligatoria | «Las tareas exigen sesión» | `middleware.auth()` sobre el grupo `tasks` |
| Fecha de vencimiento opcional y su edición | «Fecha de vencimiento opcional», «Fijar, cambiar y retirar la fecha de vencimiento» | `TaskDueDatesController`, `setTaskDueDateValidator` |
| Cuándo está vencida y quién pone el día de referencia | «Cuándo una tarea está vencida», «El día de referencia lo pone quien mira» | `Task.isOverdueOn`, `taskReferenceDayValidator` |
| La lista no lleva el vencimiento | «La lista no lleva el vencimiento» | `TaskTransformer` frente a `TaskDetailTransformer` |
| Acotar la lista por estado | «Acotar la lista por estado» y siguientes | `listTasksValidator`, `TasksController.index` |

Las pantallas (lista, detalle, filtro, señal de vencida) están descritas en los requisitos de pantalla de la misma spec y viven en `frontend/src/pages/tasks-page.tsx`, `task-page.tsx` y `components/task-item.tsx`, `task-filter.tsx`. Toda llamada a la API pasa por `frontend/src/lib/api.ts`.

### Diferencias conocidas entre la spec y el código

- Un `status` que no es ninguno de los tres estados responde hoy `200` con lista vacía, y la spec exige `422` («Un estado que no existe se rechaza, no se responde vacío»). `listTasksValidator` declara `status` como texto libre.

## Cómo se prueba en local

Todos los comandos, desde `backend/` o `frontend/` (no hay `package.json` raíz).

**Tests de integración (Japa)**

```bash
cd backend
npm install
cp .env.example .env && node ace generate:key   # solo la primera vez
node ace migration:run
npm test                                        # toda la suite
node ace test functional --files=assignee       # solo los tests de tareas que hay
```

Hoy los tests de esta capability están en `backend/tests/functional/tasks/` y cubren solo el requisito del responsable; el resto de la spec no tiene tests. Las suites functional usan el mismo fichero SQLite que el servidor de desarrollo: aísla los tests que escriben con `testUtils.db().withGlobalTransaction()`, como hacen los existentes.

**A mano, contra la API**

```bash
cd backend && npm run dev                       # http://localhost:3333
```

Regístrate (`POST /api/v1/auth/signup` con `fullName`, `email`, `password` y `passwordConfirmation`) y usa el `data.token` de la respuesta como `Authorization: Bearer <token>`. La UI del documento OpenAPI está en `http://localhost:3333/api`.

**Con la interfaz**

```bash
cd frontend && npm install && npm run dev       # http://localhost:5173
```

El frontend no tiene runner de tests; `npm run build` hace el typecheck y `npm run lint` pasa oxlint.
