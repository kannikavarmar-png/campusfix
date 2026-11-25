/**
 * Clearly labelled Demo Mode sample dataset for Rathinam Technical Campus.
 * Used ONLY when Demo Mode is active (e.g., before Supabase credentials are configured).
 */

function createSamplePhotoSvg({ title, subtitle, accent, iconPath }) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0b1f40"/>
        <stop offset="100%" stop-color="#1b3a73"/>
      </linearGradient>
    </defs>
    <rect width="800" height="500" fill="url(#bg)"/>
    <circle cx="670" cy="110" r="140" fill="${accent}" opacity="0.14"/>
    <circle cx="130" cy="410" r="120" fill="#10b981" opacity="0.12"/>
    <rect x="52" y="48" width="210" height="34" rx="17" fill="#ffffff" opacity="0.14"/>
    <text x="72" y="70" fill="#e2e8f0" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="600">DEMO INSPECTION PHOTO</text>
    <g transform="translate(340, 140)">
      <rect x="0" y="0" width="120" height="120" rx="28" fill="${accent}" opacity="0.22" stroke="${accent}" stroke-width="2"/>
      <path d="${iconPath}" transform="translate(32, 32) scale(2.3)" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <text x="400" y="318" text-anchor="middle" fill="#ffffff" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="26" font-weight="700">${title}</text>
    <text x="400" y="354" text-anchor="middle" fill="#cbd5e1" font-family="Inter, Arial, sans-serif" font-size="16">${subtitle}</text>
    <text x="400" y="446" text-anchor="middle" fill="#94a3b8" font-family="Inter, Arial, sans-serif" font-size="13">Rathinam Technical Campus • Sample Demonstration Attachment</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const DEMO_USERS = {
  student: {
    id: 'demo-student-01',
    name: 'Ananya Krishnan',
    email: 'ananya.krishnan@rathinam.in',
    role: 'student',
    department: 'B.E. Computer Science & Engineering (Year III)',
  },
  student2: {
    id: 'demo-student-02',
    name: 'Karthik Raja',
    email: 'karthik.raja@rathinam.in',
    role: 'student',
    department: 'B.Tech Artificial Intelligence & Data Science (Year II)',
  },
  admin: {
    id: 'demo-admin-01',
    name: 'Dr. Rajeshwari S.',
    email: 'facilities.admin@rathinam.in',
    role: 'admin',
    department: 'Campus Facilities & Estate Office',
  },
};

function daysAgo(days, hoursOffset = 0) {
  const date = new Date(Date.now() - (days * 24 + hoursOffset) * 60 * 60 * 1000);
  return date.toISOString();
}

