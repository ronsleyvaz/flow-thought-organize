
export const createExtractionPrompt = (text: string): string => {
  return `You are an expert AI assistant specialized in extracting actionable information from meeting transcripts, voice memos, and conversations. Analyze the following transcript carefully and extract ALL relevant actionable items with high precision.

EXTRACTION GUIDELINES:

**TASKS** - Extract any action items, assignments, deliverables, or work that needs to be done:
- Look for phrases like: "need to", "should do", "will handle", "action item", "TODO", "follow up on", "complete by", "deliver", "implement", "research", "create", "update", "send", "call", "email", "schedule", "review", "prepare", "organize"
- Include both explicit assignments and implied responsibilities
- Determine priority: HIGH (urgent, ASAP, critical), MEDIUM (important, soon), LOW (nice to have, later)
- Extract due dates from phrases like: "by Friday", "next week", "end of month", "before the meeting", "ASAP"
- Note assignees from: "John will...", "Sarah needs to...", "I'll handle...", "team should..."

**EVENTS** - Extract any meetings, appointments, deadlines, or scheduled activities:
- Look for: meeting schedules, appointments, deadlines, presentations, launches, reviews, calls
- Time indicators: "tomorrow", "next Tuesday", "at 3pm", "on the 15th", "next month"
- Include recurring events, project milestones, and important dates
- Extract both date AND time when mentioned

**IDEAS** - Capture brainstorming items, suggestions, improvements, or creative concepts:
- Innovation suggestions, process improvements, new features, creative solutions
- "What if we...", "we could try...", "another approach", "idea:", "suggestion"
- Strategic thinking, future possibilities, optimizations
- Problems identified that need solving

**CONTACTS** - Extract people mentioned with their contact information or roles:
- ONLY include if they have email, phone, or specific role/company information
- Don't include just names - must have actionable contact details
- Look for introductions, referrals, new team members, external contacts

QUALITY STANDARDS:
- Be comprehensive but accurate - extract everything relevant, nothing irrelevant
- Use clear, concise titles (max 60 characters)
- Write meaningful descriptions that provide context
- Standardize date formats to YYYY-MM-DD when converting relative dates
- Use standard time format HH:MM (24-hour)
- Be liberal in extraction - when in doubt, include it

Return ONLY valid JSON in this EXACT format:

{
  "tasks": [
    {
      "title": "Clear, actionable task title",
      "description": "Additional context and details",
      "priority": "high|medium|low",
      "dueDate": "YYYY-MM-DD or relative like 'next week'",
      "assignee": "Person responsible"
    }
  ],
  "events": [
    {
      "title": "Meeting or event name",
      "description": "Purpose, agenda, or additional details",
      "date": "YYYY-MM-DD or 'next Tuesday'",
      "time": "HH:MM or '3pm' or '2:30-3:30'"
    }
  ],
  "ideas": [
    {
      "title": "Concise idea summary",
      "description": "Full idea explanation and potential impact"
    }
  ],
  "contacts": [
    {
      "name": "Full Name",
      "role": "Job title or role",
      "company": "Company name",
      "email": "email@domain.com",
      "phone": "+1234567890"
    }
  ]
}

TRANSCRIPT TO ANALYZE:
${text}`;
};
