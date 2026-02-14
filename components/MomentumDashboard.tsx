'use client'

import { useMemo } from 'react'
import { format, startOfDay, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, subDays } from 'date-fns'
import { Tables } from '@/lib/supabase'

type Task = Tables<'tasks'>

interface MomentumDashboardProps {
  tasks: Task[]
}

export default function MomentumDashboard({ tasks }: MomentumDashboardProps) {
  const completedTasks = tasks.filter(
    (task): task is Task & { completed_at: string } =>
      task.status === 'completed' && Boolean(task.completed_at)
  )
  
  // Calculate current streak
  const streak = useMemo(() => {
    if (completedTasks.length === 0) return 0

    const completedDays = new Set(
      completedTasks.map((task) => format(new Date(task.completed_at), 'yyyy-MM-dd'))
    )

    let currentStreak = 0
    let cursorDate = startOfDay(new Date())

    while (completedDays.has(format(cursorDate, 'yyyy-MM-dd'))) {
      currentStreak += 1
      cursorDate = subDays(cursorDate, 1)
    }

    return currentStreak
  }, [completedTasks])

  // This week's activity
  const thisWeek = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd })

    return daysInWeek.map(day => {
      const dayTasks = completedTasks.filter(task => 
        isSameDay(new Date(task.completed_at), day)
      )
      return {
        date: day,
        count: dayTasks.length,
        label: format(day, 'EEE'),
      }
    })
  }, [completedTasks])

  const recentMomentum = useMemo(() => {
    const today = startOfDay(new Date())
    const past7Days = eachDayOfInterval({
      start: subDays(today, 6),
      end: today,
    })

    const productiveDays = past7Days.filter((day) =>
      completedTasks.some((task) => isSameDay(new Date(task.completed_at), day))
    ).length

    return {
      productiveDays,
      consistency: Math.round((productiveDays / 7) * 100),
    }
  }, [completedTasks])

  // Calculate stats
  const stats = useMemo(() => {
    const total = completedTasks.length
    const thisWeekCount = thisWeek.reduce((sum, day) => sum + day.count, 0)
    
    const withQC = completedTasks.filter((task) => task.skipped_qc === false).length
    const qcRate = total > 0 ? Math.round((withQC / total) * 100) : 0

    const durationSamples = completedTasks
      .filter((task): task is Task & { completed_at: string; started_at: string } => Boolean(task.started_at))

    const avgTimeToComplete = durationSamples
      .reduce((sum, t) => {
        const start = new Date(t.started_at)
        const end = new Date(t.completed_at)
        return sum + (end.getTime() - start.getTime())
      }, 0)

    const avgMinutes = durationSamples.length > 0
      ? Math.round(avgTimeToComplete / durationSamples.length / 1000 / 60)
      : 0

    return {
      total,
      thisWeek: thisWeekCount,
      qcRate,
      avgMinutes,
    }
  }, [completedTasks, thisWeek])

  return (
    <div className="space-y-6">
      {/* Streak Card */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-90">Current Streak</p>
            <p className="text-5xl font-display font-bold">{streak}</p>
            <p className="text-sm opacity-90 mt-1">
              {streak === 1 ? 'day' : 'days'}
            </p>
          </div>
          <div className="text-6xl">🔥</div>
        </div>
        {streak > 0 && (
          <p className="text-sm opacity-90">
            Keep it going! Complete a task today to extend your streak.
          </p>
        )}
        {streak === 0 && (
          <p className="text-sm opacity-90">
            {recentMomentum.productiveDays > 0
              ? `No streak pressure. You still showed up ${recentMomentum.productiveDays} day${recentMomentum.productiveDays === 1 ? '' : 's'} this week.`
              : 'Restart softly: complete one 5-minute task today.'}
          </p>
        )}
      </div>

      {/* Weekly Activity */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-display font-bold text-neutral-900 mb-4">
          This Week's Activity
        </h3>
        <div className="flex items-end justify-between gap-2 h-32">
          {thisWeek.map((day, i) => {
            const maxHeight = Math.max(...thisWeek.map(d => d.count), 1)
            const height = (day.count / maxHeight) * 100
            const isToday = isSameDay(day.date, new Date())
            
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="relative flex-1 w-full flex items-end">
                  <div
                    className={`w-full rounded-t-lg transition-all ${
                      day.count > 0
                        ? isToday
                          ? 'bg-primary-500'
                          : 'bg-primary-400'
                        : 'bg-neutral-200'
                    }`}
                    style={{ height: `${Math.max(height, 10)}%` }}
                  />
                  {day.count > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {day.count}
                      </span>
                    </div>
                  )}
                </div>
                <span className={`text-xs font-medium ${
                  isToday ? 'text-primary-600' : 'text-neutral-600'
                }`}>
                  {day.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-neutral-600 mb-1">Total Completed</p>
          <p className="text-3xl font-bold text-neutral-900">{stats.total}</p>
          <p className="text-xs text-neutral-500 mt-1">
            {stats.thisWeek} this week
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-neutral-600 mb-1">Quality Rate</p>
          <p className="text-3xl font-bold text-green-600">{stats.qcRate}%</p>
          <p className="text-xs text-neutral-500 mt-1">
            Tasks with QC
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-neutral-600 mb-1">Avg Time</p>
          <p className="text-3xl font-bold text-blue-600">{stats.avgMinutes}m</p>
          <p className="text-xs text-neutral-500 mt-1">
            To complete
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-neutral-600 mb-1">Consistency (7d)</p>
          <p className="text-3xl font-bold text-purple-600">
            {recentMomentum.consistency}%
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {recentMomentum.productiveDays} productive day{recentMomentum.productiveDays === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      {/* Insights */}
      {stats.total >= 5 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="font-semibold text-neutral-900 mb-1">Insight</p>
              <p className="text-sm text-neutral-700">
                {stats.qcRate >= 80
                  ? "Great job! You're consistently checking your work before shipping."
                  : stats.qcRate >= 50
                  ? "Consider using the pre-ship checklist more often to catch errors early."
                  : "Try using the QC checklist. It helps catch mistakes before they ship."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
