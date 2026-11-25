import { GoogleGenAI } from '@google/genai';
import {
  ALLOWED_CATEGORIES,
  ALLOWED_PRIORITIES,
  CATEGORY_TO_DEPARTMENT,
  CAMPUS_KNOWLEDGE_BASE,
} from '../config.js';

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

function getModelCandidates() {
  const configured = process.env.GEMINI_MODEL?.trim();
  const defaults = [
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
    'gemini-3-flash-preview',
    'gemini-3.8-flash',
  ];
  return [...new Set(configured ? [configured, ...defaults] : defaults)];
}

async function generateWithFallback(ai, requestOptions) {
  const models = getModelCandidates();
  let lastError = null;
  for (const model of models) {
    try {
      return await ai.models.generateContent({
        ...requestOptions,
        model,
      });
    } catch (err) {
      lastError = err;
      const msg = String(err?.message || '');
      // Retry with next candidate on transient 503/429 or deprecated 404 model
      if (/(503|404|429|UNAVAILABLE|NOT_FOUND|high demand)/i.test(msg)) {
        continue;
      }
      throw err;
    }
  }
  throw lastError || new Error('Gemini AI models are temporarily unavailable.');
}

function parseDataUrl(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return null;
  const match = dataUrl.match(/^data:(image\/(?:jpeg|jpg|png));base64,(.+)$/i);
  if (!match) return null;
  const mimeType = match[1].toLowerCase() === 'image/jpg' ? 'image/jpeg' : match[1].toLowerCase();
  return { mimeType, data: match[2] };
}

/**
 * Analyze a campus maintenance issue (image + text) using Google Gemini.
 * Never fabricates results if GEMINI_API_KEY is missing or the API call fails.
 */
export async function analyzeCampusIssue({
  description,
  location,
  building,
  floorRoom,
  imageDataUrl,
}) {
  const ai = getGeminiClient();
  if (!ai) {
    const err = new Error(
      'Gemini API key is not configured on the server (GEMINI_API_KEY missing in .env). Please select the category and priority manually.'
    );
    err.code = 'AI_NOT_CONFIGURED';
    err.statusCode = 503;
    throw err;
  }

  const promptText = `You are CampusFix AI, the campus maintenance triage assistant for Rathinam Technical Campus.
Inspect the user's complaint description and attached photograph (if provided), then return ONLY valid JSON matching this exact structure:
{
  "detected_issue": "short 4-10 word name of the maintenance issue",
  "category": "one of: Electrical | Plumbing | Furniture | Cleaning | Infrastructure | Other",
  "recommended_department": "exact responsible department name",
  "priority": "one of: Low | Medium | High | Urgent",
  "summary": "1-2 concise sentences summarizing the issue for maintenance staff",
  "reasoning": "1-2 concise sentences explaining why this category and priority were suggested based on safety, urgency, and visual/text evidence"
}

Department mapping:
- Electrical -> Electrical & Power Maintenance
- Plumbing -> Plumbing & Water Supply
- Furniture -> Carpentry & Classroom Assets
- Cleaning -> Housekeeping & Campus Sanitation
- Infrastructure -> Civil Works & Infrastructure
- Other -> General Campus Facilities

Priority rules:
- Urgent: immediate safety, fire, electrical hazard, major flood, or structural danger.
- High: significant disruption to classes/hostels, slip/trip hazard, sanitation risk, or continuous leak.
- Medium: functional problem with temporary workaround available.
- Low: cosmetic or minor non-urgent issue.

Complaint details:
- Campus Location: ${location || 'Not specified'}
- Building/Block: ${building || 'Not specified'}
- Floor/Room: ${floorRoom || 'Not specified'}
- Description: ${description}`;

  const parts = [{ text: promptText }];

  if (imageDataUrl) {
    const parsedImg = parseDataUrl(imageDataUrl);
    if (!parsedImg) {
      const err = new Error('Invalid image format. Only JPG, JPEG, and PNG are supported.');
      err.code = 'INVALID_IMAGE';
      err.statusCode = 400;
      throw err;
    }
    parts.push({
      inlineData: {
        mimeType: parsedImg.mimeType,
        data: parsedImg.data,
      },
    });
  }

  const response = await generateWithFallback(ai, {
    contents: [{ role: 'user', parts }],
    config: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  });

  const rawText = response.text?.trim();
  if (!rawText) {
    throw new Error('Gemini returned an empty response.');
  }

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Gemini response could not be parsed as structured JSON.');
    }
    parsed = JSON.parse(jsonMatch[0]);
  }

  const category = ALLOWED_CATEGORIES.includes(parsed.category) ? parsed.category : 'Other';
  const priority = ALLOWED_PRIORITIES.includes(parsed.priority) ? parsed.priority : 'Medium';
  const recommendedDepartment = CATEGORY_TO_DEPARTMENT[category];

  return {
    detected_issue: String(parsed.detected_issue || `${category} maintenance issue`).slice(0, 140),
    category,
    recommended_department: recommendedDepartment,
    priority,
    summary: String(parsed.summary || description.slice(0, 160)).slice(0, 400),
    reasoning: String(
      parsed.reasoning ||
        `Classified as ${category} with ${priority} priority based on the submitted maintenance description.`
    ).slice(0, 500),
  };
}

