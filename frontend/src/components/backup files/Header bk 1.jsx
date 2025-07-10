import { useState } from 'react';
import { Menu, X, Phone, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = ({ onAccessibilityToggle, isAccessibilityOpen }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { name: 'Home', href: '/' },
    { name: 'Councillors', href: '/councillors' },
    { name: 'Information', href: '/content' },
    { name: 'Meetings', href: '/ktc-meetings' },
    { name: 'Things to Do', href: '/ktc-events' },
    { name: 'Contact', href: '/contact' }
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Bar */}
      <div className="ktc-header text-white py-2 px-4 text-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4" />
            <span>01473 625179</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onAccessibilityToggle}
              className="hover:underline focus:outline-none focus:underline"
              aria-label="Toggle accessibility options"
            >
              Accessibility
            </button>
            <a 
              href="/admin" 
              className="hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Admin Login
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="ktc-header-light text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="bg-white text-gray-800 px-3 py-2 rounded-lg font-bold text-lg">
                KTC
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Kesgrave Town Council</h1>
                <p className="text-sm md:text-base opacity-90">Serving our community</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigationItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-white hover:text-gray-200 transition-colors duration-200 font-medium"
                >
                  {item.name}
                </a>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={onAccessibilityToggle}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Toggle accessibility options"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Toggle mobile menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-menu-overlay open"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="p-4">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="bg-white text-gray-800 px-2 py-1 rounded font-bold">
                KTC
              </div>
              <div>
                <h2 className="text-lg font-bold">Kesgrave Town Council</h2>
                <p className="text-sm opacity-90">Serving our community</p>
              </div>
            </div>
            <button
              onClick={closeMobileMenu}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close mobile menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="space-y-4">
            {navigationItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={closeMobileMenu}
                className="block py-3 px-4 text-lg font-medium hover:bg-white/10 rounded-lg transition-colors"
              >
                {item.name}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Header;

