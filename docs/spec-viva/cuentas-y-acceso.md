# PARTE A

## Purpose

Permite a una persona crear su cuenta en FlowSync, entrar y salir de ella y consultar los datos de su perfil, tanto desde la API como desde la interfaz web. Es la puerta de acceso al resto de la aplicación.

## Requirements

### Requirement: Registro de una cuenta por la API

El sistema SHALL permitir crear una cuenta con `POST /api/v1/auth/signup`, enviando `fullName`, `email`, `password` y `passwordConfirmation`, y SHALL responder `200` con `{ "data": { "user": ..., "token": ... } }`, de modo que la cuenta queda iniciada de inmediato. El usuario devuelto incluye `id`, `fullName`, `email`, `createdAt`, `updatedAt` e `initials`, y nunca la contraseña.

#### Scenario: Registro con todos los datos válidos

- **WHEN** un consumidor envía `fullName` "Ada Lovelace", `email` "ada@x.com", `password` "secreto123" y `passwordConfirmation` "secreto123"
- **THEN** el sistema responde `200` con el usuario creado (`fullName` "Ada Lovelace", `email` "ada@x.com", `initials` "AL") y un `token` de acceso

#### Scenario: Registro sin nombre

- **WHEN** un consumidor envía `fullName` con valor `null` y el resto de datos válidos
- **THEN** el sistema responde `200` y el usuario creado tiene `fullName` `null`

#### Scenario: Nombre vacío o formado solo por espacios

- **WHEN** un consumidor envía `fullName` como cadena vacía o como solo espacios y el resto de datos válidos
- **THEN** el sistema responde `200` y el usuario creado tiene `fullName` `null`

#### Scenario: El email se guarda sin espacios sobrantes

- **WHEN** un consumidor envía el `email` "  sp@x.com " con espacios alrededor y el resto de datos válidos
- **THEN** el sistema responde `200` y el usuario creado tiene `email` "sp@x.com"

### Requirement: Validación de los datos de registro

El sistema SHALL rechazar un registro con datos inválidos con `422` y un cuerpo `{ "errors": [ { "message", "rule", "field" } ] }` que lista un error por cada campo incorrecto, y SHALL NOT crear la cuenta. Los campos `fullName`, `email`, `password` y `passwordConfirmation` son obligatorios como claves de la petición (`fullName` admite el valor `null`).

#### Scenario: Petición vacía

- **WHEN** un consumidor envía un cuerpo vacío al registro
- **THEN** el sistema responde `422` con un error de campo obligatorio (`required`) para `fullName`, `email`, `password` y `passwordConfirmation`

#### Scenario: Falta la clave del nombre

- **WHEN** un consumidor envía `email`, `password` y `passwordConfirmation` válidos pero omite la clave `fullName`
- **THEN** el sistema responde `422` con un error `required` sobre `fullName`

#### Scenario: Email con formato inválido

- **WHEN** un consumidor envía `email` "bad"
- **THEN** el sistema responde `422` con un error `email` sobre el campo `email`

#### Scenario: Contraseña demasiado corta

- **WHEN** un consumidor envía una `password` de menos de 8 caracteres
- **THEN** el sistema responde `422` con un error `minLength` (mínimo 8) sobre `password`

#### Scenario: Contraseña demasiado larga

- **WHEN** un consumidor envía una `password` de más de 32 caracteres
- **THEN** el sistema responde `422` con un error `maxLength` (máximo 32) sobre `password` y sobre `passwordConfirmation` si esta tiene la misma longitud

#### Scenario: La confirmación no coincide

- **WHEN** un consumidor envía una `password` válida y una `passwordConfirmation` válida pero distinta
- **THEN** el sistema responde `422` con un error `sameAs` sobre `passwordConfirmation`

### Requirement: Unicidad del email en el registro

El sistema SHALL rechazar el registro de un email que ya pertenece a otra cuenta. La comparación distingue mayúsculas de minúsculas.

#### Scenario: Email ya registrado

- **WHEN** un consumidor intenta registrar "ada@x.com" cuando ya existe una cuenta con ese mismo email
- **THEN** el sistema responde `422` con un error `database.unique` sobre `email` y no crea la cuenta

#### Scenario: Mismo email con distinta capitalización

- **WHEN** un consumidor registra "ADA@x.com" cuando existe una cuenta "ada@x.com"
- **THEN** el sistema responde `200` y crea una cuenta distinta

### Requirement: Iniciales del usuario

