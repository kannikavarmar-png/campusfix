export const CAMPUS_BRAND = {
  appName: 'CampusFix AI',
  fullTitle: 'CampusFix AI – Smart Campus Maintenance Assistant',
  institution: 'Rathinam Technical Campus',
  location: 'Eachanari, Coimbatore, Tamil Nadu',
  tagline: 'Making Our Campus Smarter, Safer and Better.',
  supportEmail: 'maintenance@rathinam.in',
  helpline: '+91 422 404 0906',
};

export const CATEGORIES = [
  'Electrical',
  'Plumbing',
  'Furniture',
  'Cleaning',
  'Infrastructure',
  'Other',
];

export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export const STATUSES = [
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
];

export const DEPARTMENTS = [
  'Electrical & Power Maintenance',
  'Plumbing & Water Supply',
  'Carpentry & Classroom Assets',
  'Housekeeping & Campus Sanitation',
  'Civil Works & Infrastructure',
  'General Campus Facilities',
];

export const CATEGORY_TO_DEPARTMENT = {
  Electrical: 'Electrical & Power Maintenance',
  Plumbing: 'Plumbing & Water Supply',
  Furniture: 'Carpentry & Classroom Assets',
  Cleaning: 'Housekeeping & Campus Sanitation',
  Infrastructure: 'Civil Works & Infrastructure',
  Other: 'General Campus Facilities',
};

export const CAMPUS_LOCATIONS = [
  'Main Academic Campus',
  'Hostel Zone',
  'Central Library & Auditorium',
  'Innovation & IT Park',
  'Sports & Recreation Complex',
  'Cafeteria & Common Areas',
  'Transport & Parking Bay',
];

export const BUILDINGS_BY_LOCATION = {
  'Main Academic Campus': [
    'A Block – CSE & AI Labs',
    'B Block – ECE & EEE Wing',
    'C Block – Mechanical & Civil',
    'Admin & Placement Block',
    'Science & Humanities Block',
  ],
  'Hostel Zone': [
    'Boys Hostel – Block 1',
    'Boys Hostel – Block 2',
    'Girls Hostel – Block A',
    'Girls Hostel – Block B',
    'Hostel Dining Mess',
  ],
  'Central Library & Auditorium': [
    'Central Knowledge Library',
    'Rathinam Grand Auditorium',
    'Seminar Hall Complex',
  ],
  'Innovation & IT Park': [
    'Rathinam Techzone Building',
    'AIC Incubation Center',
    'AI & Robotics Lab Wing',
  ],
  'Sports & Recreation Complex': [
    'Indoor Stadium',
    'Outdoor Track & Courts',
    'Student Gymnasium',
  ],
  'Cafeteria & Common Areas': [
    'Main Campus Food Court',
    'Green Lawn & Amphitheatre',
    'Student Activity Center',
  ],
  'Transport & Parking Bay': [
    'College Bus Bay',
    'Two-Wheeler Parking Zone',
    'Main Entrance Gatehouse',
  ],
};

export const STATUS_DESCRIPTIONS = {
  Submitted: 'Complaint has been logged in CampusFix AI and queued for initial verification.',
  'Under Review': 'Maintenance coordinator is reviewing the photo, AI assessment, and site details.',
  Assigned: 'Work order has been assigned to the responsible campus maintenance department.',
  'In Progress': 'Technicians are actively working on repairing or resolving the reported issue.',
  Resolved: 'Issue has been fixed, inspected, and closed with resolution notes.',
};

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
