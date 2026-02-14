import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Database } from '@/types/supabase'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const authClient =
  supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey)
    : null

const RATE_LIMIT_WINDOW_SECONDS = 60
const RATE_LIMIT_WINDOW_MS = RATE_LIMIT_WINDOW_SECONDS * 1000
const RATE_LIMIT_MAX_REQUESTS = 8
const RATE_LIMIT_ROUTE = 'ai_breakdown'

const getAuthToken = (request: Request) => {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.slice('Bearer '.length).trim()
}

const createUserScopedClient = (token: string) => {
  if (!supabaseUrl || !supabaseAnonKey) return null

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  })
}

const consumeRateLimitSlotLegacy = async (
  userClient: ReturnType<typeof createUserScopedClient>
) => {
  if (!userClient) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
      error: 'Could not initialize rate limiter.',
    }
  }

  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString()

  const { count, error: countError } = await userClient
    .from('ai_usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('route', RATE_LIMIT_ROUTE)
    .gte('created_at', windowStart)

  if (countError) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
      error: 'Rate limit check failed. Please try again.',
    }
  }

  if ((count ?? 0) >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
      error: 'Too many AI requests. Please wait before trying again.',
    }
  }

  const { error: insertError } = await userClient
    .from('ai_usage_logs')
    .insert({ route: RATE_LIMIT_ROUTE })

  if (insertError) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
      error: 'Rate limit check failed. Please try again.',
    }
  }

  return {
    allowed: true,
    retryAfterSeconds: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
    error: null,
  }
}

const consumeRateLimitSlot = async (
  userClient: ReturnType<typeof createUserScopedClient>
) => {
  if (!userClient) {
    return {
      allowed: false,
      retryAfterSeconds: RATE_LIMIT_WINDOW_SECONDS,
      error: 'Could not initialize rate limiter.',
    }
  }

  const { data, error } = await userClient.rpc('consume_ai_rate_limit_slot', {
    p_route: RATE_LIMIT_ROUTE,
    p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
    p_max_requests: RATE_LIMIT_MAX_REQUESTS,
  })

  if (error) {
    const isMissingFunction =
      error.message.includes('consume_ai_rate_limit_slot') &&
      error.message.toLowerCase().includes('not find')

    if (isMissingFunction) {
      return consumeRateLimitSlotLegacy(userClient)
    }

    return {
      allowed: false,
      retryAfterSeconds: RATE_LIMIT_WINDOW_SECONDS,
      error: 'Rate limit check failed. Please try again.',
    }
  }

  const decision = data?.[0]
  if (!decision) {
    return {
      allowed: false,
      retryAfterSeconds: RATE_LIMIT_WINDOW_SECONDS,
      error: 'Rate limit check failed. Please try again.',
    }
  }

  if (!decision.allowed) {
    return {
      allowed: false,
      retryAfterSeconds:
        decision.retry_after_seconds > 0
          ? decision.retry_after_seconds
          : RATE_LIMIT_WINDOW_SECONDS,
      error: 'Too many AI requests. Please wait before trying again.',
    }
  }

  return {
    allowed: true,
    retryAfterSeconds: RATE_LIMIT_WINDOW_SECONDS,
    error: null,
  }
}

export async function POST(request: Request) {
  try {
    if (!authClient) {
      return NextResponse.json(
        { error: 'Server configuration error: Supabase credentials missing' },
        { status: 500 }
      )
    }

    const token = getAuthToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const userClient = createUserScopedClient(token)
    const rateLimit = await consumeRateLimitSlot(userClient)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: rateLimit.error,
          retry_after_seconds: rateLimit.retryAfterSeconds,
        },
        { status: 429 }
      )
    }

    const { taskTitle, context } = await request.json()
    const safeTaskTitle = typeof taskTitle === 'string' ? taskTitle.trim() : ''
    const safeContext =
      typeof context === 'string' ? context.trim().slice(0, 2000) : undefined

    if (!safeTaskTitle) {
      return NextResponse.json(
        { error: 'Task title is required' },
        { status: 400 }
      )
    }

    const prompt = `You are helping someone with ADHD break down a task into actionable steps.

Task: "${safeTaskTitle}"
${safeContext ? `Additional context: ${safeContext}` : ''}

Please provide:
1. A specific "first 30-second action" that requires zero thinking - just physical actions to start
2. Clear "done criteria" - specific, measurable conditions that mean this task is complete
3. Realistic time estimate in minutes (be generous, ADHD brains underestimate)
4. 3-5 micro-steps if this is a complex task

Format your response as JSON:
{
  "firstAction": "exact 30-second action to start",
  "doneCriteria": "specific completion criteria",
  "timeEstimate": number (in minutes),
  "microSteps": ["step 1", "step 2", ...] (optional, only for complex tasks)
}

Make the first action extremely concrete and low-friction. Examples:
- "Open Google Docs and type the title"
- "Create new file called 'report.xlsx'"
- "Open email and type recipient's name"

Be concise, direct, and actionable.`

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    // Parse the JSON response
    let breakdown
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        breakdown = JSON.parse(jsonMatch[0])
      } else {
        breakdown = JSON.parse(content.text)
      }
    } catch (parseError) {
      // If JSON parsing fails, return a structured error
      return NextResponse.json(
        {
          error: 'Failed to parse AI response',
          rawResponse: content.text,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(breakdown)
  } catch (error: any) {
    console.error('AI breakdown error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate task breakdown' },
      { status: 500 }
    )
  }
}
