export interface TaskTemplate {
  id: string
  name: string
  emoji: string
  title: string
  doneCriteria: string
  timeEstimate: number
  firstAction: string
  category: 'work' | 'communication' | 'learning' | 'personal' | 'creative'
}

export const TASK_TEMPLATES: TaskTemplate[] = [
  // Communication
  {
    id: 'write-email',
    name: 'Write Email',
    emoji: '📧',
    title: 'Write email to [person/team]',
    doneCriteria: 'Email drafted, proofread, recipient verified, attachments added, sent',
    timeEstimate: 15,
    firstAction: 'Open email client and type recipient name in "To" field',
    category: 'communication',
  },
  {
    id: 'respond-messages',
    name: 'Respond to Messages',
    emoji: '💬',
    title: 'Respond to pending messages',
    doneCriteria: 'All messages read, responses sent or flagged for later',
    timeEstimate: 20,
    firstAction: 'Open inbox and mark first unread message as read',
    category: 'communication',
  },

  // Work
  {
    id: 'write-document',
    name: 'Write Document/Report',
    emoji: '📝',
    title: 'Write [document name]',
    doneCriteria: 'All sections complete, proofread, formatting checked, saved/exported',
    timeEstimate: 90,
    firstAction: 'Open Google Docs and type document title at top',
    category: 'work',
  },
  {
    id: 'review-document',
    name: 'Review Document',
    emoji: '👀',
    title: 'Review [document name]',
    doneCriteria: 'Read completely, comments added, feedback sent to owner',
    timeEstimate: 30,
    firstAction: 'Open document and scroll to beginning',
    category: 'work',
  },
  {
    id: 'data-analysis',
    name: 'Analyze Data',
    emoji: '📊',
    title: 'Analyze data for [project]',
    doneCriteria: 'Data cleaned, analysis complete, key insights documented, charts created',
    timeEstimate: 120,
    firstAction: 'Open spreadsheet and check first column for errors',
    category: 'work',
  },
  {
    id: 'meeting-prep',
    name: 'Prepare for Meeting',
    emoji: '🗓️',
    title: 'Prep for [meeting name]',
    doneCriteria: 'Agenda reviewed, notes ready, questions listed, materials gathered',
    timeEstimate: 15,
    firstAction: 'Open calendar and read meeting invite',
    category: 'work',
  },

  // Creative
  {
    id: 'create-presentation',
    name: 'Create Presentation',
    emoji: '🎨',
    title: 'Create presentation for [topic]',
    doneCriteria: 'All slides complete, design consistent, proofread, exported to PDF',
    timeEstimate: 120,
    firstAction: 'Open PowerPoint/Slides and create first slide with title',
    category: 'creative',
  },
  {
    id: 'brainstorm',
    name: 'Brainstorm Ideas',
    emoji: '💡',
    title: 'Brainstorm ideas for [project]',
    doneCriteria: '10+ ideas listed, top 3 selected, next steps identified',
    timeEstimate: 30,
    firstAction: 'Open blank doc and write "[Project] Ideas" as title',
    category: 'creative',
  },

  // Learning
  {
    id: 'research-topic',
    name: 'Research Topic',
    emoji: '🔍',
    title: 'Research [topic]',
    doneCriteria: '3+ sources reviewed, key findings noted, sources saved',
    timeEstimate: 45,
    firstAction: 'Open browser and type first search query',
    category: 'learning',
  },
  {
    id: 'take-course',
    name: 'Complete Course Lesson',
    emoji: '🎓',
    title: 'Complete [course name] lesson',
    doneCriteria: 'Video watched, notes taken, exercises completed',
    timeEstimate: 60,
    firstAction: 'Open course platform and click on next lesson',
    category: 'learning',
  },

  // Personal
  {
    id: 'plan-day',
    name: 'Plan My Day',
    emoji: '📅',
    title: 'Plan today\'s priorities',
    doneCriteria: 'Top 3 priorities identified, time blocks set, calendar updated',
    timeEstimate: 10,
    firstAction: 'Open calendar and look at today\'s schedule',
    category: 'personal',
  },
  {
    id: 'organize-files',
    name: 'Organize Files',
    emoji: '📁',
    title: 'Organize [folder/files]',
    doneCriteria: 'Files sorted into folders, duplicates deleted, naming consistent',
    timeEstimate: 30,
    firstAction: 'Open the folder and sort files by date modified',
    category: 'personal',
  },
  {
    id: 'pay-bills',
    name: 'Pay Bills',
    emoji: '💳',
    title: 'Pay pending bills',
    doneCriteria: 'All bills reviewed, payments scheduled/completed, confirmations saved',
    timeEstimate: 20,
    firstAction: 'Open banking app and check pending bills',
    category: 'personal',
  },
]

export const getTemplatesByCategory = (category: string) => {
  return TASK_TEMPLATES.filter(t => t.category === category)
}

export const getTemplateById = (id: string) => {
  return TASK_TEMPLATES.find(t => t.id === id)
}
