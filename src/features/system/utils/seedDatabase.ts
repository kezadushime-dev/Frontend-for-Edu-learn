import { api } from './api';
import { sampleLessons, sampleQuizzes } from '../data/seedData';

/**
 * Seed the database with sample lessons and quizzes
 * Run this function from the browser console or create a dedicated page for it
 */
export const seedDatabase = async () => {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Step 1: Create lessons
    console.log('📚 Creating sample lessons...');
    const createdLessons: any[] = [];
    
    for (const lesson of sampleLessons) {
      try {
        const created = await api.lessons.create(lesson as any);
        createdLessons.push(created);
        console.log(`✅ Created lesson: ${lesson.title}`);
      } catch (err) {
        console.error(`❌ Failed to create lesson: ${lesson.title}`, err);
      }
    }
    
    // Step 2: Get all lessons to map titles to IDs
    console.log('🔍 Fetching all lessons...');
    const res = await api.lessons.list();
    const allLessons = res.data.lessons;
    
    // Step 3: Create quizzes
    console.log('📝 Creating sample quizzes...');
    for (const quiz of sampleQuizzes) {
      try {
        // Find the lesson ID by title
        const lesson = allLessons.find((l: any) => 
          l.title.toLowerCase() === quiz.lessonTitle.toLowerCase()
        );
        
        if (!lesson) {
          console.warn(`⚠️ Lesson not found for quiz: ${quiz.title}`);
          continue;
        }
        
        const quizData = {
          lesson: lesson._id || lesson.id,
          title: quiz.title,
          passingScore: quiz.passingScore,
          isActive: quiz.isActive,
          questions: quiz.questions
        };
        
        await api.quizzes.create(quizData);
        console.log(`✅ Created quiz: ${quiz.title}`);
      } catch (err) {
        console.error(`❌ Failed to create quiz: ${quiz.title}`, err);
      }
    }
    
    console.log('🎉 Database seeding completed!');
    console.log(`📊 Summary: ${createdLessons.length} lessons and ${sampleQuizzes.length} quizzes created`);
    
    return {
      success: true,
      lessonsCreated: createdLessons.length,
      quizzesCreated: sampleQuizzes.length
    };
    
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    return {
      success: false,
      error: err
    };
  }
};

// To run this seeding:
// 1. Make sure you're logged in as an instructor/manager
// 2. Open browser console
// 3. Import and run: import { seedDatabase } from './utils/seedDatabase'; seedDatabase();
