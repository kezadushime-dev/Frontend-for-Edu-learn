export const uiStore = {
  auth: {
    password: 'password123',
    users: [
      { id: 'u1', name: 'Admin User', email: 'a@io.com', role: 'admin', redirect: '/dashboard-admin' },
      { id: 'u2', name: 'Learner User', email: 'l@io.com', role: 'learner', redirect: '/dashboard-learner' },
      { id: 'u3', name: 'Manager User', email: 'm@io.com', role: 'instructor', displayRole: 'manager', redirect: '/dashboard-manager' }
    ]
  },
  login: {
    hint: 'Use a@io.com, l@io.com, or m@io.com with password123.'
  },
  lesson: {
    eyebrow: 'Lessons (GET /lessons)',
    description: 'Follow the exact course track from the home page and complete lessons in order. Data mirrors the lesson endpoints.'
  },
  quiz: {
    eyebrow: 'Quiz Center (GET /quizzes)',
    description: 'Quizzes follow the same course tracks shown on the home page. Analytics align with /quizzes/analytics.'
  },
  admin: {
    notes: {
      users: 'From /admin/users',
      lessons: 'From /lessons',
      quizzes: 'From /quizzes',
      passRate: 'From /quizzes/analytics'
    },
    actions: [
      { label: 'Role changes pending review', value: '/admin/users/:id/role' },
      { label: 'New user signups today', value: '/auth/register' },
      { label: 'Quiz analytics ready', value: '/quizzes/analytics' }
    ],
    pending: [
      'Approve instructor access for 3 users',
      'Review 5 reported quizzes',
      'Publish 2 draft lessons'
    ],
    tables: {
      users: [
        { id: 'u1', name: 'Admin User', email: 'a@io.com', role: 'admin', isActive: true, createdAt: '2026-02-01' },
        { id: 'u2', name: 'Learner User', email: 'l@io.com', role: 'learner', isActive: true, createdAt: '2026-02-02' },
        { id: 'u3', name: 'Manager User', email: 'm@io.com', role: 'instructor', isActive: true, createdAt: '2026-02-03' }
      ],
      lessons: [
        { id: 'l1', title: 'MySQL Basics', category: 'Database', order: 1, createdBy: 'u3', createdAt: '2026-02-01', updatedAt: '2026-02-03' },
        { id: 'l2', title: 'Python Basics', category: 'Programming', order: 2, createdBy: 'u3', createdAt: '2026-02-02', updatedAt: '2026-02-03' },
        { id: 'l3', title: 'React Basics', category: 'Frontend', order: 3, createdBy: 'u3', createdAt: '2026-02-03', updatedAt: '2026-02-04' }
      ],
      quizzes: [
        { id: 'q1', lesson: 'l1', title: 'MySQL Basics Quiz', passingScore: 70, isActive: true, createdBy: 'u3', createdAt: '2026-02-02' },
        { id: 'q2', lesson: 'l2', title: 'Python Basics Quiz', passingScore: 70, isActive: true, createdBy: 'u3', createdAt: '2026-02-03' },
        { id: 'q3', lesson: 'l3', title: 'React Basics Quiz', passingScore: 70, isActive: false, createdBy: 'u3', createdAt: '2026-02-04' }
      ],
      quizAttempts: [
        { id: 'a1', quiz: 'q1', user: 'u2', score: 8, percentage: 80, passed: true, submittedAt: '2026-02-04' },
        { id: 'a2', quiz: 'q1', user: 'u2', score: 6, percentage: 60, passed: false, submittedAt: '2026-02-05' }
      ]
    }
  },
  manager: {
    performance: [
      { label: 'Cohort A - Web Fundamentals', value: '/admin/users/role/learner' },
      { label: 'Cohort B - Backend APIs', value: '/admin/users/role/learner' },
      { label: 'Cohort C - UI Dashboards', value: '/admin/users/role/learner' }
    ],
    tasks: [
      'Review 4 learner progress reports',
      'Approve 2 cohort enrollments',
      'Schedule monthly cohort check-in'
    ]
  },
  learner: {
    continueLessons: [
      { title: 'Module 1: What is a Database?' },
      { title: 'Module 1: Tables and Rows' },
      { title: 'Module 1: Basic SELECT' }
    ],
    upcomingQuizzes: [
      { module: 'Module 2', title: 'MySQL Safety Quiz' },
      { module: 'Module 3', title: 'MySQL Review Quiz' },
      { module: 'Module 1', title: 'Python Basics Quiz' }
    ]
  },
  statsNotes: {
    lessons: 'From /lessons',
    quizzes: 'From /quizzes',
    analytics: 'From /quizzes/analytics'
  },
  models: {
    users: [
      { key: '_id', label: 'ID' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role' },
      { key: 'isActive', label: 'Active' },
      { key: 'createdAt', label: 'Created' },
      { key: 'updatedAt', label: 'Updated' }
    ],
    lessons: [
      { key: 'title', label: 'Title' },
      { key: 'description', label: 'Description' },
      { key: 'category', label: 'Category' },
      { key: 'order', label: 'Order' },
      { key: 'createdBy', label: 'Created By' },
      { key: 'createdAt', label: 'Created' },
      { key: 'updatedAt', label: 'Updated' }
    ],
    quizzes: [
      { key: 'title', label: 'Title' },
      { key: 'lesson', label: 'Lesson' },
      { key: 'questions', label: 'Questions' },
      { key: 'passingScore', label: 'Passing Score' },
      { key: 'isActive', label: 'Active' },
      { key: 'createdBy', label: 'Created By' },
      { key: 'createdAt', label: 'Created' }
    ],
    questions: [
      { key: 'questionText', label: 'Question' },
      { key: 'options', label: 'Options' },
      { key: 'correctOptionIndex', label: 'Correct Index' },
      { key: 'points', label: 'Points' },
      { key: 'image', label: 'Image' },
      { key: 'optionImages', label: 'Option Images' }
    ],
    quizAttempts: [
      { key: '_id', label: 'ID' },
      { key: 'quiz', label: 'Quiz' },
      { key: 'user', label: 'User' },
      { key: 'answers', label: 'Answers' },
      { key: 'score', label: 'Score' },
      { key: 'percentage', label: 'Percent' },
      { key: 'passed', label: 'Passed' },
      { key: 'submittedAt', label: 'Submitted' }
    ]
  },
  forms: {
    lessonCreate: [
      { key: 'title', label: 'Title', type: 'text', placeholder: 'Lesson title' },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Short summary' },
      { key: 'content', label: 'Content', type: 'textarea', placeholder: 'Lesson content' },
      { key: 'category', label: 'Category', type: 'text', placeholder: 'Database, Programming, Frontend' },
      { key: 'order', label: 'Order', type: 'number', placeholder: '1' },
      { key: 'images', label: 'Images', type: 'file', placeholder: 'Upload images' }
    ],
    quizCreate: [
      { key: 'lesson', label: 'Lesson (lesson id)', type: 'text', placeholder: 'l1' },
      { key: 'title', label: 'Title', type: 'text', placeholder: 'Quiz title' },
      { key: 'passingScore', label: 'Passing Score', type: 'number', placeholder: '70' },
      { key: 'isActive', label: 'Is Active', type: 'select', options: ['true', 'false'] },
      { key: 'createdBy', label: 'Created By (user id)', type: 'text', placeholder: 'u3' }
    ],
    questionCreate: [
      { key: 'questionText', label: 'Question Text', type: 'text', placeholder: 'Question' },
      { key: 'options', label: 'Options (comma-separated)', type: 'text', placeholder: 'A,B,C,D' },
      { key: 'correctOptionIndex', label: 'Correct Option Index', type: 'number', placeholder: '0' },
      { key: 'points', label: 'Points', type: 'number', placeholder: '1' },
      { key: 'image', label: 'Image URL', type: 'text', placeholder: 'https://...' },
      { key: 'optionImages', label: 'Option Images (comma-separated)', type: 'text', placeholder: 'https://...,https://...' }
    ]
  },
  courses: {
    lessons: [
      {
        id: 'web',
        title: 'MySQL Basics',
        modules: [
          {
            name: 'Module 1',
            lessons: [
              {
                title: 'What is a Database?',
                desc: 'Learn what a database is and why we use MySQL.',
                cards: [
                  { title: 'Definition', body: 'A database stores data in tables so it is easy to find.' },
                  { title: 'MySQL', body: 'MySQL is a popular database system.' }
                ]
              },
              {
                title: 'Tables and Rows',
                desc: 'Understand tables, rows, and columns.',
                cards: [
                  { title: 'Table', body: 'A table holds related data.' },
                  { title: 'Row & Column', body: 'Rows are records, columns are fields.' }
                ]
              },
              {
                title: 'Basic SELECT',
                desc: 'Read data from a table with SELECT.',
                cards: [
                  { title: 'SELECT *', body: 'Get all rows from a table.' },
                  { title: 'WHERE', body: 'Filter rows by a condition.' }
                ]
              },
              {
                title: 'Insert Data',
                desc: 'Add new rows with INSERT.',
                cards: [
                  { title: 'INSERT INTO', body: 'Add data to a table.' },
                  { title: 'Values', body: 'Provide values for each column.' }
                ]
              }
            ]
          },
          {
            name: 'Module 2',
            lessons: [
              {
                title: 'Update Data',
                desc: 'Change existing rows with UPDATE.',
                cards: [
                  { title: 'UPDATE', body: 'Modify data in a table.' },
                  { title: 'WHERE', body: 'Choose which rows to update.' }
                ]
              },
              {
                title: 'Delete Data',
                desc: 'Remove rows with DELETE.',
                cards: [
                  { title: 'DELETE', body: 'Remove rows from a table.' },
                  { title: 'Be Careful', body: 'Use WHERE to avoid deleting all rows.' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'backend',
        title: 'Python Basics',
        modules: [
          {
            name: 'Module 1',
            lessons: [
              {
                title: 'Hello Python',
                desc: 'Run your first Python program.',
                cards: [
                  { title: 'print()', body: 'Use print() to show output.' },
                  { title: 'Strings', body: 'Text values are strings.' }
                ]
              },
              {
                title: 'Variables',
                desc: 'Store values in variables.',
                cards: [
                  { title: 'Assignment', body: 'Use = to store a value.' },
                  { title: 'Types', body: 'Numbers, strings, and booleans.' }
                ]
              },
              {
                title: 'If Statements',
                desc: 'Make decisions with if.',
                cards: [
                  { title: 'if', body: 'Run code when condition is true.' },
                  { title: 'else', body: 'Run code when condition is false.' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'dashboard',
        title: 'React Basics',
        modules: [
          {
            name: 'Module 1',
            lessons: [
              {
                title: 'What is React?',
                desc: 'Learn what React is used for.',
                cards: [
                  { title: 'UI Library', body: 'React helps build user interfaces.' },
                  { title: 'Components', body: 'Small reusable UI pieces.' }
                ]
              },
              {
                title: 'JSX',
                desc: 'Write HTML-like syntax in React.',
                cards: [
                  { title: 'JSX', body: 'Looks like HTML but is JavaScript.' },
                  { title: 'Single Root', body: 'Components return one root element.' }
                ]
              }
            ]
          }
        ]
      }
    ],
    quizzes: [
      {
        id: 'web',
        title: 'MySQL Basics',
        quizzes: [
          {
            title: 'MySQL Basics Quiz',
            module: 'Module 1',
            duration: '15 min',
            questions: [
              { q: 'What does MySQL store data in?', options: ['Tables', 'Pictures', 'Emails', 'Folders'], answer: 0 },
              { q: 'Which command reads data?', options: ['SELECT', 'DELETE', 'DROP', 'UPDATE'], answer: 0 },
              { q: 'Which command adds data?', options: ['INSERT', 'REMOVE', 'CLOSE', 'OPEN'], answer: 0 }
            ]
          },
          {
            title: 'MySQL Safety Quiz',
            module: 'Module 2',
            duration: '12 min',
            questions: [
              { q: 'Use WHERE with DELETE to avoid deleting?', options: ['Only one row', 'All rows', 'The table', 'The database'], answer: 1 },
              { q: 'Which command changes existing data?', options: ['UPDATE', 'SELECT', 'SHOW', 'CREATE'], answer: 0 },
              { q: 'Which keyword filters rows?', options: ['WHERE', 'FROM', 'ORDER', 'JOIN'], answer: 0 }
            ]
          },
          {
            title: 'MySQL Review Quiz',
            module: 'Module 3',
            duration: '20 min',
            questions: [
              { q: 'A row in a table is also called a?', options: ['Record', 'Column', 'Index', 'File'], answer: 0 },
              { q: 'Columns are also called?', options: ['Fields', 'Rows', 'Files', 'Lines'], answer: 0 },
              { q: 'Which command removes a row?', options: ['DELETE', 'SELECT', 'SAVE', 'OPEN'], answer: 0 }
            ]
          }
        ]
      },
      {
        id: 'backend',
        title: 'Python Basics',
        quizzes: [
          {
            title: 'Python Basics Quiz',
            module: 'Module 1',
            duration: '14 min',
            questions: [
              { q: 'Which function prints text?', options: ['print()', 'echo()', 'show()', 'write()'], answer: 0 },
              { q: 'Which symbol assigns a value?', options: ['=', '==', '=>', '::'], answer: 0 }
            ]
          },
          {
            title: 'Python Logic Quiz',
            module: 'Module 2',
            duration: '16 min',
            questions: [
              { q: 'Which keyword starts a condition?', options: ['if', 'for', 'def', 'print'], answer: 0 },
              { q: 'Which keyword runs when condition is false?', options: ['else', 'elif', 'true', 'end'], answer: 0 }
            ]
          }
        ]
      },
      {
        id: 'dashboard',
        title: 'React Basics',
        quizzes: [
          {
            title: 'React Basics Quiz',
            module: 'Module 1',
            duration: '10 min',
            questions: [
              { q: 'React is mainly used to build?', options: ['Databases', 'User Interfaces', 'Emails', 'Files'], answer: 1 },
              { q: 'A React piece is called a?', options: ['Component', 'Packet', 'Field', 'Node'], answer: 0 }
            ]
          }
        ]
      }
    ]
  }
};

export const lessonCourses = uiStore.courses.lessons;
export const quizCourses = uiStore.courses.quizzes;
export const users = uiStore.auth.users;
export const authPassword = uiStore.auth.password;
