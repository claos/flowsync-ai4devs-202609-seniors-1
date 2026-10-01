## Requirements

### Requirement: Una tarea está vencida si su fecha límite ya pasó y no está hecha
El sistema SHALL considerar vencida una tarea si y solo si tiene fecha límite anterior
a la fecha actual y su estado no es `hecho`. Una tarea sin fecha límite SHALL no estar
vencida nunca.

#### Scenario: Fecha pasada y tarea sin terminar
- **WHEN** un usuario lee una tarea en estado `pendiente` cuya fecha límite fue ayer
- **THEN** el sistema la señala como vencida

#### Scenario: Fecha pasada pero tarea hecha
- **WHEN** un usuario lee una tarea en estado `hecho` cuya fecha límite fue ayer
- **THEN** el sistema no la señala como vencida

#### Scenario: Tarea sin fecha límite
- **WHEN** un usuario lee una tarea sin fecha límite en estado `pendiente`
- **THEN** el sistema no la señala como vencida

## MODIFIED Requirements
### Requirement: Crear una tarea
El sistema SHALL permitir crear una tarea con un título y, opcionalmente, un responsable,
un estado inicial y una fecha límite. La respuesta SHALL incluir su fecha límite y si
está vencida.

#### Scenario: Creación con título válido
- **WHEN** un usuario autenticado crea una tarea con el título "Redactar el informe"
- **THEN** el sistema persiste la tarea y responde `201` con la tarea creada

#### Scenario: Creación con fecha límite
- **WHEN** un usuario crea una tarea con el título "Preparar la demo" y una fecha futura
- **THEN** el sistema responde `201` con la tarea, que lleva esa fecha y no está vencida