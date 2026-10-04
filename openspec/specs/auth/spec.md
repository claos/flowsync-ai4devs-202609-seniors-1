# auth Specification

## Purpose

Permite a una persona crear una cuenta, iniciar y cerrar sesión y consultar su perfil, tanto a través de la API HTTP como desde las pantallas de la aplicación web. Describe el comportamiento vigente del sistema, no una propuesta.

## Requirements

### Requirement: Registro de cuenta por API

El sistema SHALL permitir crear una cuenta mediante `POST /api/v1/auth/signup` con `fullName` (texto o `null`), `email`, `password` y `passwordConfirmation`, y SHALL responder con el usuario creado y un token de acceso, ambos dentro de `{ "data": ... }`. El usuario devuelto SHALL incluir `id`, `fullName`, `email`, `initials`, `createdAt` y `updatedAt`, y SHALL NOT incluir la contraseña.

#### Scenario: Registro correcto

- **WHEN** se envía un registro con un email no usado, una contraseña de entre 8 y 32 caracteres y una confirmación idéntica
- **THEN** la respuesta es 200 con `data.user` y `data.token`, y ese token sirve de inmediato para consultar el perfil

#### Scenario: Registro sin nombre

- **WHEN** se envía el registro con `fullName` a `null`
- **THEN** la cuenta se crea y `data.user.fullName` es `null`

#### Scenario: Email ya registrado

- **WHEN** se envía un registro con un email que ya pertenece a otra cuenta
- **THEN** la respuesta es 422 con un error de campo `email` de regla `database.unique` y no se crea ninguna cuenta

#### Scenario: Contraseñas que no coinciden

- **WHEN** `passwordConfirmation` es distinto de `password`
- **THEN** la respuesta es 422 con un error de campo `passwordConfirmation` de regla `sameAs`

#### Scenario: Datos inválidos o ausentes

- **WHEN** falta un campo obligatorio, el email no tiene formato válido o supera 254 caracteres, o la contraseña tiene menos de 8 o más de 32 caracteres
- **THEN** la respuesta es 422 con `errors`, una entrada por cada incumplimiento con su `field` y su `rule`

### Requirement: Inicio de sesión por API

El sistema SHALL permitir iniciar sesión mediante `POST /api/v1/auth/login` con `email` y `password`, y SHALL responder con el usuario y un token de acceso dentro de `{ "data": ... }`. Cada inicio de sesión SHALL emitir un token nuevo.

#### Scenario: Credenciales correctas

- **WHEN** se envía el email y la contraseña de una cuenta existente
- **THEN** la respuesta es 200 con `data.user` y `data.token`

#### Scenario: Credenciales incorrectas

- **WHEN** el email no existe o la contraseña no corresponde a esa cuenta
- **THEN** la respuesta es 400 con el mensaje "Invalid user credentials", sin distinguir cuál de los dos datos falló

#### Scenario: Campos ausentes o email mal formado

- **WHEN** falta `email` o `password`, o el email no tiene formato válido
- **THEN** la respuesta es 422 con un error por campo

### Requirement: Consulta del perfil por API

El sistema SHALL devolver los datos del usuario autenticado en `GET /api/v1/account/profile` cuando la petición lleve una cabecera `Authorization: Bearer <token>` con un token válido.

#### Scenario: Token válido

- **WHEN** se consulta el perfil con un token emitido en un registro o inicio de sesión no revocado
- **THEN** la respuesta es 200 con `data` conteniendo `id`, `fullName`, `email`, `initials`, `createdAt` y `updatedAt`

#### Scenario: Sin token o token inválido

- **WHEN** se consulta el perfil sin cabecera `Authorization`, o con un token desconocido o revocado
- **THEN** la respuesta es 401 con el mensaje "Unauthorized access"

### Requirement: Iniciales del usuario

El sistema SHALL calcular las `initials` del usuario a partir de su nombre si lo tiene, o de su email si no, siempre en mayúsculas.

