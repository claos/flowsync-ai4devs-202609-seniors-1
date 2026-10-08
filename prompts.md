# Prompts

Aquí van **todos los prompts que lanzaste** para hacer el ejercicio, en el orden en que los
lanzaste, con el modelo y la herramienta de cada uno.

Esto no es papeleo. Lo que se revisa es **cómo pediste las cosas**, no solo lo que salió: un
resultado flojo con un prompt bueno y un resultado flojo con un prompt vago necesitan feedback
distinto, y sin este archivo no se distinguen.

## Cómo rellenarlo

- Un apartado `## Prompt N` por cada prompt.
- **Pega el prompt tal cual lo lanzaste**, dentro del bloque de código, aunque ocupe diez líneas
  y aunque tenga faltas. No lo reescribas para que quede bien: el que arreglaste mentalmente
  después no es el que lanzaste.
- Incluye también los que **no funcionaron**. Suelen ser los más útiles de leer.
- `Modelo` y `Herramienta` en todos. Si cambiaste de una a otra a mitad, se nota aquí.

Borra el ejemplo de abajo cuando escribas el primero.

---

## Prompt 1

**Modelo:** Sonnet medium
**Herramienta:** Claude Code

```
### 1. CONTEXTO / ROLE

Analista de QA / Ingeniero de Pruebas. Tienes acceso de solo lectura a la especificación viva en `openspec tasks` y a la suite de pruebas del backend.

### 2. OBJETIVO / TAREA

Generar la matriz de trazabilidad mapeando scenario por scenario para el requerimiento **"Lo que cada tarea muestra de su responsable"** dentro de la capacidad de `openspec tasks`, comparándolo únicamente contra la suite de pruebas del backend y guardando el resultado en `./docs/verificacion/cgll.md`.

### 3. CRITERIOS DE ÉXITO EXPLÍCITOS

Sabes que terminaste cuando:

* Escribes/guardas el informe final directamente en el archivo `./docs/verificacion/cgll.md`.
* El informe evalúa **exclusivamente** los escenarios asociados al requerimiento **"Lo que cada tarea muestra de su responsable"**.
* La entrega empieza con los dos métricos formateados exactamente así encima de la tabla:
* **Scenarios en el requisito:** `[Número anotado al empezar]` · **Cubiertos:** `[Número calculado al terminar]`


* La tabla de trazabilidad contiene **exactamente 4 columnas**:
1. `Scenario`
2. `Test que lo cubre`
3. `Estado`
4. `Bloqueo / Razón (solo si es No lo sé)`


* Cada fila cumple estrictamente con lo siguiente:
* **`Scenario`**: Resumido en **una sola línea** (qué se espera y en qué situación). Si no cabe en una línea, divídelo porque estás juntando dos escenarios.
* **`Test que lo cubre`**: Contiene el **nombre exacto** del test tal como aparece en la suite del backend. Si no hay un nombre concreto, la celda queda **vacía**.
* **`Estado`**: Usa exclusivamente uno de los 3 valores válidos: **Cubierto**, **NO cubierto** o **No lo sé**.
* **`Bloqueo / Razón`**: Si el estado es **No lo sé**, incluye en media línea qué faltó para decidirlo (ej. no se encontró dónde se comprueba o el test encontrado no valida exactamente lo mismo). Si está Cubierto o NO cubierto, se deja vacía o con un guion (`-`).



### 4. RESTRICCIONES / ANTIPATTERNS

* **No cambies nada:** No modifiques ni reescribas el texto ni la lógica de los escenarios o los tests existentes.
* **Alcance acotado:** No evalúes otros requerimientos de `openspec tasks` ni busques pruebas fuera del backend (ignora frontend, e2e, etc.).
* **Formato no negociable:** No agregues ni quites columnas a la tabla. No cambies la estructura ni omitas los contadores superiores.
* No inventes nombres de tests ni asumas cobertura implícita.

### 5. RECURSOS

* Especificación de `openspec tasks` (requerimiento: "Lo que cada tarea muestra de su responsable").
* Suite de pruebas del backend.
* Archivo de destino: `./docs/verificacion/cgll.md`.

### 6. CLARIFICACIÓN

* Si no encuentras dónde se comprueba un escenario en el backend o hay un test similar pero ambiguo, marca el estado como **No lo sé** y documenta la razón exacta en la cuarta columna.
```

**Qué salió:** Funcionó a la primera:

**Scenarios en el requisito:** `3` · **Cubiertos:** `0`

| Scenario | Test que lo cubre | Estado | Bloqueo / Razón (solo si es No lo sé) |
|---|---|---|---|
| Al obtener una tarea de "Ada Lovelace", su `assignee` trae nombre e iniciales | | No lo sé | Solo hay tests de iniciales sobre la cuenta (login), ninguno lee `assignee` de una tarea |
| Al obtener cualquier tarea (suelta o en lista), su `assignee` no incluye email ni datos de acceso | | NO cubierto | - |
| Si el responsable se registró sin nombre, el nombre llega nulo y las iniciales siguen llegando | | No lo sé | Los tests de cuenta sin nombre miran signup/login, no el `assignee` de una tarea |

## Prompt 2

**Modelo:** Sonnet medium
**Herramienta:** Claude Code

```
### 1. CONTEXTO / ROLE

Desarrollador / QA Engineer trabajando en la suite de pruebas del backend. Tienes acceso a la matriz de trazabilidad previa en `./docs/verificacion/cgll.md` y a la carpeta de pruebas.

### 2. OBJETIVO / TAREA

Escribir en la carpeta de pruebas el test correspondiente a cada escenario marcado como **NO cubierto** y ejecutarlos para comprobar su resultado, sin alterar el código de producción.

### 3. CRITERIOS DE ÉXITO EXPLÍCITOS

Sabes que terminaste cuando:

* Has creado **exactamente un test nuevo por cada escenario** marcado como **NO cubierto** en la matriz.
* Los nuevos tests siguen fielmente las convenciones, nombrado y estilo de los tests existentes en la suite del backend.
* Has ejecutado la suite de pruebas para comprobar el resultado de los nuevos tests (pueden pasar o fallar según el estado actual del código).

### 4. RESTRICCIONES / ANTIPATTERNS

* **Cero cambios fuera de la carpeta de tests:** Está estrictamente prohibido tocar o modificar código de producción (controladores, servicios, modelos, etc.), incluso si un test falla debido a un bug o a una funcionalidad no implementada.
* **Sin falsos verdes:** No fuerces los assert ni alteres la lógica del test para que passe artificialmente. El test debe reflejar fielmente lo que especifica el escenario.

### 5. RECURSOS

* Matriz de trazabilidad en `./docs/verificacion/cgll.md`.
* Suite de tests del backend como referencia de patrones, utilidades y convenciones.

### 6. CLARIFICACIÓN

* Si un test recién creado falla durante la ejecución, documenta la falla en tu reporte final indicando que se debe a la ausencia o error en la implementación del código fuente, sin modificar este último.
```

**Qué salió:** Funcionó a la primera, se creo el archivo assignee.spec.ts
```
./backend/tests/
├── bootstrap.ts
└── functional
    ├── auth
    │   ├── initials.spec.ts
    │   ├── login.spec.ts
    │   ├── session.spec.ts
    │   └── signup.spec.ts
    └── tasks
        └── assignee.spec.ts
```


