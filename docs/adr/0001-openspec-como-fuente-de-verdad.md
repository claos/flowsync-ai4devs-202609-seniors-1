# 1. OpenSpec como fuente de verdad viva del comportamiento

## Estado

Aceptada (2026-10-10).

## Contexto

FlowSync describe su comportamiento con OpenSpec (`openspec/config.yaml`, esquema `spec-driven`). Lo que hay hoy en `openspec/`:

- **Specs vivas**, una por capability: `openspec/specs/auth/spec.md` (19 requisitos, 45 scenarios) y `openspec/specs/tasks/spec.md` (32 requisitos, 124 scenarios). Cada requisito es un `SHALL` con sus scenarios `WHEN/THEN`.
- **Changes archivados**, tres, todos de 2026-08-13: `add-task-list`, `add-task-due-date` y `add-task-status-filter`. Cada uno guarda su `proposal.md` (el porqué), `design.md` (las decisiones), `tasks.md` (el trabajo) y una **delta-spec** en `specs/<capability>/spec.md`.
- **Las deltas son lo que modifica la spec viva.** Usan las secciones `## ADDED Requirements` y `## MODIFIED Requirements`. `add-task-list` creó la capability `tasks` y modificó tres requisitos de `auth`; `add-task-due-date` añadió los requisitos del vencimiento; `add-task-status-filter` añadió los del filtro y modificó varios requisitos de `tasks` (entre ellos «Una sola lista compartida del espacio»). Al archivar, la delta se funde en la spec viva (commits `04940fc` y `209df12`).

Esto convive con dos hechos que el repo también registra:

- Los changes no han ido siempre por delante del código. `add-task-status-filter` dice en su propuesta que «documenta comportamiento que ya está implementado», y su `design.md` está escrito en pasado.
- Las verificaciones no son automáticas. `add-task-due-date` declara «Sin tests» como decisión explícita, y quedan sin marcar 9 tareas de verificación manual (5 en `add-task-due-date`, 4 en `add-task-list`). La spec de `tasks` no tenía ni un test que la trazara.

Había que decidir dónde vive la respuesta a «¿qué debe hacer FlowSync?»: en el código, en los tickets, en la cabeza de quien lo escribió, o en un único documento mantenido.

## Decisión

La **spec viva de `openspec/specs/` es la fuente de verdad del comportamiento** de FlowSync. Concretamente:

1. Un cambio de comportamiento se expresa como un change con delta-spec (`ADDED`, `MODIFIED`), y esa delta se funde en la spec viva al archivarlo. La spec viva nunca se edita aparte del flujo de changes.
2. Cuando el código y la spec discrepan, la spec es la referencia: o se corrige el código, o se abre un change que modifique el requisito. No se resuelve en silencio a favor del código.
3. Los changes archivados se conservan como **historia de las decisiones**: el porqué vive en `proposal.md` y `design.md`, no en la spec viva, que solo dice qué debe cumplirse.
4. Los scenarios son el vocabulario común para tests, documentación de la API y revisiones de PR: se citan por nombre.

## Consecuencias

**Lo que ganamos**

- Una sola respuesta, legible por producto y por desarrollo, a «qué hace el sistema», en lugar de repartirla entre tickets, código y conversaciones.
- Las deltas dejan rastro de por qué cambió algo y de qué requisito corrigió. `add-task-status-filter` lo muestra: declara que la vista por defecto ya no es «todas» y modifica por escrito el requisito vivo que eso volvía falso.
- Los scenarios son directamente trazables a tests: la tabla scenario → test se puede construir leyendo los ficheros.
- Lo que se decide que no se hace queda escrito («Sin tests», los puntos abiertos), no escondido.

**Lo que nos cuesta**

- **La spec se desvía del código sin que nada lo detecte.** No hay ninguna comprobación automática entre ambos. Hoy ya pasa: el `design.md` del filtro dice que el validador es `vine.enum(TASK_STATUSES).optional()`, pero el código usa `vine.string().optional()` (commit `8c15707`), de modo que `GET /api/v1/tasks?status=archivado` responde `200` con lista vacía, justo lo que los scenarios «Estado inventado» y «El error no se confunde con la ausencia» prohíben. Una fuente de verdad que nadie contrasta es una opinión con buen formato.
- **Sin tests que la sostengan, la spec es una promesa.** De los 124 scenarios de `tasks`, ninguno tenía test al empezar a trazarlos, y el único requisito cubierto hoy es «Lo que cada tarea muestra de su responsable». El coste de cerrar esa brecha es real y se paga scenario a scenario.
- **Verificación manual pendiente.** Hay 9 tareas de comprobación sin marcar en changes ya archivados: se archivó con trabajo de verificación sin hacer.
- **Ceremonia por cada cambio.** Una modificación pequeña exige proposal, design, tasks y delta. Un `MODIFIED` obliga además a reescribir el requisito entero, así que la delta duplica texto largo y revisarla cuesta más que revisar el diff de código.
- **Spec escrita después del código.** Documentar lo ya implementado (el filtro) invierte el orden que justifica el método: la spec describe en lugar de gobernar, y puede cristalizar un comportamiento que nadie decidió.
- **Fuentes paralelas que mantener a mano.** El documento OpenAPI de `/api.json` se anota a mano en los controladores y no se deriva de la spec, así que hay dos descripciones de la API que pueden divergir. Los scenarios de pantalla (una parte muy grande de la spec de `tasks`) no tienen ningún mecanismo de comprobación: el frontend no tiene runner de tests.
- **Fricción de herramienta.** Los requisitos están en castellano y en prosa larga; la spec de `tasks` es un único fichero de más de setecientas líneas, y el esquema `spec-driven` no sabe nada de nuestros tests ni de nuestro código.

**Lo que esta decisión no resuelve** (queda abierto, no decidido aquí): cómo se enlaza cada scenario con su test, quién comprueba la deriva entre spec y código, y si OpenAPI debe generarse desde la spec o seguir anotado a mano.
