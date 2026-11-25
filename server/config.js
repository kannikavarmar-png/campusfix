export const ALLOWED_CATEGORIES = [
  'Electrical',
  'Plumbing',
  'Furniture',
  'Cleaning',
  'Infrastructure',
  'Other',
];

export const ALLOWED_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export const CATEGORY_TO_DEPARTMENT = {
  Electrical: 'Electrical & Power Maintenance',
  Plumbing: 'Plumbing & Water Supply',
  Furniture: 'Carpentry & Classroom Assets',
  Cleaning: 'Housekeeping & Campus Sanitation',
  Infrastructure: 'Civil Works & Infrastructure',
  Other: 'General Campus Facilities',
};

export const CAMPUS_KNOWLEDGE_BASE = {
  appName: 'CampusFix AI – Smart Campus Maintenance Assistant',
  institution: 'Rathinam Technical Campus',
  location: 'Eachanari, Coimbatore, Tamil Nadu',
  tagline: 'Making Our Campus Smarter, Safer and Better.',
  supportEmail: 'maintenance@rathinam.in',
  helpline: '+91 422 404 0906',
  allowedImageFormats: ['JPG', 'JPEG', 'PNG'],
  maxImageSizeMB: 5,
  departments: [
    {
      category: 'Electrical',
      department: 'Electrical & Power Maintenance',
      handles:
        'Flickering or broken lights, ceiling fans, loose power sockets, lab electrical circuits, AC power faults, and power outages.',
    },
    {
      category: 'Plumbing',
      department: 'Plumbing & Water Supply',
      handles:
        'Leaking taps, burst or dripping pipes, washroom drainage blockages, drinking water dispensers, and hostel water supply issues.',
    },
    {
      category: 'Furniture',
      department: 'Carpentry & Classroom Assets',
      handles:
        'Broken desks, loose chairs, classroom benches, damaged doors or locks, whiteboards, lab stools, and hostel cots.',
    },
    {
      category: 'Cleaning',
      department: 'Housekeeping & Campus Sanitation',
      handles:
        'Overflowing waste bins, corridor cleaning, washroom sanitation, cafeteria spills, and campus ground hygiene.',
    },
    {
      category: 'Infrastructure',
      department: 'Civil Works & Infrastructure',
      handles:
        'Cracked floor tiles, wall cracks or seepage, staircase handrails, ceiling plaster damage, roofing, and pavement repairs.',
    },
    {
      category: 'Other',
      department: 'General Campus Facilities',
      handles:
        'Campus signage boards, parking barriers, notice boards, and general campus facility requests not covered above.',
    },
  ],
  statuses: [
    {
      name: 'Submitted',
      meaning:
        'Your complaint has been recorded in CampusFix AI with a unique Complaint ID and is queued for initial review.',
    },
    {
      name: 'Under Review',
      meaning:
        'The campus maintenance coordinator is inspecting your description, photograph, and AI assessment.',
    },
    {
      name: 'Assigned',
      meaning:
        'Your complaint has been assigned to the responsible maintenance department for scheduling.',
    },
    {
      name: 'In Progress',
      meaning:
        'Maintenance technicians are actively working on repairing or resolving the reported issue.',
    },
    {
      name: 'Resolved',
      meaning:
        'The repair has been completed, verified, and closed by the administrator with resolution notes.',
    },
  ],
  howToReport: [
    'Open the "Report Issue" page from the top navigation bar or homepage.',
    'Optionally enter your name and email/contact (these remain private).',
    'Choose the Campus Location, Building/Block, Floor or Room Number, and Date & Time.',
    'Write a clear description of the maintenance issue and upload a photo in JPG, JPEG, or PNG format (up to 5 MB).',
    'Click "Analyze with AI" to review the suggested category, department, priority, and reasoning (or select them manually if AI is unavailable).',
    'Click "Submit Complaint" to receive your unique Complaint ID (format: RTC-YYYY-XXXXX).',
  ],
  howToTrack: [
    'Go to the "Track Complaint" page from the navigation bar.',
    'Enter your unique Complaint ID (e.g., RTC-2026-EL401) and click "Track Status".',
    'You can also sign in to the "Student Dashboard" to see all complaints submitted under your account along with live timelines and admin resolution notes.',
  ],
  privacyPolicy:
    'Students can only access their own submitted complaints in the Student Dashboard. Public Complaint ID lookups hide student names and contact information. Only authorized administrators can view and manage all campus complaints.',
};
