# A: la matriz y los tests que faltan, con reloj

## A1 - Matriz de Trazabilidad

**Scenarios en el requisito:** `3` · **Cubiertos:** `0`

| Scenario | Test que lo cubre | Estado | Bloqueo / Razón (solo si es No lo sé) |
|---|---|---|---|
| Al obtener una tarea de "Ada Lovelace", su `assignee` trae nombre e iniciales | | No lo sé | Solo hay tests de iniciales sobre la cuenta (login), ninguno lee `assignee` de una tarea |
| Al obtener cualquier tarea (suelta o en lista), su `assignee` no incluye email ni datos de acceso | | NO cubierto | - |
| Si el responsable se registró sin nombre, el nombre llega nulo y las iniciales siguen llegando | | No lo sé | Los tests de cuenta sin nombre miran signup/login, no el `assignee` de una tarea |


## A2 - Los tests que faltan

Se creó el archivo assignee.spec.ts solo para el escenario **Al obtener cualquier tarea (suelta o en lista), su assignee no incluye email ni datos de acceso**
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

La prueba no pasó:

![alt text](<Screenshot from 2026-10-07 21-47-18.png>)


# B - Las tres líneas

## 1. ¿Cuántos scenarios creías cubiertos antes de mirar, y cuántos lo estaban?
Pense que los 3 estarían cubiertos, pero ninguno lo terminó estando.

## 2. El scenario en el que no supiste si faltaba un test o faltaba la regla en la spec.
Al revisar la matriz de trazabilidad, me extrañó que ningún scenario estuviera cubierto. Revisé ./backend/tests/functional y solo existía la carpeta auth, así que concluí que todos los tests faltaban.

## 3. Algo que el scenario no determinaba y tuviste que decidir al escribir el test. 
Nada. Le pedí a Claude Code escribir el test, pero lo revisé antes de ejecutar el test y me hizo sentido:

1. Configuración de base de datos: Activa una transacción global antes de ejecutar el test para asegurar que los cambios no afecten permanentemente a la base de datos.
2. Creación de datos de prueba: Registra en la base de datos un usuario de ejemplo (Ada Lovelace) y le asigna una tarea pendiente (Revisar el informe).
3. Autenticación: Realiza una petición POST al endpoint de login con las credenciales de Ada para obtener su token de autorización.
4. Petición del listado de tareas: Envía una petición GET para obtener todas las tareas, enviando el token en las cabeceras, y verifica que la respuesta sea un estado 200 OK.
5. Petición de una tarea específica: Envía una petición GET para obtener el detalle de la tarea creada individualmente (pasando la fecha actual por parámetros) y valida que también responda con un 200 OK.
6. Agrupación de datos: Extrae la información del usuario asignado (assignee) tanto de la lista como de la tarea individual y los guarda en un arreglo.
7. Verificación de privacidad (Aserciones): Recorre los datos de los asignados obtenidos y comprueba mediante aserciones que no incluyan los campos sensibles de email, createdAt y updatedAt.