El sistema SHALL devolver en cada usuario un campo `initials` en mayúsculas calculado a partir de su nombre o, si no tiene nombre, de su email.

#### Scenario: Nombre de varias palabras

- **WHEN** se devuelve un usuario cuyo nombre es "Grace Brewster Hopper"
- **THEN** `initials` vale "GB" (la inicial de las dos primeras palabras)

#### Scenario: Usuario sin nombre

- **WHEN** se devuelve un usuario sin nombre cuyo email es "solo@x.com"
- **THEN** `initials` vale "SX" (la inicial de la parte anterior a la arroba y la inicial del dominio)

#### Scenario: Nombre de una sola letra

- **WHEN** se devuelve un usuario cuyo nombre es "A"
- **THEN** `initials` vale "A"

### Requirement: Inicio de sesión por la API

El sistema SHALL permitir iniciar sesión con `POST /api/v1/auth/login`, enviando `email` y `password`, y SHALL responder `200` con `{ "data": { "user": ..., "token": ... } }`. Cada inicio de sesión genera un token nuevo y los tokens anteriores de la misma cuenta siguen siendo válidos.

#### Scenario: Credenciales correctas

- **WHEN** un consumidor envía el email y la contraseña de una cuenta existente
- **THEN** el sistema responde `200` con el usuario de esa cuenta y un `token` que permite acceder al perfil

#### Scenario: Varias sesiones simultáneas

- **WHEN** un consumidor inicia sesión dos veces con la misma cuenta y cierra la sesión con el primer token
- **THEN** el segundo token sigue permitiendo acceder al perfil

#### Scenario: Email con espacios sobrantes

- **WHEN** un consumidor inicia sesión con el email " g@x.com " con espacios alrededor de una cuenta registrada como "g@x.com"
- **THEN** el sistema responde `200` y devuelve esa cuenta

### Requirement: Rechazo de credenciales incorrectas

El sistema SHALL responder `400` con `{ "errors": [ { "message": "Invalid user credentials" } ] }` cuando el email y la contraseña no corresponden a una cuenta, sin distinguir si falla el email o la contraseña. La comparación del email distingue mayúsculas de minúsculas.

#### Scenario: Contraseña incorrecta

- **WHEN** un consumidor envía el email de una cuenta existente con una contraseña equivocada
- **THEN** el sistema responde `400` con el mensaje "Invalid user credentials" y no devuelve token

#### Scenario: Email inexistente

- **WHEN** un consumidor envía un email que no pertenece a ninguna cuenta
- **THEN** el sistema responde `400` con el mismo mensaje "Invalid user credentials"

#### Scenario: Email con distinta capitalización

- **WHEN** un consumidor envía "Ada@x.com" para una cuenta registrada como "ada@x.com"
- **THEN** el sistema responde `400` con el mensaje "Invalid user credentials"

### Requirement: Validación de los datos de inicio de sesión

El sistema SHALL responder `422` con la lista de errores por campo cuando la petición de inicio de sesión no incluye un `email` con formato válido o no incluye `password`.

#### Scenario: Petición vacía

- **WHEN** un consumidor envía un cuerpo vacío al inicio de sesión
- **THEN** el sistema responde `422` con un error `required` sobre `email` y otro sobre `password`

#### Scenario: Email inválido y contraseña vacía

- **WHEN** un consumidor envía `email` "bad" y `password` vacía
- **THEN** el sistema responde `422` con un error `email` sobre `email` y un error `required` sobre `password`

### Requirement: Consulta del perfil por la API

El sistema SHALL devolver los datos de la cuenta autenticada con `GET /api/v1/account/profile` y un token válido en la cabecera `Authorization: Bearer <token>`, con la forma `{ "data": { "id", "fullName", "email", "createdAt", "updatedAt", "initials" } }`.

#### Scenario: Token válido

- **WHEN** un consumidor solicita el perfil con el token obtenido al registrarse o iniciar sesión
- **THEN** el sistema responde `200` con los datos de esa cuenta

#### Scenario: Sin token

- **WHEN** un consumidor solicita el perfil sin cabecera `Authorization`
- **THEN** el sistema responde `401` con `{ "errors": [ { "message": "Unauthorized access" } ] }`

#### Scenario: Token no reconocido

- **WHEN** un consumidor solicita el perfil con un token inventado o ya invalidado
- **THEN** el sistema responde `401` con el mensaje "Unauthorized access"

### Requirement: Cierre de sesión por la API

El sistema SHALL cerrar la sesión con `POST /api/v1/account/logout` y un token válido, responder `200` con `{ "message": "Logged out successfully" }` e invalidar únicamente el token usado en esa petición.

