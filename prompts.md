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

**Modelo:** Sonnet Medium
**Herramienta:** Claude Code

```
# Rol

Actúa como un agente senior de ingeniería de software especializado en reverse engineering funcional, análisis de comportamiento observable y documentación de sistemas existentes.

Tu tarea es inspeccionar el repositorio actual y reconstruir, a partir de evidencia verificable en el código, la especificación funcional vigente de un vertical concreto del sistema.

No estás diseñando funcionalidad nueva.

No estás proponiendo mejoras.

No estás documentando la arquitectura interna.

Estás describiendo **la verdad observable de lo que el sistema hace hoy**.

# Objetivo

Explora el repositorio y escribe la especificación actual del siguiente vertical funcional:

**Cuentas y acceso**

El alcance incluye exclusivamente estas dos capas:

1. **API**: comportamiento observable a través de peticiones y respuestas.
2. **Interfaz de usuario**: comportamiento observable por una persona en pantalla, incluyendo lo que puede ver, introducir, seleccionar, ejecutar y recibir como resultado.

No documentes ningún otro vertical, aunque encuentres funcionalidad relacionada o consideres útil ampliarlo.

## Funcionalidades a explorar

Explora únicamente las funcionalidades indicadas a continuación:

- Registro de perfil
- Inicio de sesión
- Cierre de sesión
- Visualización de perfil

Estas funcionalidades delimitan el vertical.

Puedes seguir dependencias técnicas cuando sea necesario para comprender su comportamiento, pero **no amplíes el alcance funcional de la spec**.

# Fuente de formato

Archivo de ejemplo con estructura y contenido de una spec en /docs/specs/specs-ref.md

Úsalo como referencia adicional de estilo y nivel de detalle, pero las reglas de formato establecidas en este prompt son autoritativas y prevalecen ante cualquier diferencia con el ejemplo.

# Entregable

Crea la spec directamente como **un archivo versionado dentro del proyecto**.

No entregues la spec únicamente en el chat.

Antes de crear el archivo:

1. inspecciona la estructura del repositorio;
2. identifica dónde se almacenan actualmente specs, documentación funcional o artefactos equivalentes;
3. sigue la convención existente del proyecto si existe;
4. si no existe una ubicación inequívoca, crea una ubicación razonable dentro del repositorio para documentación versionada, sin reorganizar archivos existentes.

Usa un nombre de archivo descriptivo y estable para la capability de cuentas y acceso.

No modifiques ningún otro archivo salvo que sea estrictamente necesario para crear el nuevo archivo de spec. En particular, **no modifiques código de aplicación, tests, configuración ni infraestructura**.

# Formato obligatorio de la spec

El archivo debe estar escrito en castellano, excepto las palabras normativas en mayúsculas indicadas a continuación.

La estructura es obligatoria.

Debe comenzar con:


## Purpose


Incluye una o dos frases que expliquen para qué existe esta capability desde el punto de vista del usuario o consumidor del sistema.

Después:

## Requirements


Cada comportamiento debe expresarse mediante uno o más bloques:


### Requirement: <nombre descriptivo>

El sistema SHALL <comportamiento observable>.

#### Scenario: <nombre descriptivo>

- **WHEN** <acción, petición o situación observable, incluyendo aquí cualquier precondición necesaria>
- **THEN** <resultado observable>


Reglas obligatorias:

- Cada `### Requirement:` debe describir un comportamiento que el sistema **SHALL** realizar.
- Cada requisito debe tener al menos un `#### Scenario:`.
- Cada escenario debe contener exactamente el esquema conceptual `WHEN` / `THEN`.
- No agregues una línea `GIVEN`.
- Si existe una precondición, incorpórala dentro de `WHEN`.
- Puedes incluir varios escenarios bajo el mismo requisito cuando existan variantes relevantes.
- Divide requisitos cuando representen obligaciones funcionales distintas.
- Evita agrupar demasiados comportamientos independientes en un solo requisito.

# Alcance de observabilidad

Documenta exclusivamente comportamiento observable desde fuera del sistema.

## Para la API

Puedes documentar, cuando esté respaldado por el repositorio:

- operación que puede solicitar un consumidor;
- inputs observables;
- parámetros relevantes;
- datos mínimos exigidos;
- respuesta observable;
- códigos o categorías de resultado;
- mensajes de error relevantes;
- restricciones funcionales observables;
- diferencias de comportamiento según la petición;
- efectos posteriores observables por el consumidor.

No documentes implementación interna.

## Para la interfaz

Puedes documentar:

- qué ve una persona;
- qué acciones puede realizar;
- qué campos puede introducir;
- qué opciones puede seleccionar;
- qué validaciones visibles existen;
- qué mensajes recibe;
- cómo cambia la pantalla como consecuencia de una acción;
- qué navegación o resultado observable se produce;
- qué estados de acceso o cuenta puede percibir.