#### Scenario: Nombre con al menos dos palabras

- **WHEN** el usuario tiene `fullName` "Ada Lovelace"
- **THEN** sus `initials` son "AL"

#### Scenario: Sin nombre

- **WHEN** el usuario no tiene `fullName` y su email es "ada@example.com"
- **THEN** sus `initials` son "AE", la inicial de la parte anterior a la arroba y la de la posterior

#### Scenario: Nombre de una sola palabra

- **WHEN** el usuario tiene `fullName` "Ada"
- **THEN** sus `initials` son "AD", las dos primeras letras

### Requirement: Cierre de sesión por API

El sistema SHALL revocar el token con el que se hace la petición `POST /api/v1/account/logout`, de modo que deje de ser aceptado.

#### Scenario: Cierre correcto

- **WHEN** se envía la petición con un token válido
- **THEN** la respuesta es 200 con el mensaje "Logged out successfully" y el mismo token recibe 401 en peticiones posteriores

#### Scenario: Sin autenticación

- **WHEN** se envía la petición sin token o con un token inválido
- **THEN** la respuesta es 401

#### Scenario: Otras sesiones no se ven afectadas

- **WHEN** una cuenta tiene dos tokens vigentes y se cierra sesión con uno de ellos
- **THEN** el otro token sigue siendo válido

### Requirement: Formato de las respuestas de la API

El sistema SHALL responder siempre en JSON a las rutas de autenticación, aunque la petición no lo solicite, y SHALL envolver las respuestas correctas en `data` y los errores en `errors`.

#### Scenario: Petición sin cabecera Accept

- **WHEN** se llama a cualquier ruta de autenticación sin indicar que se espera JSON
- **THEN** la respuesta, correcta o de error, es un cuerpo JSON

### Requirement: Pantalla de registro

La aplicación SHALL ofrecer en `/register` un formulario titulado "Crea tu cuenta" con los campos "Nombre completo" (opcional), "Email", "Contraseña" (con la indicación "Entre 8 y 32 caracteres.") y "Repite la contraseña", un botón "Crear cuenta" y un enlace "Inicia sesión" hacia la pantalla de acceso.

#### Scenario: Registro correcto

- **WHEN** la persona completa el formulario con datos válidos y pulsa "Crear cuenta"
- **THEN** el botón muestra "Creando cuenta…" mientras se espera y después la persona queda con la sesión iniciada y ve su perfil

#### Scenario: Nombre en blanco

- **WHEN** la persona deja vacío el nombre, o solo escribe espacios, y se registra
- **THEN** la cuenta se crea sin nombre y su perfil muestra "Sin nombre"

#### Scenario: Contraseñas distintas

- **WHEN** la persona pulsa "Crear cuenta" con una contraseña y una repetición distintas
- **THEN** aparece "Las contraseñas no coinciden." bajo "Repite la contraseña" y no se envía nada al servidor

#### Scenario: Email ya registrado

- **WHEN** el servidor rechaza el registro porque el email ya existe
- **THEN** aparece bajo "Email" el texto "Ese email ya está registrado. Inicia sesión en su lugar."

#### Scenario: Errores de validación del servidor

- **WHEN** el servidor rechaza campos inválidos
- **THEN** cada error aparece en castellano bajo su campo, por ejemplo "Introduce una dirección de email válida." o "la contraseña debe tener al menos 8 caracteres."

#### Scenario: Servidor inaccesible

- **WHEN** no se puede conectar con el servidor
- **THEN** aparece un aviso en la parte superior del formulario: "No se pudo conectar con el servidor. Comprueba que el backend está arrancado."

### Requirement: Pantalla de inicio de sesión

La aplicación SHALL ofrecer en `/login` un formulario titulado "Inicia sesión" con los campos "Email" y "Contraseña", un botón "Entrar" y un enlace "Crea una" hacia el registro.

#### Scenario: Acceso correcto