/**
 * Deterministic fallback responder grounded STRICTLY in CAMPUS_KNOWLEDGE_BASE.
 * Used when GEMINI_API_KEY is not configured — never invents statuses or claims resolution.
 */
function deterministicKnowledgeBaseReply(message) {
  const q = message.toLowerCase();

  // Check if user asks about a specific complaint ID or asks if their issue is fixed/resolved
  const mentionsComplaintId = /\brtc-\d{4}-[a-z0-9]{4,8}\b/i.test(message);
  if (
    mentionsComplaintId ||
    /\b(is my|has my|check my|status of my|was it fixed|been resolved)\b/i.test(q)
  ) {
    return (
      'For privacy and accuracy, I cannot look up or confirm individual complaint statuses in chat, and I never guess whether an issue has been resolved.\n\n' +
      'To check the exact real-time status of your complaint:\n' +
      '1. Visit the "Track Complaint" page and enter your unique Complaint ID (e.g., RTC-2026-XXXXX).\n' +
      '2. Or sign in to your "Student Dashboard" to view your complaint timeline and administrator resolution notes.'
    );
  }

  if (/\b(report|submit|file|create|new complaint|how do i report|log an issue)\b/i.test(q)) {
    return (
      'Here is how to report a maintenance issue on CampusFix AI:\n' +
      CAMPUS_KNOWLEDGE_BASE.howToReport.map((s, idx) => `${idx + 1}. ${s}`).join('\n')
    );
  }

  if (/\b(track|find my|check status|complaint id|where is my)\b/i.test(q)) {
    return (
      'Here is how you can track your complaint:\n' +
      CAMPUS_KNOWLEDGE_BASE.howToTrack.map((s, idx) => `${idx + 1}. ${s}`).join('\n')
    );
  }

  if (/\b(status|statuses|mean|meaning|under review|assigned|in progress|submitted|resolved)\b/i.test(q)) {
    return (
      'CampusFix AI uses 5 official complaint statuses:\n' +
      CAMPUS_KNOWLEDGE_BASE.statuses
        .map((st, idx) => `${idx + 1}. ${st.name}: ${st.meaning}`)
        .join('\n')
    );
  }

  // Department-specific queries
  for (const dept of CAMPUS_KNOWLEDGE_BASE.departments) {
    const keyword = dept.category.toLowerCase();
    const extraMatch =
      (keyword === 'electrical' && /\b(light|fan|power|socket|wire|ac|short circuit|electric)\b/i.test(q)) ||
      (keyword === 'plumbing' && /\b(water|pipe|leak|tap|washroom|toilet|drain|basin)\b/i.test(q)) ||
      (keyword === 'furniture' && /\b(chair|desk|bench|table|door|lock|carpentry|bed|cot)\b/i.test(q)) ||
      (keyword === 'cleaning' && /\b(clean|trash|garbage|bin|spill|hygiene|sanitation|housekeeping)\b/i.test(q)) ||
      (keyword === 'infrastructure' && /\b(tile|wall|crack|ceiling|stair|civil|roof|floor)\b/i.test(q));

    if (q.includes(keyword) || extraMatch) {
      return `${dept.category} issues at ${CAMPUS_KNOWLEDGE_BASE.institution} are handled by the ${dept.department} team.\n\nScope: ${dept.handles}`;
    }
  }

  if (/\b(department|departments|team|who handles|category|categories)\b/i.test(q)) {
    return (
      `CampusFix AI routes issues across 6 maintenance departments at ${CAMPUS_KNOWLEDGE_BASE.institution}:\n` +
      CAMPUS_KNOWLEDGE_BASE.departments
        .map((d) => `• ${d.category} → ${d.department}`)
        .join('\n')
    );
  }

  if (/\b(photo|image|jpg|jpeg|png|upload|format|size)\b/i.test(q)) {
    return `You can upload photographs in ${CAMPUS_KNOWLEDGE_BASE.allowedImageFormats.join(', ')} formats up to ${CAMPUS_KNOWLEDGE_BASE.maxImageSizeMB} MB on the Report Issue page.`;
  }

  if (/\b(contact|email|phone|helpline|support|office)\b/i.test(q)) {
    return `You can reach ${CAMPUS_KNOWLEDGE_BASE.institution} Campus Maintenance Support at ${CAMPUS_KNOWLEDGE_BASE.supportEmail} or ${CAMPUS_KNOWLEDGE_BASE.helpline}.`;
  }

  if (/\b(privacy|private|who can see|security|role)\b/i.test(q)) {
    return CAMPUS_KNOWLEDGE_BASE.privacyPolicy;
  }

  return (
    `I can only answer questions supported by ${CAMPUS_KNOWLEDGE_BASE.appName}'s configured campus maintenance documentation for ${CAMPUS_KNOWLEDGE_BASE.institution}.\n\n` +
    'Try asking me:\n' +
    '• How do I report a maintenance issue?\n' +
    '• How can I track my complaint?\n' +
    '• Which department handles electrical (or plumbing, furniture, cleaning, infrastructure) issues?\n' +
    '• What does my complaint status mean?'
  );
}

