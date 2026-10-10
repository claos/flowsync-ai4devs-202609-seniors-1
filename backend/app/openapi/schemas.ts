import { TASK_STATUSES } from '#models/task'
import { ApiProperty, ApiPropertyOptional } from '@foadonis/openapi/decorators'

/**
 * Los esquemas que se repiten en las respuestas y peticiones de tareas. Cada
 * clase se publica una sola vez en `components.schemas` y las operaciones la
 * referencian. Solo describen lo que el código ya hace: la forma real de los
 * transformers y de los validadores, no la que debería tener.
 */

/** El responsable tal y como lo expone `TaskAssigneeTransformer`: sin email. */
export class TaskAssignee {
  @ApiProperty({ type: Number })
  declare id: number

  @ApiProperty({ type: String, nullable: true, description: 'Nulo si la cuenta no tiene nombre' })
  declare fullName: string | null

  @ApiProperty({ type: String, description: 'Siempre presentes, aunque no haya nombre' })
  declare initials: string
}

/** Una tarea de la lista (`TaskTransformer`): no lleva vencimiento. */
export class TaskSummary {
  @ApiProperty({ type: Number })
  declare id: number

  @ApiProperty({ type: String })
  declare title: string

  @ApiProperty({ type: String, enum: [...TASK_STATUSES] })
  declare status: string

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  declare createdAt: string | null

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  declare updatedAt: string | null

  @ApiProperty({ type: TaskAssignee })
  declare assignee: TaskAssignee
}

/** Una tarea suelta (`TaskDetailTransformer`): añade vencimiento. */
export class TaskDetail extends TaskSummary {
  @ApiProperty({
    type: String,
    format: 'date',
    nullable: true,
    description: 'Día del calendario AAAA-MM-DD, sin hora; nulo si no tiene fecha',
  })
  declare dueDate: string | null

  @ApiProperty({
    type: Boolean,
    description: 'Resuelto contra el día de referencia `today` de quien consulta',
  })
  declare isOverdue: boolean
}

/** Envoltorio `{ data }` que `serialize()` pone a cada respuesta. */
export class TaskResponse {
  @ApiProperty({ type: TaskSummary })
  declare data: TaskSummary
}

export class TaskListResponse {
  @ApiProperty({ type: [TaskSummary] })
  declare data: TaskSummary[]
}

export class TaskDetailResponse {
  @ApiProperty({ type: TaskDetail })
  declare data: TaskDetail
}

export class ErrorItem {
  @ApiProperty({ type: String })
  declare message: string

  @ApiPropertyOptional({ type: String, description: 'Regla de VineJS incumplida' })
  declare rule: string

  @ApiPropertyOptional({ type: String, description: 'Campo señalado' })
  declare field: string
}

/** Formato de error de la API: lo usan el 401 y el 422. */
export class ErrorsResponse {
  @ApiProperty({ type: [ErrorItem] })
  declare errors: ErrorItem[]
}

export class CreateTaskBody {
  @ApiProperty({
    type: String,
    minLength: 1,
    maxLength: 200,
    description: 'Se recortan los espacios de los extremos; el resto de campos se ignoran',
  })
  declare title: string
}

export class UpdateTaskStatusBody {
  @ApiProperty({ type: String, enum: [...TASK_STATUSES] })
  declare status: string
}

export class SetTaskDueDateBody {
  @ApiProperty({
    type: String,
    format: 'date',
    nullable: true,
    description: 'Día AAAA-MM-DD, o null para retirar la fecha',
  })
  declare dueDate: string | null

  @ApiProperty({
    type: String,
    format: 'date',
    description: 'Día de referencia de quien mira, AAAA-MM-DD',
  })
  declare today: string
}
