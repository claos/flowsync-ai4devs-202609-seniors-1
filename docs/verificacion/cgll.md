**Scenarios en el requisito:** `3` · **Cubiertos:** `0`

| Scenario | Test que lo cubre | Estado | Bloqueo / Razón (solo si es No lo sé) |
|---|---|---|---|
| Al obtener una tarea de "Ada Lovelace", su `assignee` trae nombre e iniciales | | No lo sé | Solo hay tests de iniciales sobre la cuenta (login), ninguno lee `assignee` de una tarea |
| Al obtener cualquier tarea (suelta o en lista), su `assignee` no incluye email ni datos de acceso | | NO cubierto | - |
| Si el responsable se registró sin nombre, el nombre llega nulo y las iniciales siguen llegando | | No lo sé | Los tests de cuenta sin nombre miran signup/login, no el `assignee` de una tarea |