#### Scenario: Cierre con token válido

- **WHEN** un consumidor llama al cierre de sesión con un token válido
- **THEN** el sistema responde `200` con el mensaje "Logged out successfully"

#### Scenario: El token queda inutilizable

- **WHEN** un consumidor intenta consultar el perfil o cerrar sesión de nuevo con un token ya cerrado
- **THEN** el sistema responde `401` con el mensaje "Unauthorized access"

#### Scenario: Cierre sin token

- **WHEN** un consumidor llama al cierre de sesión sin token
- **THEN** el sistema responde `401` con el mensaje "Unauthorized access"

### Requirement: Pantalla de registro

El sistema SHALL ofrecer en la ruta `/register` una pantalla "Crea tu cuenta" con los campos "Nombre completo" (marcado como opcional), "Email", "Contraseña" (con la indicación "Entre 8 y 32 caracteres.") y "Repite la contraseña", un botón "Crear cuenta" y un enlace "Inicia sesión" que lleva a la pantalla de inicio de sesión.

#### Scenario: Registro correcto

- **WHEN** una persona rellena email, contraseña y confirmación válidos y pulsa "Crear cuenta"
- **THEN** el botón muestra "Creando cuenta…" mientras se procesa y, al terminar, la persona queda con sesión iniciada y es llevada a su perfil

#### Scenario: Registro sin nombre

- **WHEN** una persona deja "Nombre completo" vacío o con solo espacios y completa el resto correctamente
- **THEN** la cuenta se crea sin nombre y el perfil muestra "Sin nombre"

#### Scenario: Las contraseñas no coinciden

- **WHEN** una persona escribe valores distintos en "Contraseña" y "Repite la contraseña" y pulsa "Crear cuenta"
- **THEN** aparece bajo "Repite la contraseña" el mensaje "Las contraseñas no coinciden." y no se crea la cuenta

#### Scenario: Email ya registrado

- **WHEN** una persona intenta registrarse con un email que ya tiene cuenta
- **THEN** aparece bajo "Email" el mensaje "Ese email ya está registrado. Inicia sesión en su lugar."

#### Scenario: Email con formato inválido

- **WHEN** una persona introduce un email sin formato válido y pulsa "Crear cuenta"
- **THEN** aparece bajo "Email" el mensaje "Introduce una dirección de email válida."

#### Scenario: Campos obligatorios vacíos

- **WHEN** una persona deja vacío "Email" o "Contraseña" y pulsa "Crear cuenta"
- **THEN** aparece bajo el campo el mensaje "Falta rellenar el email." o "Falta rellenar la contraseña." respectivamente

#### Scenario: Contraseña demasiado corta

- **WHEN** una persona escribe una contraseña de menos de 8 caracteres, repite la misma en la confirmación y pulsa "Crear cuenta"
- **THEN** aparece bajo "Contraseña" el mensaje "la contraseña debe tener al menos 8 caracteres." y la indicación "Entre 8 y 32 caracteres." deja de mostrarse mientras el error esté presente

#### Scenario: Contraseña demasiado larga

- **WHEN** una persona escribe una contraseña de más de 32 caracteres, repite la misma en la confirmación y pulsa "Crear cuenta"
- **THEN** aparece bajo "Contraseña" el mensaje "la contraseña no puede superar los 32 caracteres."

#### Scenario: Servidor inaccesible

- **WHEN** una persona pulsa "Crear cuenta" y el servidor no responde
- **THEN** aparece un aviso de error en la parte superior del formulario con el mensaje "No se pudo conectar con el servidor. Comprueba que el backend está arrancado."

### Requirement: Pantalla de inicio de sesión

El sistema SHALL ofrecer en la ruta `/login` una pantalla "Inicia sesión" con los campos "Email" y "Contraseña", un botón "Entrar" y un enlace "Crea una" que lleva a la pantalla de registro.

#### Scenario: Inicio de sesión correcto

- **WHEN** una persona introduce email y contraseña correctos y pulsa "Entrar"
- **THEN** el botón muestra "Entrando…" mientras se procesa y, al terminar, la persona es llevada a su perfil

#### Scenario: Credenciales incorrectas

- **WHEN** una persona introduce un email o una contraseña que no corresponden a una cuenta
- **THEN** aparece un aviso de error en la parte superior del formulario con el mensaje "El email o la contraseña no son correctos." y la persona permanece en la pantalla de inicio de sesión

#### Scenario: Campos vacíos o email inválido

