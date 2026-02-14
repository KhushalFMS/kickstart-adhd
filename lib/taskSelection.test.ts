import { selectCurrentTask } from '@/lib/taskSelection'
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

describe('selectCurrentTask', () => {
  it('prefers active tasks over queued and blocked', () => {
    const result = selectCurrentTask([
      createTask('1', 'queued'),
      createTask('2', 'active'),
      createTask('3', 'blocked'),
    ])

    expect(result?.id).toBe('2')
  })

  it('returns queued task when there is no active task', () => {
    const result = selectCurrentTask([createTask('1', 'queued'), createTask('2', 'blocked')])
    expect(result?.id).toBe('1')
  })

  it('returns blocked task when it is the only available option', () => {
    const result = selectCurrentTask([createTask('1', 'blocked')])
    expect(result?.id).toBe('1')
  })

  it('returns null for an empty list', () => {
    expect(selectCurrentTask([])).toBeNull()
  })
})
