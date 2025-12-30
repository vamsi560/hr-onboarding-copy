// User Configuration - Login Credentials and Eligibility
export const USER_DATABASE = {
  // Candidate with Joining Bonus eligibility
  'john.doe@valuemomentum.com': {
    password: 'password123',
    name: 'John Doe',
    role: 'candidate',
    location: 'india',
    joiningBonus: true,
    relocation: false,
    alumni: false,
    designation: 'Senior Software Engineer',
    department: 'Engineering'
  },
  
  // Candidate with Relocation eligibility
  'jane.smith@valuemomentum.com': {
    password: 'password123',
    name: 'Jane Smith',
    role: 'candidate',
    location: 'us',
    joiningBonus: false,
    relocation: true,
    alumni: false,
    designation: 'Product Manager',
    department: 'Product'
  },
  
  // Candidate with both Joining Bonus and Relocation
  'mike.johnson@valuemomentum.com': {
    password: 'password123',
    name: 'Mike Johnson',
    role: 'candidate',
    location: 'us',
    joiningBonus: true,
    relocation: true,
    alumni: false,
    designation: 'Tech Lead',
    department: 'Engineering'
  },
  
  // Candidate with no special benefits
  'sarah.williams@valuemomentum.com': {
    password: 'password123',
    name: 'Sarah Williams',
    role: 'candidate',
    location: 'india',
    joiningBonus: false,
    relocation: false,
    alumni: false,
    designation: 'Software Engineer',
    department: 'Engineering'
  },
  
  // Alumni - Former employee
  'alumni@valuemomentum.com': {
    password: 'password123',
    name: 'Robert Brown',
    role: 'alumni',
    location: 'india',
    joiningBonus: false,
    relocation: false,
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
    alumni: false,
    designation: 'HR Manager',
    department: 'HR'
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
  alumni: false,
  designation: 'Software Engineer',
  department: 'Sales'
};

export const authenticateUser = (email, password) => {
  const user = USER_DATABASE[email.toLowerCase()];
  if (user && user.password === password) {
    return { ...user, email: email.toLowerCase() };
  }
  return null;
};