- **WHEN** la persona introduce credenciales válidas y pulsa "Entrar"
- **THEN** el botón muestra "Entrando…" mientras se espera y después ve su perfil

#### Scenario: Credenciales incorrectas

- **WHEN** el servidor rechaza las credenciales
- **THEN** aparece el aviso "El email o la contraseña no son correctos." y la persona permanece en la pantalla de acceso

#### Scenario: Campos vacíos

- **WHEN** la persona pulsa "Entrar" con algún campo vacío
- **THEN** aparece un error en castellano bajo el campo, por ejemplo "Falta rellenar el email.", y no se inicia sesión

### Requirement: Perfil de la persona autenticada

La aplicación SHALL mostrar en `/profile` las iniciales del usuario en un avatar, su nombre (o "Sin nombre" si no tiene), su email y la fecha "Miembro desde" en formato largo en castellano, además de un botón "Cerrar sesión".

#### Scenario: Visualización del perfil

- **WHEN** una persona con sesión iniciada abre `/profile`
- **THEN** ve su nombre, su email, sus iniciales y la fecha en que creó la cuenta

### Requirement: Cierre de sesión en pantalla

La aplicación SHALL permitir cerrar la sesión desde el perfil con el botón "Cerrar sesión" y llevar a la persona a la pantalla de acceso.

#### Scenario: Cierre de sesión

- **WHEN** la persona pulsa "Cerrar sesión"
- **THEN** el botón muestra "Cerrando sesión…", la sesión termina y la persona ve la pantalla de acceso; al recargar la página sigue sin sesión

#### Scenario: El servidor no responde al cerrar

- **WHEN** la persona pulsa "Cerrar sesión" y el servidor falla o está caído
- **THEN** la sesión se cierra igualmente en la aplicación y la persona ve la pantalla de acceso

### Requirement: Protección de pantallas privadas

La aplicación SHALL permitir ver `/profile` solo a quien tiene sesión válida, y SHALL redirigir a `/login` a quien no la tiene.

#### Scenario: Sin sesión

- **WHEN** una persona sin sesión abre `/profile`
- **THEN** es redirigida a `/login`

#### Scenario: Espera durante la comprobación

- **WHEN** una persona con una sesión guardada abre o recarga una pantalla
- **THEN** ve un indicador de carga ("Cargando…") hasta que se confirma la sesión, sin ser expulsada mientras tanto

### Requirement: Pantallas de acceso solo para anónimos

La aplicación SHALL redirigir a `/profile` a quien ya tiene sesión válida cuando abre `/login` o `/register`.

#### Scenario: Con sesión activa

- **WHEN** una persona con sesión iniciada abre `/login` o `/register`
- **THEN** es redirigida a `/profile`

### Requirement: Ruta desconocida

La aplicación SHALL redirigir cualquier dirección que no exista a `/profile`.

#### Scenario: Dirección inexistente

- **WHEN** una persona abre una dirección que no corresponde a ninguna pantalla
- **THEN** es llevada a `/profile`, y si no tiene sesión continúa hasta `/login`

### Requirement: Persistencia de la sesión

La aplicación SHALL mantener la sesión de la persona al recargar la página o volver a abrir la aplicación en el mismo navegador, mientras el servidor siga reconociendo su token.

#### Scenario: Recarga con sesión válida

- **WHEN** una persona con sesión iniciada recarga la página
- **THEN** sigue viendo su perfil sin volver a introducir sus credenciales

#### Scenario: Sesión caducada o revocada

- **WHEN** la persona abre la aplicación y el servidor rechaza su sesión guardada
- **THEN** llega a la pantalla de acceso con el aviso "Tu sesión ha caducado. Vuelve a iniciar sesión." y la sesión guardada se descarta

#### Scenario: Servidor no disponible al abrir

- **WHEN** la persona abre la aplicación con una sesión guardada y el servidor no responde
- **THEN** llega a la pantalla de acceso con un aviso que explica el fallo, y su sesión no se descarta, de modo que recargar cuando el servidor vuelva la restablece
