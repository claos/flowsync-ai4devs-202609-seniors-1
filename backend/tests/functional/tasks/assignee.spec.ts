import Task from '#models/task'
import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Lo que cada tarea muestra de su responsable. Cubre el scenario «La tarea no
 * filtra datos de cuenta» del requisito «Lo que cada tarea muestra de su
 * responsable» de `openspec/specs/tasks/spec.md`.
 */
test.group('Tasks | responsable', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('el responsable de una tarea, suelta o en la lista, no trae el email de su cuenta', async ({
    client,
    assert,
  }) => {
    const ada = await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secreto123',
    })
    const tarea = await Task.create({
      title: 'Revisar el informe',
      status: 'pending',
      assigneeId: ada.id,
    })

    const login = await client
      .post('/api/v1/auth/login')
      .json({ email: 'ada@example.com', password: 'secreto123' })
    const token = login.body().data.token as string

    const lista = await client.get('/api/v1/tasks').header('Authorization', `Bearer ${token}`)
    lista.assertStatus(200)

    const suelta = await client
      .get(`/api/v1/tasks/${tarea.id}`)
      .qs({ today: '2026-10-07' })
      .header('Authorization', `Bearer ${token}`)
    suelta.assertStatus(200)

    const responsables = [lista.body().data[0].assignee, suelta.body().data.assignee]

    for (const assignee of responsables) {
      assert.notProperty(assignee, 'email')
      assert.notProperty(assignee, 'createdAt')
      assert.notProperty(assignee, 'updatedAt')
    }
  })
})
