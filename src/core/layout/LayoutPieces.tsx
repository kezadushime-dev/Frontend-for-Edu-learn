import { Link } from 'react-router-dom';

type NavItem = {
  label: string;
  to: string;
  className?: string;
};

type PrimaryNavProps = {
  variant: 'public' | 'dashboard' | 'admin';
  items?: NavItem[];
};

export function PrimaryNav({ variant, items }: PrimaryNavProps) {
  if (variant === 'admin') {
    return (
      <nav className="fixed top-[40px] left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i data-lucide="book-open" className="h-6 w-6 text-primary"></i>
            <span className="text-xl font-bold text-primary">Admin</span>
          </div>
          <div className="flex gap-4 text-sm">
            {(items || []).map((item) => (
              <Link key={item.label} to={item.to} className={item.className || 'text-gray-600 hover:text-primary'}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    );
  }

  if (variant === 'dashboard') {
    return (
      <nav className="fixed top-[40px] left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <i data-lucide="book-open" className="h-8 w-8 text-primary"></i>
              <span className="text-2xl font-bold text-primary">Edu Learn</span>
            </div>
            <div className="flex items-center gap-3">
              {(items || []).map((item) => (
                <Link key={item.label} to={item.to} className={item.className || 'text-gray-700 hover:text-primary transition-colors font-medium'}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-[40px] left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <i data-lucide="book-open" className="h-8 w-8 text-primary"></i>
              <span className="text-2xl font-bold text-primary">Edu Learn</span>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <a href="#home" className="text-gray-700 hover:text-primary transition-colors font-medium">Home</a>
              <a href="#about" className="text-gray-700 hover:text-primary transition-colors font-medium">About</a>
              <a href="#courses" className="text-gray-700 hover:text-primary transition-colors font-medium">Courses</a>
              <a href="#contact" className="text-gray-700 hover:text-primary transition-colors font-medium">Contact</a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/signup"
              className="bg-primary text-white px-5 py-2 rounded-md font-semibold shadow-lg hover:bg-blue-700 transition-all duration-300 hover-lift"
            >
              Sign Up
            </Link>
            <Link
              to="/login"
              className="border-2 border-primary text-primary px-5 py-2 rounded-md font-semibold hover:bg-primary hover:text-white transition-all duration-300 hover-lift"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export function TopBar({ animated = true }: { animated?: boolean }) {
  return (
    <div className={`fixed top-0 left-0 right-0 z-50 bg-dark text-white text-sm ${animated ? 'animate-slideInLeft' : ''}`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-2">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2 hover:text-primary transition">
            <i data-lucide="mail" className="w-4 h-4"></i> info@edulearn.com
          </span>
          <span className="flex items-center gap-2 hover:text-primary transition">
            <i data-lucide="phone" className="w-4 h-4"></i> 0734564463
          </span>
        </div>
        <div className="flex gap-4">
          <i data-lucide="facebook" className="w-4 h-4 hover:text-primary cursor-pointer transition transform hover:scale-110"></i>
          <i data-lucide="twitter" className="w-4 h-4 hover:text-primary cursor-pointer transition transform hover:scale-110"></i>
          <i data-lucide="linkedin" className="w-4 h-4 hover:text-primary cursor-pointer transition transform hover:scale-110"></i>
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-dark text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="animate-fadeInUp">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <i data-lucide="book-open" className="w-5 h-5 text-white"></i>
              </div>
              <h3 className="text-white text-2xl font-bold">EduLearn</h3>
            </div>
            <p className="mb-6">
              Empowering learners worldwide with interactive digital education. Transform your skills with our comprehensive learning platform.
            </p>
            <div className="flex gap-4">
              <i data-lucide="facebook" className="w-5 h-5 hover:text-primary cursor-pointer transition transform hover:scale-110"></i>
              <i data-lucide="twitter" className="w-5 h-5 hover:text-primary cursor-pointer transition transform hover:scale-110"></i>
              <i data-lucide="linkedin" className="w-5 h-5 hover:text-primary cursor-pointer transition transform hover:scale-110"></i>
              <i data-lucide="instagram" className="w-5 h-5 hover:text-primary cursor-pointer transition transform hover:scale-110"></i>
            </div>
          </div>

          <div className="animate-fadeInUp" style={{ animationDelay: '.2s' }}>
            <h4 className="text-white font-semibold mb-6">Learning</h4>
            <ul className="space-y-3">
              <li className="hover:text-primary cursor-pointer transition">
                <a href="/#courses">Courses</a>
              </li>
              <li className="hover:text-primary cursor-pointer transition">
                <Link to="/lesson">Lessons</Link>
              </li>
              <li className="hover:text-primary cursor-pointer transition">
                <Link to="/quiz">Quizzes</Link>
              </li>
              <li className="hover:text-primary cursor-pointer transition">
                <a href="/#services">Progress Tracking</a>
              </li>
              <li className="hover:text-primary cursor-pointer transition">
                <a href="/#about">Certificates</a>
              </li>
            </ul>
          </div>

          <div className="animate-fadeInUp" style={{ animationDelay: '.4s' }}>
            <h4 className="text-white font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li className="hover:text-primary cursor-pointer transition">
                <a href="/#about">About Us</a>
              </li>
              <li className="hover:text-primary cursor-pointer transition">
                <a href="/#contact">Contact</a>
              </li>
              <li className="hover:text-primary cursor-pointer transition">
                <Link to="/signup">Create Account</Link>
              </li>
              <li className="hover:text-primary cursor-pointer transition">
                <Link to="/login">Login</Link>
              </li>
            </ul>
          </div>

          <div className="animate-fadeInUp" style={{ animationDelay: '.6s' }}>
            <h4 className="text-white font-semibold mb-6">Contact Info</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3 hover:text-primary transition">
                <i data-lucide="map-pin" className="w-4 h-4 text-primary"></i>
                <span>123 Education St, Learning City, LC 12345</span>
              </div>
              <div className="flex items-center gap-3 hover:text-primary transition">
                <i data-lucide="phone" className="w-4 h-4 text-primary"></i>
                <span>+1-800-EDU-LEARN</span>
              </div>
              <div className="flex items-center gap-3 hover:text-primary transition">
                <i data-lucide="mail" className="w-4 h-4 text-primary"></i>
                <span>info@edulearn.com</span>
              </div>
            </div>

            <div className="mt-6">
              <h5 className="text-white font-semibold mb-3">Newsletter</h5>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-md focus:outline-none focus:border-primary transition"
                />
                <button className="bg-primary px-4 py-2 rounded-r-md hover:bg-blue-700 transition transform hover:scale-105">
                  ?
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">© 2026 EduLearn. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <span className="hover:text-primary cursor-pointer transition">Privacy Policy</span>
            <span className="hover:text-primary cursor-pointer transition">Terms of Service</span>
            <span className="hover:text-primary cursor-pointer transition">Cookie Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