/**
 * Grounded CampusFix Assistant chat responder.
 * Uses Gemini when configured (strictly constrained to configured KB) and
 * deterministic KB lookup when GEMINI_API_KEY is not set.
 */
export async function answerCampusQuestion({ message, history = [] }) {
  const ai = getGeminiClient();

  if (!ai) {
    return {
      reply: deterministicKnowledgeBaseReply(message),
      mode: 'knowledge_base',
    };
  }

  const systemInstruction = `You are "CampusFix Assistant", the official helpdesk chatbot for ${CAMPUS_KNOWLEDGE_BASE.appName} at ${CAMPUS_KNOWLEDGE_BASE.institution}.

STRICT GROUNDING RULES:
1. Answer ONLY using the configured information provided below.
2. NEVER invent complaint statuses, NEVER claim a user's issue has been resolved or assigned, and NEVER fabricate phone numbers, names, SLAs, or policies not listed below.
3. If the user asks about a specific complaint ID or asks whether their complaint is fixed, instruct them to check the "Track Complaint" page or their "Student Dashboard".
4. If the question is outside the configured website information, politely state that you can only assist with CampusFix AI maintenance reporting, tracking, departments, and status definitions.
5. Keep answers concise, clear, and helpful.

CONFIGURED WEBSITE INFORMATION:
${JSON.stringify(CAMPUS_KNOWLEDGE_BASE, null, 2)}`;

  const contents = [
    ...history
      .filter((m) => m && typeof m.text === 'string' && (m.role === 'user' || m.role === 'assistant'))
      .slice(-6)
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.text }],
      })),
  ];

  // Ensure the latest user message is present
  const last = contents[contents.length - 1];
  if (!last || last.role !== 'user' || last.parts[0].text !== message) {
    contents.push({ role: 'user', parts: [{ text: message }] });
  }

  try {
    const response = await generateWithFallback(ai, {
      contents,
      config: {
        systemInstruction,
        temperature: 0.1,
      },
    });
    const reply = response.text?.trim();
    if (!reply) {
      return { reply: deterministicKnowledgeBaseReply(message), mode: 'knowledge_base' };
    }
    return { reply, mode: 'gemini' };
  } catch {
    return {
      reply: deterministicKnowledgeBaseReply(message),
      mode: 'knowledge_base_fallback',
    };
  }
}
