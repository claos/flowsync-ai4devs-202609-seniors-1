import User from '#models/user'
import Task from '#models/task'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Lo que cada tarea muestra de su responsable. Cubre los tres scenarios del
 * requisito «Lo que cada tarea muestra de su responsable» de
 * `openspec/specs/tasks/spec.md`: responsable identificable, la tarea que no
 * filtra datos de cuenta, y el responsable sin nombre.
 */
test.group('Tasks | responsable', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  const hoy = '2026-10-10'

  async function conTarea(fullName: string | null, email = 'ada@example.com') {
    const user = await User.create({ fullName, email, password: 'secreto123' })
    const task = await Task.create({
      title: 'Revisar el informe',
      status: 'pending',
      assigneeId: user.id,
    })
    const token = await User.accessTokens.create(user)

    return { user, task, authorization: `Bearer ${token.value!.release()}` }
  }

  test('el responsable llega con su nombre y sus iniciales', async ({ client, assert }) => {
    const { task, authorization } = await conTarea('Ada Lovelace')

    const response = await client
      .get(`/api/v1/tasks/${task.id}`)
      .qs({ today: hoy })
      .header('Authorization', authorization)

    response.assertStatus(200)

    const { assignee } = response.body().data
    assert.equal(assignee.fullName, 'Ada Lovelace')
    assert.equal(assignee.initials, 'AL')
  })

  test('la tarea no filtra el email ni otros datos de acceso, suelta o en la lista', async ({
    client,
    assert,
  }) => {
    const { task, authorization } = await conTarea('Ada Lovelace')

    const suelta = await client
      .get(`/api/v1/tasks/${task.id}`)
      .qs({ today: hoy })
      .header('Authorization', authorization)
    const lista = await client.get('/api/v1/tasks').header('Authorization', authorization)

    suelta.assertStatus(200)
    lista.assertStatus(200)

    const asignados = [suelta.body().data.assignee, (lista.body() as any).data[0].assignee]

    for (const assignee of asignados) {
      assert.sameMembers(Object.keys(assignee), ['id', 'fullName', 'initials'])
      assert.notProperty(assignee, 'email')
      assert.notProperty(assignee, 'password')
    }

    assert.notInclude(JSON.stringify([suelta.body(), lista.body()]), 'ada@example.com')
  })

  test('un responsable sin nombre llega con el nombre nulo y con iniciales', async ({
    client,
    assert,
  }) => {
    const { task, authorization } = await conTarea(null)

    const suelta = await client
      .get(`/api/v1/tasks/${task.id}`)
      .qs({ today: hoy })
      .header('Authorization', authorization)
    const lista = await client.get('/api/v1/tasks').header('Authorization', authorization)

    suelta.assertStatus(200)
    lista.assertStatus(200)

    for (const assignee of [suelta.body().data.assignee, (lista.body() as any).data[0].assignee]) {
      assert.isNull(assignee.fullName)
      assert.equal(assignee.initials, 'AE')
    }
  })
})