export const INITIAL_DEMO_COMPLAINTS = [
  {
    id: 'demo-rec-1',
    complaint_id: 'RTC-2026-EL401',
    user_id: 'demo-student-01',
    reporter_name: 'Ananya Krishnan',
    reporter_contact: 'ananya.krishnan@rathinam.in',
    location: 'Main Academic Campus',
    building: 'A Block – CSE & AI Labs',
    floor_room: 'Floor 2, Lab 204',
    description:
      'Overhead LED tube fixture near row 3 is flickering continuously and emitting a faint burning odor whenever the lab AC load turns on.',
    image_url: createSamplePhotoSvg({
      title: 'Flickering LED Fixture & Wiring',
      subtitle: 'A Block – CSE & AI Labs • Floor 2, Lab 204',
      accent: '#f59e0b',
      iconPath: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
    }),
    category: 'Electrical',
    ai_summary:
      'Faulty overhead LED fixture with possible ballast/wiring overheating in CSE Lab 204.',
    ai_reasoning:
      'Classified as Electrical due to flickering lighting fixture under AC load. Marked Urgent because burning odor indicates a potential short-circuit or fire hazard.',
    ai_detected_issue: 'Overheating LED light fixture / electrical ballast fault',
    ai_analyzed: true,
    suggested_priority: 'Urgent',
    assigned_department: 'Electrical & Power Maintenance',
    current_status: 'In Progress',
    resolution_notes:
      'Electrician inspected junction box; isolating circuit breaker and replacing damaged choke & LED fitting today.',
    reported_at: daysAgo(1, 5),
    created_at: daysAgo(1, 5),
    updated_at: daysAgo(0, 6),
    status_history: [
      { status: 'Submitted', note: 'Complaint logged by student.', timestamp: daysAgo(1, 5) },
      { status: 'Under Review', note: 'Flagged as urgent safety check.', timestamp: daysAgo(1, 3) },
      { status: 'Assigned', note: 'Assigned to Electrical & Power Maintenance.', timestamp: daysAgo(1, 1) },
      {
        status: 'In Progress',
        note: 'Technician on site replacing ballast and wiring harness.',
        timestamp: daysAgo(0, 6),
      },
    ],
  },
  {
    id: 'demo-rec-2',
    complaint_id: 'RTC-2026-PL219',
    user_id: 'demo-student-01',
    reporter_name: 'Ananya Krishnan',
    reporter_contact: 'ananya.krishnan@rathinam.in',
    location: 'Hostel Zone',
    building: 'Girls Hostel – Block A',
    floor_room: 'Floor 3, Washroom East Wing',
    description:
      'Water tap pipe beneath the second washbasin is leaking steadily, causing water to pool on the corridor tiles and making the floor slippery.',
    image_url: createSamplePhotoSvg({
      title: 'Under-Sink Pipe Leakage',
      subtitle: 'Girls Hostel – Block A • Floor 3 East Wing',
      accent: '#0ea5e9',
      iconPath: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z',
    }),
    category: 'Plumbing',
    ai_summary:
      'Steady water leak from washbasin supply pipe creating slip hazard on Floor 3.',
    ai_reasoning:
      'Classified as Plumbing due to leaking basin pipe. Assigned High priority because standing water poses slip risk and continuous water wastage.',
    ai_detected_issue: 'Leaking washbasin inlet pipe joint',
    ai_analyzed: true,
    suggested_priority: 'High',
    assigned_department: 'Plumbing & Water Supply',
    current_status: 'Assigned',
    resolution_notes: 'Plumbing team scheduled with replacement PVC elbow valve.',
    reported_at: daysAgo(2, 4),
    created_at: daysAgo(2, 4),
    updated_at: daysAgo(1, 8),
    status_history: [
      { status: 'Submitted', note: 'Complaint submitted via CampusFix AI.', timestamp: daysAgo(2, 4) },
      { status: 'Under Review', note: 'Verified photo and hostel floor access.', timestamp: daysAgo(2, 1) },
      {
        status: 'Assigned',
        note: 'Dispatched to Plumbing & Water Supply crew.',
        timestamp: daysAgo(1, 8),
      },
    ],
  },
  {
    id: 'demo-rec-3',
    complaint_id: 'RTC-2026-FN108',
    user_id: 'demo-student-01',
    reporter_name: 'Ananya Krishnan',
    reporter_contact: 'ananya.krishnan@rathinam.in',
    location: 'Central Library & Auditorium',
    building: 'Central Knowledge Library',
    floor_room: 'Floor 1, Reading Bay C',
    description:
      'Two wooden study chairs have loose backrest bolts and wobbly legs, making them unsafe for students sitting during exam preparation.',
    image_url: createSamplePhotoSvg({
      title: 'Loose Study Chair Joints',
      subtitle: 'Central Knowledge Library • Floor 1, Reading Bay C',
      accent: '#8b5cf6',
      iconPath: 'M4 19h16M6 19v-7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v7M8 10V5h8v5',
    }),
    category: 'Furniture',
    ai_summary: 'Damaged study chairs with loose backrest bolts in Library Reading Bay C.',
    ai_reasoning:
      'Classified as Furniture for broken seating hardware. Marked Medium priority as chairs can be cordoned off temporarily while awaiting carpentry repair.',
    ai_detected_issue: 'Unstable wooden chairs with loose fasteners',
    ai_analyzed: true,
    suggested_priority: 'Medium',
    assigned_department: 'Carpentry & Classroom Assets',
    current_status: 'Resolved',
    resolution_notes:
      'Carpentry team tightened joints, replaced rusted bolts on 2 chairs, and verified stability across Reading Bay C.',
    reported_at: daysAgo(6, 2),
    created_at: daysAgo(6, 2),
    updated_at: daysAgo(3, 5),
    status_history: [
      { status: 'Submitted', note: 'Reported by student.', timestamp: daysAgo(6, 2) },
      { status: 'Under Review', note: 'Reviewed by campus estate coordinator.', timestamp: daysAgo(5, 18) },
      { status: 'Assigned', note: 'Assigned to Carpentry & Classroom Assets.', timestamp: daysAgo(5, 8) },
      { status: 'In Progress', note: 'Chairs moved to workshop for bolt replacement.', timestamp: daysAgo(4, 10) },
      {
        status: 'Resolved',
        note: 'Repaired chairs returned and inspected by library supervisor.',
        timestamp: daysAgo(3, 5),
      },
    ],
  },
  {
    id: 'demo-rec-4',
    complaint_id: 'RTC-2026-CL305',
    user_id: 'demo-student-02',
    reporter_name: 'Karthik Raja',
    reporter_contact: 'karthik.raja@rathinam.in',
    location: 'Cafeteria & Common Areas',
    building: 'Main Campus Food Court',
    floor_room: 'Ground Floor, West Seating',
    description:
      'Waste disposal bins near the west exit are overflowing after lunch break and attracting flies near student dining tables.',
    image_url: createSamplePhotoSvg({
      title: 'Overflowing Waste Bins',
      subtitle: 'Main Campus Food Court • West Seating Area',
      accent: '#10b981',
      iconPath: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
    }),
    category: 'Cleaning',
    ai_summary: 'Overflowing food court waste bins causing sanitation issue in west seating area.',
    ai_reasoning:
      'Classified as Cleaning / Sanitation. Marked High priority because food waste near dining spaces creates hygiene risks.',
    ai_detected_issue: 'Unemptied overflowing garbage receptacles',
    ai_analyzed: true,
    suggested_priority: 'High',
    assigned_department: 'Housekeeping & Campus Sanitation',
    current_status: 'Resolved',
    resolution_notes:
      'Sanitation crew cleared bins, disinfected surrounding floor area, and added an extra 2:30 PM collection cycle.',
    reported_at: daysAgo(5, 6),
    created_at: daysAgo(5, 6),
    updated_at: daysAgo(4, 20),
    status_history: [
      { status: 'Submitted', note: 'Complaint logged.', timestamp: daysAgo(5, 6) },
      { status: 'Assigned', note: 'Routed to Housekeeping & Campus Sanitation.', timestamp: daysAgo(5, 4) },
      { status: 'Resolved', note: 'Area cleaned, sanitized, and extra shift scheduled.', timestamp: daysAgo(4, 20) },
    ],
  },
  {
    id: 'demo-rec-5',
    complaint_id: 'RTC-2026-IN512',
    user_id: 'demo-student-02',
    reporter_name: 'Karthik Raja',
    reporter_contact: 'karthik.raja@rathinam.in',
    location: 'Main Academic Campus',
    building: 'B Block – ECE & EEE Wing',
    floor_room: 'Floor 1, North Staircase',
    description:
      'Two granite floor tiles near the first-floor staircase landing have cracked and lifted slightly, creating a tripping edge for students.',
    image_url: createSamplePhotoSvg({
      title: 'Cracked Staircase Landing Tiles',
      subtitle: 'B Block – ECE & EEE Wing • Floor 1 North Staircase',
      accent: '#ef4444',
      iconPath: 'M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6',
    }),
    category: 'Infrastructure',
    ai_summary: 'Lifted and cracked granite tiles on B Block Floor 1 staircase landing.',
    ai_reasoning:
      'Classified as Infrastructure / Civil Works due to flooring damage. Assigned High priority due to pedestrian trip hazard on a busy staircase.',
    ai_detected_issue: 'Broken and uneven staircase landing tiles',
    ai_analyzed: true,
    suggested_priority: 'High',
    assigned_department: 'Civil Works & Infrastructure',
    current_status: 'Under Review',
    resolution_notes: 'Caution tape placed; civil engineer assessing replacement tile stock.',
    reported_at: daysAgo(3, 1),
    created_at: daysAgo(3, 1),
    updated_at: daysAgo(2, 12),
    status_history: [
      { status: 'Submitted', note: 'Submitted with site photo.', timestamp: daysAgo(3, 1) },
      {
        status: 'Under Review',
        note: 'Safety tape installed while civil mason evaluates replacement.',
        timestamp: daysAgo(2, 12),
      },
    ],
  },
  {
    id: 'demo-rec-6',
    complaint_id: 'RTC-2026-EL677',
    user_id: 'demo-student-02',
    reporter_name: 'Karthik Raja',
    reporter_contact: 'karthik.raja@rathinam.in',
    location: 'Innovation & IT Park',
    building: 'AI & Robotics Lab Wing',
    floor_room: 'Floor 3, Project Bay 302',
    description:
      'Wall-mounted projector HDMI power socket is loose and intermittently disconnects presentations during project reviews.',
    image_url: createSamplePhotoSvg({
      title: 'Loose Projector Wall Socket',
      subtitle: 'AI & Robotics Lab Wing • Floor 3, Project Bay 302',
      accent: '#f59e0b',
      iconPath: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
    }),
    category: 'Electrical',
    ai_summary: 'Loose projector power outlet disrupting presentations in Project Bay 302.',
    ai_reasoning:
      'Classified as Electrical due to loose wall power socket. Medium priority as alternative power extension can be used temporarily.',
    ai_detected_issue: 'Loose wall power receptacle',
    ai_analyzed: true,
    suggested_priority: 'Medium',
    assigned_department: 'Electrical & Power Maintenance',
    current_status: 'Submitted',
    resolution_notes: '',
    reported_at: daysAgo(0, 9),
    created_at: daysAgo(0, 9),
    updated_at: daysAgo(0, 9),
    status_history: [
      { status: 'Submitted', note: 'New issue submitted for review.', timestamp: daysAgo(0, 9) },
    ],
  },
  {
    id: 'demo-rec-7',
    complaint_id: 'RTC-2026-OT734',
    user_id: 'demo-student-01',
    reporter_name: 'Ananya Krishnan',
    reporter_contact: 'ananya.krishnan@rathinam.in',
    location: 'Transport & Parking Bay',
    building: 'Two-Wheeler Parking Zone',
    floor_room: 'Bay B, South Entry',
    description:
      'Directional signage board for student two-wheeler entry has faded and tilted after strong wind, confusing new visitors.',
    image_url: createSamplePhotoSvg({
      title: 'Tilted Parking Signage Board',
      subtitle: 'Two-Wheeler Parking Zone • Bay B South Entry',
      accent: '#64748b',
      iconPath: 'M12 22V8M5 12H2a10 10 0 0 0 20 0h-3M12 2l4 4H8l4-4z',
    }),
    category: 'Other',
    ai_summary: 'Faded and tilted directional parking signboard at Two-Wheeler Parking Bay B.',
    ai_reasoning:
      'Classified as Other / General Facilities signage repair. Low priority since it poses minimal immediate hazard.',
    ai_detected_issue: 'Damaged outdoor directional signboard',
    ai_analyzed: true,
    suggested_priority: 'Low',
    assigned_department: 'General Campus Facilities',
    current_status: 'Submitted',
    resolution_notes: '',
    reported_at: daysAgo(4, 3),
    created_at: daysAgo(4, 3),
    updated_at: daysAgo(4, 3),
    status_history: [
      { status: 'Submitted', note: 'Logged via CampusFix AI.', timestamp: daysAgo(4, 3) },
    ],
  },
];
