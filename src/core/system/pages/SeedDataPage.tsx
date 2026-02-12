import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PrimaryNav, TopBar } from '../../../core/layout/LayoutPieces';
import { Sidebar } from '../../../core/layout/Sidebars';
import { seedDatabase } from '../utils/seedDatabase';

export default function SeedData() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSeed = async () => {
    if (!window.confirm('This will create sample lessons and quizzes. Continue?')) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await seedDatabase();
      setResult(res);
    } catch (err) {
      setResult({ success: false, error: 'Seeding failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f5f8ff] text-slate-800">
      <TopBar animated={false} />
      <PrimaryNav
        variant="dashboard"
        items={[
          { label: 'Dashboard', to: '/dashboard-manager' },
          { label: 'Seed Data', to: '/seed-data', className: 'text-primary font-semibold' }
        ]}
      />

      <section className="max-w-7xl mx-auto px-6 pt-32 pb-10 grid lg:grid-cols-[260px_1fr] gap-8">
        <Sidebar
          title="Manager"
          links={[
            { label: 'Overview', to: '/dashboard-manager' },
            { label: 'Manage Lessons', to: '/instructor/lessons' },
            { label: 'Create Lesson', to: '/instructor/lesson-create' },
            { label: 'Manage Quizzes', to: '/instructor/quizzes' },
            { label: 'Create Quiz', to: '/instructor/quiz-create' },
            { label: 'Seed Data', active: true },
            { label: 'Logout', to: '/login' }
          ]}
        />

        <div>
          <div className="mb-6">
            <p className="text-primary uppercase font-semibold tracking-wider">Database Management</p>
            <h1 className="text-3xl font-extrabold">Seed Sample Data</h1>
            <p className="text-gray-600 mt-2">Populate the database with sample lessons and quizzes for testing</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-3">What will be created:</h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">âœ“</span>
                  <span><strong>5 Sample Lessons:</strong> JavaScript, HTML/CSS, React, Node.js, MongoDB</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">âœ“</span>
                  <span><strong>5 Sample Quizzes:</strong> Each with 3-4 questions covering the lesson topics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">â„¹</span>
                  <span>All lessons include realistic content, categories, and metadata</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">â„¹</span>
                  <span>Quizzes are automatically linked to their corresponding lessons</span>
                </li>
              </ul>
            </div>

            <div className="border-t pt-6">
              <button
                onClick={handleSeed}
                disabled={loading}
                className="bg-primary text-white px-6 py-3 rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition"
              >
                {loading ? 'ðŸŒ± Seeding Database...' : 'ðŸš€ Start Seeding'}
              </button>
            </div>

            {result && (
              <div className={`mt-6 p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                {result.success ? (
                  <div>
                    <h3 className="text-green-800 font-bold mb-2">âœ… Seeding Completed Successfully!</h3>
                    <p className="text-green-700">
                      Created {result.lessonsCreated} lessons and {result.quizzesCreated} quizzes.
                    </p>
                    <div className="mt-4 flex gap-3">
                      <Link to="/instructor/lessons" className="text-green-700 underline font-semibold">
                        View Lessons
                      </Link>
                      <Link to="/instructor/quizzes" className="text-green-700 underline font-semibold">
                        View Quizzes
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-red-800 font-bold mb-2">âŒ Seeding Failed</h3>
                    <p className="text-red-700">
                      {result.error?.toString() || 'An error occurred during seeding'}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="text-yellow-800 font-bold mb-2">âš ï¸ Important Notes:</h3>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>â€¢ Make sure you're logged in as an instructor or manager</li>
                <li>â€¢ This will create new data, not replace existing data</li>
                <li>â€¢ You can run this multiple times, but it will create duplicates</li>
                <li>â€¢ Check the browser console for detailed seeding logs</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


