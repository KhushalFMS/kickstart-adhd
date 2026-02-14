export interface TaskBreakdown {
  microAction: string
  doneCriteria: string
  timeEstimate: number
  steps: string[]
  taskType: 'email' | 'document' | 'code' | 'meeting' | 'planning' | 'research' | 'creative' | 'other'
}

export async function breakdownTask(title: string, context?: string): Promise<TaskBreakdown> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `You're helping someone with ADHD break down a task. They struggle with starting because tasks feel overwhelming.

Task title: "${title}"
${context ? `Additional context: "${context}"` : ''}

Respond ONLY with a JSON object (no markdown, no explanation) with this structure:
{
  "microAction": "Specific 30-second first step to break paralysis (e.g., 'Open Google Doc and type the title')",
  "doneCriteria": "Clear, measurable completion criteria (3-5 specific items)",
  "timeEstimate": <realistic minutes as number>,
  "steps": ["Step 1", "Step 2", "Step 3"],
  "taskType": "email|document|code|meeting|planning|research|creative|other"
}

Make the microAction extremely concrete and small. Focus on the FIRST physical action.`
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error('AI breakdown failed')
    }

    const data = await response.json()
    const content = data.content[0].text
    
    // Parse JSON response
    const breakdown = JSON.parse(content)
    return breakdown
  } catch (error) {
    console.error('Task breakdown error:', error)
    
    // Fallback to simple breakdown
    return {
      microAction: `Open the document/file/app needed for "${title}"`,
      doneCriteria: 'Task completed and reviewed',
      timeEstimate: 30,
      steps: [
        'Set up your workspace',
        'Complete the main work',
        'Review and finalize'
      ],
      taskType: 'other'
    }
  }
}

export const TASK_TEMPLATES = {
  email: {
    doneCriteria: 'Recipients checked, attachments included, tone appropriate, spelling checked, sent',
    timeEstimate: 15,
    microAction: 'Open email client and write subject line',
    checklist: ['Recipients correct?', 'Attachments included?', 'Tone appropriate?', 'Proofread?']
  },
  document: {
    doneCriteria: 'All sections written, formatting consistent, proofread, reviewed, exported',
    timeEstimate: 60,
    microAction: 'Open document and write title/heading',
    checklist: ['All sections complete?', 'Formatting consistent?', 'Proofread?', 'Ready to share?']
  },
  code: {
    doneCriteria: 'Code written, tests pass, linted, commented, committed',
    timeEstimate: 45,
    microAction: 'Open code editor and create new file',
    checklist: ['Tests pass?', 'Code linted?', 'Comments added?', 'Committed?']
  },
  meeting: {
    doneCriteria: 'Agenda prepared, attendees notified, notes taken, action items sent',
    timeEstimate: 60,
    microAction: 'Open calendar and create meeting invite',
    checklist: ['Agenda ready?', 'All attendees invited?', 'Notes documented?', 'Follow-ups sent?']
  },
  planning: {
    doneCriteria: '3 priorities identified, time blocked, resources confirmed',
    timeEstimate: 30,
    microAction: 'Open planner and write date/week',
    checklist: ['Priorities clear?', 'Time blocked?', 'Resources ready?', 'Realistic?']
  },
  research: {
    doneCriteria: 'Sources found, notes organized, key findings summarized',
    timeEstimate: 45,
    microAction: 'Open browser and write research question',
    checklist: ['Sources credible?', 'Notes organized?', 'Key points summarized?', 'Citations saved?']
  },
  creative: {
    doneCriteria: 'Draft complete, feedback incorporated, final version exported',
    timeEstimate: 90,
    microAction: 'Open creative tool and create new project',
    checklist: ['Draft complete?', 'Feedback addressed?', 'Quality acceptable?', 'Exported correctly?']
  }
}
