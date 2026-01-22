// User Configuration - Login Credentials and Eligibility
export const USER_DATABASE = {
  // Candidate with Joining Bonus eligibility
  'john.doe@gmail.com': {
    password: 'password123',
    name: 'Shashank Tudum',
    role: 'candidate',
    location: 'india',
    joiningBonus: true,
    relocation: false,
    relocationCity: '',
    alumni: false,
    designation: 'Senior Software Engineer',
    department: 'Engineering'
  },
  
  // Candidate with Relocation eligibility
  'jane.smith@outlook.com': {
    password: 'password123',
    name: 'Priya Patel',
    role: 'candidate',
    location: 'us',
    joiningBonus: false,
    relocation: true,
    relocationCity: 'hyderabad',
    alumni: false,
    designation: 'Product Manager',
    department: 'Product'
  },
  
  // Candidate with both Joining Bonus and Relocation
  'mike.johnson@gmail.com': {
    password: 'password123',
    name: 'Vikram Singh',
    role: 'candidate',
    location: 'us',
    joiningBonus: true,
    relocation: true,
    relocationCity: 'pune',
    alumni: false,
    designation: 'Tech Lead',
    department: 'Engineering'
  },
  
  // Candidate with no special benefits
  'sarah.williams@outlook.com': {
    password: 'password123',
    name: 'Anjali Gupta',
    role: 'candidate',
    location: 'india',
    joiningBonus: false,
    relocation: false,
    relocationCity: '',
    alumni: false,
    designation: 'Software Engineer',
    department: 'Engineering'
  },
  
  // Alumni - Former employee
  'alumni@gmail.com': {
    password: 'password123',
    name: 'Suresh Iyer',
    role: 'alumni',
    location: 'india',
    joiningBonus: false,
    relocation: false,
    relocationCity: '',
    alumni: true,
    designation: 'Former Senior Developer',
    department: 'Engineering',
    joinedDate: '2018-01-15',
    leftDate: '2023-06-30',
    yearsWorked: 5.5
  },
  
  // HR Login
  'hr@valuemomentum.com': {
    password: 'password123',
    name: 'Raghavendra Raju',
    role: 'hr',
    location: 'india',
    joiningBonus: false,
    relocation: false,
    relocationCity: '',
    alumni: false,
    designation: 'HR Manager',
    department: 'HR'
  },
  
  // TAG Team Login (Recruitment)
  'tag@valuemomentum.com': {
    password: 'password123',
    name: 'TAG Team',
    role: 'tag',
    location: 'india',
    joiningBonus: false,
    relocation: false,
    relocationCity: '',
    alumni: false,
    designation: 'Recruitment Team',
    department: 'TAG'
  }
};

// Default candidate (for demo mode)
export const DEFAULT_CANDIDATE = {
  email: 'shashank@valuemomentum.com',
  password: 'demo123',
  name: 'Shashank Tudum',
  role: 'candidate',
  location: 'india',
  joiningBonus: false,
  relocation: false,
  relocationCity: '',
  alumni: false,
  designation: 'Software Engineer',
  department: 'Sales'
};

export const authenticateUser = (email, password) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = USER_DATABASE[normalizedEmail];
  
  if (user && user.password === password) {
    return { ...user, email: normalizedEmail };
  }
  
  return null;
};

