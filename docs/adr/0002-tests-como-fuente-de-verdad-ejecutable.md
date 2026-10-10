# 2. Los tests de integración como fuente de verdad ejecutable

## Estado

Aceptada (2027-10-10). **Reemplaza al [ADR 0001](0001-openspec-como-fuente-de-verdad.md).**

> Este ADR se escribe a partir de una hipótesis de trabajo: que dentro de un año se deja de mantener las specs de OpenSpec. La fecha es la supuesta, y lo que se dice del estado del proyecto en ese momento es una suposición, marcada como tal en el Contexto. Lo que describe el repo de hoy se ha comprobado leyendo el código.

## Contexto

El ADR 0001 declaró la spec viva de `openspec/specs/` como fuente de verdad del comportamiento. Ya entonces dejó escritos sus costes, y son estos los que motivan el cambio:

- **La spec no se contrasta con nada.** Ya había una deriva documentada: el `design.md` del filtro decía `vine.enum(...)` y el código usaba `vine.string()`, con lo que `?status=archivado` respondía `200` con lista vacía contra lo que la spec exige.
- **La spec no tenía tests que la sostuvieran.** De los 124 scenarios de `tasks`, en el momento del ADR 0001 solo estaban cubiertos los 3 del requisito del responsable (`backend/tests/functional/tasks/assignee.spec.ts`). La suite functional de `auth` ya seguía el vocabulario de los scenarios, pero por voluntad de quien escribió los tests, no por obligación.
- **Había que mantener dos descripciones de lo mismo**, la spec en prosa y el código con sus tests, más una tercera, el documento OpenAPI anotado a mano.

Suposiciones sobre el estado del proyecto un año después, que no están en el repo y que esta decisión da por ciertas:

- Mantener las specs no ha compensado el esfuerzo: los changes nuevos se han ido escribiendo después del código, como ya ocurrió con el filtro.
- Existe ya una suite de integración lo bastante amplia como para sostener el papel que se le asigna.

Lo que hay hoy y condiciona la decisión: el backend usa Japa con dos suites (`unit`, que no existe en disco, y `functional`); las functional pegan contra el mismo fichero SQLite que el servidor de desarrollo y se aíslan con `testUtils.db().withGlobalTransaction()`; el frontend no tiene runner de tests.

## Decisión

Los **tests de integración son la única fuente de verdad ejecutable** del comportamiento de FlowSync. Concretamente:

1. Una regla de comportamiento existe si hay un test de integración que la comprueba. Lo que no está en un test no está especificado.
2. Un cambio de comportamiento se hace cambiando o añadiendo tests en la misma PR que el código. La PR es la unidad del cambio; no hay delta-spec.
3. Las specs de `openspec/specs/` **dejan de mantenerse**: se congelan y se marcan como histórico, sin tocarlas más. `openspec/changes/archive/` se conserva como memoria de por qué se decidió cada cosa. No se borra nada.
4. Los títulos de los tests conservan el vocabulario de los scenarios cuando existan, para no perder la trazabilidad con las decisiones archivadas. Es una convención, no un mecanismo.
5. El comportamiento de pantalla se cubre con tests ejecutables o no se considera especificado. Eso obliga a instalar un runner en el frontend.

## Consecuencias

**Lo que ganamos**

- Una única fuente que **se ejecuta**: si deja de ser verdad, falla. Desaparece la deriva silenciosa que el ADR 0001 reconocía.
- Se elimina un nivel de mantenimiento: una PR, un sitio donde describir el comportamiento.
- El estado de lo especificado se mide por cobertura real, no por la cantidad de prosa.

**Lo que nos cuesta**

- **Los tests describen lo que el código hace, no lo que debería hacer.** Un test escrito a partir del comportamiento actual puede dar por bueno un fallo: el `200` con lista vacía ante un estado inventado habría quedado fijado como correcto en cuanto alguien lo hubiese testeado «tal cual». Hay que decidir el comportamiento correcto antes de escribir el test, y sin spec esa decisión no tiene dónde vivir.
- **Se pierde el documento que leía producto.** Un test de Japa no lo lee quien no programa, y el requisito deja de poder revisarse sin ejecutar nada. Se pierde también la estructura que agrupaba los scenarios por requisito.
- **El porqué no cabe en un test.** Las propuestas y los diseños archivados explicaban las decisiones; en adelante, esas razones solo viven en descripciones de PR y en los mensajes de commit, si alguien las escribe.
- **La cobertura de pantalla no existe hoy.** El frontend no tiene runner; una parte muy grande de la spec de `tasks` eran scenarios de pantalla. Hasta que exista uno, esas reglas quedan sin fuente de verdad ejecutable, y esa parte de la decisión no se puede cumplir ya.
- **Hay que escribir los tests que faltan antes de poder confiar en la decisión.** El hueco entre «una regla existe si hay un test» y los scenarios sin test de la spec congelada es trabajo pendiente, no un hecho.
- **Los tests de integración son más lentos y más frágiles que una spec**: comparten el fichero SQLite con el servidor de desarrollo, y un test mal aislado filtra estado entre ejecuciones.
- **Una tercera fuente sigue sin resolver.** El documento OpenAPI, anotado a mano en los controladores, no se deriva de los tests y puede divergir de ellos igual que divergía de la spec.
- **Congelar las specs sin borrarlas deja contenido que ya no es cierto.** Quien las lea puede tomarlas por vigentes; la marca de histórico mitiga el riesgo pero no lo elimina.
