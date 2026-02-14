import { useTaskStore } from '@/store/taskStore'
import type { Database } from '@/types/supabase'

type TaskRow = Database['public']['Tables']['tasks']['Row']

const createTask = (id: string, status: TaskRow['status']): TaskRow => ({
  id,
  user_id: 'user-1',
  title: `Task ${id}`,
  done_criteria: 'Done',
  time_block_mins: 30,
  deadline: '2026-01-01T00:00:00.000Z',
  status,
  blocked_reason: null,
  micro_actions: null,
  skipped_qc: false,
  created_at: '2026-01-01T00:00:00.000Z',
  started_at: null,
  completed_at: null,
})

describe('taskStore', () => {
  beforeEach(() => {
    useTaskStore.setState({
      tasks: [],
      currentTask: null,
      isLoading: false,
    })
  })

  it('sets current task when first queued task is added', () => {
    const task = createTask('1', 'queued')
    useTaskStore.getState().addTask(task)

    const state = useTaskStore.getState()
    expect(state.tasks).toHaveLength(1)
    expect(state.currentTask?.id).toBe('1')
  })

  it('appends tasks without replacing an existing current task', () => {
    const first = createTask('1', 'queued')
    const second = createTask('2', 'queued')

    useTaskStore.getState().addTask(first)
    useTaskStore.getState().addTask(second)

    const state = useTaskStore.getState()
    expect(state.tasks.map((task) => task.id)).toEqual(['1', '2'])
    expect(state.currentTask?.id).toBe('1')
  })

  it('updates current task when current task row is updated', () => {
    const task = createTask('1', 'queued')
    useTaskStore.getState().addTask(task)

    useTaskStore.getState().updateTask('1', { status: 'active' })

    const state = useTaskStore.getState()
    expect(state.currentTask?.status).toBe('active')
  })

  it('clears current task when current task is deleted', () => {
    const task = createTask('1', 'queued')
    useTaskStore.getState().addTask(task)

    useTaskStore.getState().deleteTask('1')

    const state = useTaskStore.getState()
    expect(state.currentTask).toBeNull()
    expect(state.tasks).toHaveLength(0)
  })
})
