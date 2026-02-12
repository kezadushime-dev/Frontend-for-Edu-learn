// Sample seed data for lessons and quizzes
// This can be used to populate the database with initial data

export const sampleLessons = [
  {
    title: "Introduction to JavaScript",
    description: "Learn the fundamentals of JavaScript programming language",
    content: "JavaScript is a versatile programming language used for web development. In this lesson, we'll cover variables, data types, functions, and basic syntax.",
    category: "Programming",
    order: 1,
    createdBy: "John Doe",
    images: []
  },
  {
    title: "HTML & CSS Basics",
    description: "Master the building blocks of web pages",
    content: "HTML provides structure while CSS adds styling. Learn how to create beautiful, responsive web pages from scratch.",
    category: "Web Development",
    order: 2,
    createdBy: "Jane Smith",
    images: []
  },
  {
    title: "React Fundamentals",
    description: "Build modern web applications with React",
    content: "React is a powerful JavaScript library for building user interfaces. Learn components, props, state, and hooks.",
    category: "Frontend",
    order: 3,
    createdBy: "Mike Johnson",
    images: []
  },
  {
    title: "Node.js Backend Development",
    description: "Create server-side applications with Node.js",
    content: "Learn how to build RESTful APIs, handle databases, and create scalable backend services using Node.js and Express.",
    category: "Backend",
    order: 4,
    createdBy: "Sarah Williams",
    images: []
  },
  {
    title: "Database Design with MongoDB",
    description: "Master NoSQL database concepts",
    content: "MongoDB is a flexible NoSQL database. Learn schema design, queries, aggregation, and best practices.",
    category: "Database",
    order: 5,
    createdBy: "David Brown",
    images: []
  }
];

export const sampleQuizzes = [
  {
    title: "JavaScript Basics Quiz",
    lessonTitle: "Introduction to JavaScript",
    passingScore: 70,
    isActive: true,
    questions: [
      {
        questionText: "What is the correct way to declare a variable in JavaScript?",
        options: ["var x = 5;", "variable x = 5;", "int x = 5;", "x := 5;"],
        correctOptionIndex: 0,
        points: 1
      },
      {
        questionText: "Which of the following is NOT a JavaScript data type?",
        options: ["String", "Boolean", "Float", "Undefined"],
        correctOptionIndex: 2,
        points: 1
      },
      {
        questionText: "What does '===' operator do in JavaScript?",
        options: ["Assignment", "Comparison without type checking", "Strict equality comparison", "Not equal"],
        correctOptionIndex: 2,
        points: 1
      }
    ]
  },
  {
    title: "HTML & CSS Assessment",
    lessonTitle: "HTML & CSS Basics",
    passingScore: 75,
    isActive: true,
    questions: [
      {
        questionText: "What does HTML stand for?",
        options: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language"],
        correctOptionIndex: 0,
        points: 1
      },
      {
        questionText: "Which CSS property is used to change text color?",
        options: ["text-color", "font-color", "color", "text-style"],
        correctOptionIndex: 2,
        points: 1
      },
      {
        questionText: "What is the correct HTML element for the largest heading?",
        options: ["<heading>", "<h6>", "<h1>", "<head>"],
        correctOptionIndex: 2,
        points: 1
      },
      {
        questionText: "How do you make text bold in CSS?",
        options: ["font-weight: bold;", "text-style: bold;", "font: bold;", "text-weight: bold;"],
        correctOptionIndex: 0,
        points: 1
      }
    ]
  },
  {
    title: "React Components Quiz",
    lessonTitle: "React Fundamentals",
    passingScore: 70,
    isActive: true,
    questions: [
      {
        questionText: "What is a React component?",
        options: ["A JavaScript function or class", "An HTML element", "A CSS style", "A database table"],
        correctOptionIndex: 0,
        points: 1
      },
      {
        questionText: "Which hook is used for side effects in React?",
        options: ["useState", "useEffect", "useContext", "useReducer"],
        correctOptionIndex: 1,
        points: 1
      },
      {
        questionText: "What is JSX?",
        options: ["A JavaScript extension", "A CSS framework", "A database query language", "A testing library"],
        correctOptionIndex: 0,
        points: 1
      }
    ]
  },
  {
    title: "Node.js Fundamentals Test",
    lessonTitle: "Node.js Backend Development",
    passingScore: 75,
    isActive: true,
    questions: [
      {
        questionText: "What is Node.js?",
        options: ["A JavaScript runtime", "A database", "A frontend framework", "A CSS preprocessor"],
        correctOptionIndex: 0,
        points: 1
      },
      {
        questionText: "Which module is used to create a web server in Node.js?",
        options: ["fs", "http", "path", "url"],
        correctOptionIndex: 1,
        points: 1
      },
      {
        questionText: "What does npm stand for?",
        options: ["Node Package Manager", "New Programming Method", "Network Protocol Manager", "Node Program Module"],
        correctOptionIndex: 0,
        points: 1
      },
      {
        questionText: "Which method is used to read files asynchronously in Node.js?",
        options: ["fs.readFileSync()", "fs.readFile()", "fs.read()", "fs.openFile()"],
        correctOptionIndex: 1,
        points: 1
      }
    ]
  },
  {
    title: "MongoDB Essentials Quiz",
    lessonTitle: "Database Design with MongoDB",
    passingScore: 70,
    isActive: true,
    questions: [
      {
        questionText: "What type of database is MongoDB?",
        options: ["Relational", "NoSQL", "Graph", "Key-Value"],
        correctOptionIndex: 1,
        points: 1
      },
      {
        questionText: "What is a collection in MongoDB?",
        options: ["A group of databases", "A group of documents", "A single record", "A query result"],
        correctOptionIndex: 1,
        points: 1
      },
      {
        questionText: "Which method is used to insert a document in MongoDB?",
        options: ["insertOne()", "add()", "create()", "push()"],
        correctOptionIndex: 0,
        points: 1
      }
    ]
  }
];

// Instructions for using seed data:
// 1. Create lessons first using the POST /lessons endpoint
// 2. Note the lesson IDs returned
// 3. Create quizzes using the POST /quizzes endpoint with the corresponding lesson IDs
// 4. The sample data provides realistic content for testing and demonstration
