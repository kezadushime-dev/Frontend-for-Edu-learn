import { Link } from 'react-router-dom';
import { Footer, PrimaryNav, TopBar } from '../components/LayoutPieces';
<<<<<<< HEAD
import { lessonCourses, quizCourses } from '../data/uiStore';

const iconMap: Record<string, string> = {
  web: 'code-2',
  backend: 'database',
  dashboard: 'layout-dashboard'
};

const levelMap: Record<string, string> = {
  web: 'Beginner',
  backend: 'Intermediate',
  dashboard: 'Advanced'
};

const countLessons = (course: (typeof lessonCourses)[number]) =>
  course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0);

const countQuizzes = (courseId: string) => {
  const course = quizCourses.find((item) => item.id === courseId);
  return course ? course.quizzes.length : 0;
};
=======

>>>>>>> admin

export default function Home() {
  return (
    <div className="bg-white text-slate-800">
      <TopBar />
      <PrimaryNav variant="public" />

      <section id="home" className="relative h-[650px] flex items-center overflow-hidden pt-24">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f')" }}
        ></div>
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-white">
          <p className="uppercase tracking-widest text-sm mb-4 text-blue-200 animate-fadeInUp">
            <span className="inline-flex items-center gap-3 glass-effect px-5 py-2 rounded-md hover-glow">
              DIGITAL LEARNING PLATFORM
            </span>
          </p>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 animate-slideInLeft gradient-text">
            Transform Learning <br /> with Interactive Education
          </h1>
          <p className="max-w-xl text-lightText mb-8 animate-slideInRight">
            Experience micro-lessons, interactive quizzes, and track your progress with our comprehensive digital learning platform designed for modern education.
          </p>
          <div className="flex gap-4 animate-fadeInUp">
            <Link
              to="/login"
              className="bg-primary px-7 py-3 rounded-md font-semibold shadow-lg hover:bg-blue-700 transition-all duration-300 hover-lift animate-glow"
            >
              Start Learning
            </Link>
          </div>
        </div>
      </section>

      <section id="services" className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center mb-14 animate-fadeInUp">
            <div>
              <p className="text-primary uppercase font-semibold tracking-wider">What We Offer</p>
              <h2 className="text-4xl font-extrabold mt-3 gradient-text">Comprehensive Learning Solutions</h2>
            </div>
            <a
              href="#courses"
              className="bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-all duration-300 hover-lift"
            >
              View Courses
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="p-10 bg-white shadow-lg rounded-xl hover:shadow-2xl transition-all duration-500 hover-lift group glass-effect border border-gray-100 animate-scaleIn">
              <div className="w-16 h-16 bg-blue-100 text-primary rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300 animate-glow">
                <i data-lucide="book-open" className="w-6 h-6"></i>
              </div>
              <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-all duration-300">Interactive Lessons</h3>
              <p className="text-gray-600 group-hover:text-gray-700 transition-all duration-300">
                Engage with micro-lessons containing text, images, and videos designed for effective learning and knowledge retention.
              </p>
            </div>

            <div
              className="p-10 bg-white shadow-lg rounded-xl hover:shadow-2xl transition-all duration-500 hover-lift group glass-effect border border-gray-100 animate-scaleIn"
              style={{ animationDelay: '.2s' }}
            >
              <div className="w-16 h-16 bg-blue-100 text-primary rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300 animate-glow">
                <i data-lucide="award" className="w-6 h-6"></i>
              </div>
              <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-all duration-300">Smart Assessments</h3>
              <p className="text-gray-600 group-hover:text-gray-700 transition-all duration-300">
                Take quizzes linked to lessons with intelligent scoring logic and instant feedback to track your understanding.
              </p>
            </div>

            <div
              className="p-10 bg-white shadow-lg rounded-xl hover:shadow-2xl transition-all duration-500 hover-lift group glass-effect border border-gray-100 animate-scaleIn"
              style={{ animationDelay: '.4s' }}
            >
              <div className="w-16 h-16 bg-blue-100 text-primary rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300 animate-glow">
                <i data-lucide="users" className="w-6 h-6"></i>
              </div>
              <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-all duration-300">Progress Tracking</h3>
              <p className="text-gray-600 group-hover:text-gray-700 transition-all duration-300">
                Monitor your learning journey with comprehensive dashboards showing completion rates and performance analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-24 bg-[#f5f8ff]">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="relative animate-slideInLeft">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
              className="rounded-lg shadow-xl transition-transform duration-300 hover:scale-105"
              alt="Students learning"
            />
            <div className="absolute -bottom-10 left-40 w-40 h-40 bg-white rounded-lg shadow-xl flex items-center justify-center group hover:bg-primary transition">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl group-hover:bg-white group-hover:text-primary transition">
                <i data-lucide="play" className="w-5 h-5"></i>
              </div>
            </div>
          </div>

          <div className="animate-slideInRight">
            <p className="text-primary font-semibold uppercase">About EduLearn</p>
            <h2 className="text-4xl font-extrabold mt-3 mb-6 leading-tight">
              We Deliver Interactive Digital Learning Experiences
            </h2>
            <p className="text-gray-600 mb-8">
              Our platform provides micro-lessons, interactive quizzes, and comprehensive progress tracking to enhance learning efficiency and engagement for modern education.
            </p>
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 bg-blue-100 text-primary rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-white transition">
                  <i data-lucide="check-circle" className="w-5 h-5"></i>
                </div>
                <div>
                  <h4 className="font-bold">Quality Content</h4>
                  <p className="text-sm text-gray-600">Expert-crafted lessons and assessments</p>
                </div>
              </div>
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 bg-blue-100 text-primary rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-white transition">
                  <i data-lucide="clock" className="w-5 h-5"></i>
                </div>
                <div>
                  <h4 className="font-bold">24/7 Access</h4>
                  <p className="text-sm text-gray-600">Learn anytime, anywhere at your pace</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="#courses"
                className="bg-primary text-white px-8 py-3 rounded-md font-semibold hover:bg-blue-700 transition transform hover:scale-105"
              >
                Explore Courses
              </a>
              <div className="flex items-center gap-3">
                <img src="https://randomuser.me/api/portraits/women/32.jpg" className="w-12 h-12 rounded-full" alt="Founder" />
                <div>
                  <p className="font-bold">Sarah Johnson</p>
                  <p className="text-sm text-gray-500">Education Director</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="courses" className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14 animate-fadeInUp">
            <div>
              <p className="text-primary uppercase font-semibold tracking-wider">Courses</p>
              <h2 className="text-4xl font-extrabold mt-3 gradient-text">Explore Popular Courses</h2>
              <p className="text-gray-600 mt-3 max-w-2xl">
                Choose a learning track and start with bite-sized lessons, hands-on quizzes, and progress tracking.
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                to="/login"
                className="bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-all duration-300 hover-lift"
              >
                Browse All
              </Link>
              <a
                href="#contact"
                className="border-2 border-primary text-primary px-6 py-3 rounded-md font-semibold hover:bg-primary hover:text-white transition-all duration-300 hover-lift"
              >
                Ask About a Course
              </a>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
<<<<<<< HEAD
            {lessonCourses.map((course, idx) => {
              const icon = iconMap[course.id] || 'book-open';
              const level = levelMap[course.id] || 'Beginner';
              const lessonsCount = countLessons(course);
              const quizzesCount = countQuizzes(course.id);

              return (
                <Link
                  key={course.id}
                  to="/login"
                  className="block p-10 bg-white shadow-lg rounded-xl hover:shadow-2xl transition-all duration-500 hover-lift group glass-effect border border-gray-100 animate-scaleIn"
                  style={idx > 0 ? { animationDelay: `${idx * 0.15}s` } : undefined}
                >
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="w-16 h-16 bg-blue-100 text-primary rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 animate-glow">
                      <i data-lucide={icon} className="w-6 h-6"></i>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-primary bg-blue-50 px-3 py-1 rounded-full">
                      {level}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-all duration-300">{course.title}</h3>
                  <p className="text-gray-600 group-hover:text-gray-700 transition-all duration-300 mb-6">
                    Start this track with lessons and quizzes aligned to the {course.title} curriculum.
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-2">
                      <i data-lucide="clock" className="w-4 h-4 text-primary"></i> Self paced
                    </span>
                    <span className="flex items-center gap-2">
                      <i data-lucide="bar-chart-3" className="w-4 h-4 text-primary"></i> {lessonsCount} lessons
                    </span>
                    <span className="flex items-center gap-2">
                      <i data-lucide="sparkles" className="w-4 h-4 text-primary"></i> {quizzesCount} quizzes
                    </span>
                  </div>
                  <div className="mt-8 flex items-center justify-between">
                    <span className="font-semibold text-dark">Start course</span>
                    <span className="inline-flex items-center gap-2 text-primary font-semibold">
                      Open <i data-lucide="arrow-right" className="w-4 h-4"></i>
                    </span>
                  </div>
                </Link>
              );
            })}
=======
            <div className="p-10 bg-white shadow-lg rounded-xl hover:shadow-2xl transition-all duration-500 hover-lift group glass-effect border border-gray-100 animate-scaleIn">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-100 text-primary rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 animate-glow">
                  <i data-lucide="book-open" className="w-6 h-6"></i>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary bg-blue-50 px-3 py-1 rounded-full">
                  Beginner
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-all duration-300">Get Started</h3>
              <p className="text-gray-600 group-hover:text-gray-700 transition-all duration-300 mb-6">
                Start learning with interactive lessons and quizzes.
              </p>
              <div className="mt-8 flex items-center justify-between">
                <Link to="/login" className="font-semibold text-dark">Start course</Link>
                <span className="inline-flex items-center gap-2 text-primary font-semibold">
                  Open <i data-lucide="arrow-right" className="w-4 h-4"></i>
                </span>
              </div>
            </div>
>>>>>>> admin
          </div>

          <div className="mt-14 grid md:grid-cols-3 gap-6 animate-fadeInUp">
            <div className="bg-[#f5f8ff] border border-blue-100 rounded-xl p-8 hover-lift">
              <p className="text-sm uppercase tracking-widest text-primary font-semibold">Included</p>
              <h4 className="text-xl font-bold mt-2">Lessons + Quizzes</h4>
              <p className="text-gray-600 mt-2">Every course comes with guided lessons and checkpoints to measure progress.</p>
            </div>
            <div className="bg-[#f5f8ff] border border-blue-100 rounded-xl p-8 hover-lift">
              <p className="text-sm uppercase tracking-widest text-primary font-semibold">Outcome</p>
              <h4 className="text-xl font-bold mt-2">Track Progress</h4>
              <p className="text-gray-600 mt-2">Dashboards show completion, pass rate, and next steps to keep you moving.</p>
            </div>
            <div className="bg-[#f5f8ff] border border-blue-100 rounded-xl p-8 hover-lift">
              <p className="text-sm uppercase tracking-widest text-primary font-semibold">Support</p>
              <h4 className="text-xl font-bold mt-2">Guided Learning</h4>
              <p className="text-gray-600 mt-2">Structured tracks and clear milestones to avoid confusion and keep momentum.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-6 md:px-20">
          <div className="grid grid-cols-1 gap-0 shadow-2xl rounded-xl overflow-hidden">
            <div className="bg-primary p-10 md:p-16 text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-4 bg-white/20 rounded-full relative flex items-center px-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-xs font-bold tracking-widest uppercase">Talk To Us</span>
              </div>
              <h2 className="text-4xl font-bold mb-10">How May We Help You Learn!</h2>

              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Your Name*</label>
                  <input type="text" placeholder="John Doe" className="p-4 text-gray-800 rounded-sm focus:outline-none focus:ring-2 focus:ring-white/50" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Your Email*</label>
                  <input type="email" placeholder="info@edulearn.com" className="p-4 text-gray-800 rounded-sm focus:outline-none focus:ring-2 focus:ring-white/50" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Subject*</label>
                  <input type="text" placeholder="Course Inquiry" className="p-4 text-gray-800 rounded-sm focus:outline-none focus:ring-2 focus:ring-white/50" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Your Phone*</label>
                  <input type="text" placeholder="+1-800-EDU-LEARN" className="p-4 text-gray-800 rounded-sm focus:outline-none focus:ring-2 focus:ring-white/50" />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-semibold">Message*</label>
                  <textarea rows={4} placeholder="Tell us about your learning goals..." className="p-4 text-gray-800 rounded-sm focus:outline-none focus:ring-2 focus:ring-white/50"></textarea>
                </div>
                <button className="md:col-span-2 bg-dark hover:bg-white hover:text-primary transition-all font-bold py-4 uppercase tracking-widest mt-4 transform hover:scale-105">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-6 text-center animate-scaleIn">
          <h2 className="text-4xl font-bold mb-6 gradient-text">Ready to Start Your Learning Journey?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are advancing their skills with our interactive digital learning platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login" className="bg-white text-primary px-8 py-4 rounded-md font-semibold hover:bg-gray-100 transition-all duration-300 hover-lift">
              Start Learning
            </Link>
            <a
              href="#courses"
              className="border-2 border-white text-white px-8 py-4 rounded-md font-semibold hover:bg-white hover:text-primary transition-all duration-300 hover-lift glass-effect"
            >
              View Courses
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
