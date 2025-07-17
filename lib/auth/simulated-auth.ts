// Simulated user storage
interface SimulatedUser {
  id: string
  email: string
  firstName: string
  lastName: string
  userType: "applicant" | "hirer"
  password: string
}

// Initialize with some test users
const testUsers: SimulatedUser[] = [
  {
    id: '1',
    email: 'applicant@test.com',
    firstName: 'Test',
    lastName: 'Applicant',
    userType: 'applicant',
    password: 'test123'
  },
  {
    id: '2',
    email: 'hirer@test.com',
    firstName: 'Test',
    lastName: 'Hirer',
    userType: 'hirer',
    password: 'test123'
  }
];

let users: SimulatedUser[] = [...testUsers];

// Generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 15)

// Mock authentication functions
export const simulatedAuth = {
  // Sign up a new user
  signUp: async (email: string, password: string, userData: any) => {
    // Check if user already exists
    if (users.find((user) => user.email === email)) {
      return {
        error: { message: "User with this email already exists" },
        data: null,
      }
    }

    // Create new user
    const newUser = {
      id: generateId(),
      email,
      password,
      firstName: userData.first_name,
      lastName: userData.last_name,
      userType: userData.user_type as "applicant" | "hirer",
    }

    users.push(newUser)

    return {
      error: null,
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          user_metadata: {
            first_name: newUser.firstName,
            last_name: newUser.lastName,
            user_type: newUser.userType,
          },
        },
      },
    }
  },

  // Sign in a user
  signIn: async (email: string, password: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = users.find((u) => u.email === email && u.password === password)

    if (!user) {
      return {
        error: { message: "Invalid login credentials" },
        data: null,
      }
    }

    // Mock successful sign in
    return { 
      data: { 
        user: { 
          id: '123',
          email,
          user_metadata: {
            first_name: 'Test',
            last_name: 'User',
            user_type: 'applicant' as const
          }
        }
      },
      error: null
    };
  },

  // Sign in with OAuth (simulated)
  signInWithOAuth: async (provider: string) => {
    return {
      error: null,
      data: { provider },
    }
  },

  // Get current session (simulated)
  getSession: async () => {
    return {
      data: {
        session: {
          user: {
            id: '123',
            email: 'test@example.com',
            user_metadata: {
              first_name: 'Test',
              last_name: 'User',
              user_type: 'applicant' as const
            }
          }
        }
      },
      error: null
    };
  },

  // Sign out
  signOut: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { error: null };
  },

  resetPassword: async (email: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { error: null };
  },

  updatePassword: async (password: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { error: null };
  },
}

// Simulated database operations
export const simulatedDb = {
  // Insert data into a "table"
  insert: async (table: string, data: any[]) => {
    return {
      error: null,
      data,
    }
  },

  // Select data from a "table"
  select: async (table: string, condition: any) => {
    // This is a simplified simulation
    return {
      error: null,
      data: [{ id: generateId(), ...condition }],
    }
  },

  // Update data in a "table"
  update: async (table: string, data: any) => {
    return {
      error: null,
      data,
    }
  },
}