No documentes componentes internos ni detalles de implementación.

# Reglas duras

## 1. Esto no es un delta

La spec representa la **verdad actual del sistema**.

No utilices en ningún lugar del archivo:

- `ADDED`
- `MODIFIED`
- `REMOVED`

No estructures el documento como cambios respecto de una versión anterior.

No expliques qué era diferente antes.

## 2. Prohibidos los detalles internos

La spec no debe contener:

- nombres de clases;
- nombres de funciones o métodos;
- nombres de archivos;
- rutas del repositorio;
- nombres de componentes internos;
- nombres de tablas;
- detalles de implementación;
- decisiones arquitectónicas;
- referencias al código fuente como justificación.

Puedes usar toda esa información durante tu investigación, pero debe desaparecer de la especificación final.

La prueba para cada frase de la spec es:

> ¿Puede observar esto directamente un consumidor de la API o una persona utilizando la interfaz?

Si la respuesta es no, no pertenece al archivo.

## 3. No modificar el producto

No cambies código.

No corrijas defectos.

No ajustes comportamiento.

No agregues tests para hacer coincidir el sistema con una expectativa.

No refactorices.

No cambies configuración.

Si encuentras inconsistencias, errores, comportamientos extraños o diferencias entre API e interfaz, **documenta únicamente aquello que puedas verificar que ocurre hoy**.

El repositorio es la evidencia; no es un objeto a corregir durante este ejercicio.

# Método de exploración

Realiza una investigación suficiente para cubrir las funcionalidades indicadas.

No asumas que el primer endpoint, componente o test encontrado representa por sí solo todo el comportamiento.

Contrasta, según aplique:

- puntos de entrada de la API;
- validaciones;
- contratos o esquemas;
- manejo de errores;
- pruebas automatizadas existentes;
- flujos de navegación;
- formularios;
- estados visibles;
- llamadas de frontend a backend;
- respuestas y tratamiento visible de dichas respuestas.

Usa tests existentes como evidencia cuando ayuden a confirmar comportamiento, pero no conviertas detalles de tests en requisitos si no son observables externamente.

Cuando encuentres una funcionalidad tanto en API como en interfaz, verifica ambas capas antes de redactar el requisito correspondiente cuando sea posible.

# Disciplina frente a inferencias

No conviertas una posibilidad del código en un hecho funcional.

Incluye un requisito o escenario únicamente cuando exista evidencia suficiente para concluir que ese comportamiento forma parte del sistema actual.

Si existen múltiples caminos de ejecución, verifica cuál o cuáles son efectivamente alcanzables desde el comportamiento externo.

Si una conclusión depende de una inferencia razonable pero no completamente comprobada, continúa explorando antes de incorporarla.

Si al finalizar persiste incertidumbre material, es preferible **no afirmar el comportamiento como requisito** antes que inventar certeza.

# Restricción de alcance

Detén la exploración funcional cuando hayas cubierto razonablemente:

- las funcionalidades indicadas en este prompt;
- su comportamiento observable a través de la API;
- su comportamiento observable en interfaz.

No continúes hacia:

- administración general;
- otros módulos;
- reporting;
- configuración no relacionada;
- funcionalidades adyacentes;
- capacidades que no sean cuentas y acceso.

Aunque detectes otras áreas interesantes, no las documentes.

# Revisión antes de terminar

Antes de finalizar, revisa el archivo completo y confirma:

1. que existe `## Purpose`;
2. que existe `## Requirements`;
3. que todos los requisitos usan `### Requirement:`;
4. que todos expresan una obligación mediante `SHALL`;
5. que cada requisito tiene al menos un `#### Scenario:`;
6. que cada escenario tiene `**WHEN**` y `**THEN**`;
7. que no existe ningún `GIVEN`;
8. que no aparece `ADDED`, `MODIFIED` ni `REMOVED`;
9. que no existen nombres de clases, archivos, funciones ni rutas de código;
10. que todo comportamiento descrito es observable externamente;
11. que el contenido se limita al vertical de cuentas y acceso;
12. que se cubren únicamente las funcionalidades solicitadas;
13. que no se ha modificado código del producto.

Corrige el archivo si incumple cualquiera de estas condiciones.

# Salida final

La salida principal del ejercicio es el archivo versionado creado en el repositorio.

Una vez escrito y revisado:

- indica brevemente qué archivo creaste;
- resume qué funcionalidades quedaron cubiertas;
- indica cualquier funcionalidad solicitada que no hayas podido verificar con suficiente confianza;
- no pegues nuevamente en el chat el contenido completo de la spec;
- no continúes explorando otros verticales;
- no propongas automáticamente una siguiente fase.
```

**Qué salió:** (opcional, una línea) funcionó a la primera / tuve que insistir / me inventó una ruta que no existe.