- **WHEN** una persona pulsa "Entrar" con el email vacío, con el email mal formado o con la contraseña vacía
- **THEN** aparece bajo el campo afectado el mensaje "Falta rellenar el email.", "Introduce una dirección de email válida." o "Falta rellenar la contraseña." según corresponda

#### Scenario: Servidor inaccesible

- **WHEN** una persona pulsa "Entrar" y el servidor no responde
- **THEN** aparece un aviso de error con el mensaje "No se pudo conectar con el servidor. Comprueba que el backend está arrancado."

### Requirement: Persistencia de la sesión entre cargas de página

El sistema SHALL mantener la sesión de la persona al recargar o reabrir la aplicación mientras su sesión siga siendo válida, mostrando un indicador de carga mientras la comprueba.

#### Scenario: Recarga con sesión válida

- **WHEN** una persona con sesión iniciada recarga la página del perfil
- **THEN** se muestra brevemente un indicador de carga y después el perfil, sin pasar por la pantalla de inicio de sesión

#### Scenario: Sesión caducada o invalidada

- **WHEN** una persona abre la aplicación con una sesión que el servidor ya no reconoce
- **THEN** es llevada a la pantalla de inicio de sesión, donde se muestra el aviso "Tu sesión ha caducado. Vuelve a iniciar sesión."

#### Scenario: Servidor no disponible al restaurar la sesión

- **WHEN** una persona abre la aplicación con una sesión guardada y el servidor no responde
- **THEN** es llevada a la pantalla de inicio de sesión con el aviso "No se pudo conectar con el servidor. Comprueba que el backend está arrancado."

### Requirement: Acceso según el estado de la sesión

El sistema SHALL mostrar el perfil solo a personas con sesión iniciada y SHALL mostrar las pantallas de inicio de sesión y registro solo a personas sin sesión.

#### Scenario: Perfil sin sesión

- **WHEN** una persona sin sesión abre la ruta `/profile`
- **THEN** es redirigida a la pantalla de inicio de sesión

#### Scenario: Inicio de sesión o registro con sesión activa

- **WHEN** una persona con sesión iniciada abre `/login` o `/register`
- **THEN** es redirigida a su perfil

#### Scenario: Ruta desconocida

- **WHEN** una persona abre una ruta que no existe
- **THEN** es redirigida al perfil, y si no tiene sesión continúa hacia la pantalla de inicio de sesión

### Requirement: Pantalla de perfil

El sistema SHALL mostrar a la persona con sesión iniciada, en la ruta `/profile`, un círculo con sus iniciales, su nombre completo (o "Sin nombre" si no tiene), su email y la fecha "Miembro desde" en formato de fecha larga en español.

#### Scenario: Perfil de una cuenta con nombre

- **WHEN** una persona con sesión iniciada y nombre "Ada Lovelace" abre su perfil
- **THEN** ve las iniciales "AL", el nombre "Ada Lovelace", su email y la fecha de alta con el formato de fecha larga en español

#### Scenario: Perfil de una cuenta sin nombre

- **WHEN** una persona con sesión iniciada y sin nombre abre su perfil
- **THEN** ve "Sin nombre" como título y sus iniciales derivadas del email

### Requirement: Cierre de sesión desde la interfaz

El sistema SHALL ofrecer en el perfil un botón "Cerrar sesión" que termina la sesión de la persona y la lleva a la pantalla de inicio de sesión.

#### Scenario: Cierre de sesión

- **WHEN** una persona pulsa "Cerrar sesión" en su perfil
- **THEN** el botón se deshabilita y muestra "Cerrando sesión…", la sesión se cierra y la persona llega a la pantalla de inicio de sesión sin aviso de error

#### Scenario: Acceso tras cerrar sesión

- **WHEN** una persona que ha cerrado sesión intenta abrir `/profile`
- **THEN** es redirigida a la pantalla de inicio de sesión

#### Scenario: Cierre con el servidor no disponible

- **WHEN** una persona pulsa "Cerrar sesión" y el servidor no responde o ya no reconoce su sesión
- **THEN** la persona llega igualmente a la pantalla de inicio de sesión como si hubiera cerrado sesión

# PARTE B

## Cuántos requisitos escribió el agente, y cuántos comprobaste tú abriendo el código?

- 15/15 - Combinación de lectura rápida de código con pruebas manuales en frontend.

## Las incoherencias que aparecieron al escribirla. 

- No encontré incoherencias.

## Lo que no supiste decidir si era un bug o el contrato.

- No encontré incoherencias.
