import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import AccessibilityPanel from './components/AccessibilityPanel';

// Import page components
import HomePage from './pages/HomePage';
import CouncillorsPage from './pages/CouncillorsPage';
import EventsPage from './pages/EventsPage';
import MeetingsPage from './pages/MeetingsPage';
import MeetingTypePage from './pages/MeetingTypePage';
import ContactPage from './pages/ContactPage';
import ContentHubPage from './pages/ContentHubPage';
import ContentDetailPage from './pages/ContentDetailPage';

import './App.css';

function App() {
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);

  const toggleAccessibility = () => {
    setIsAccessibilityOpen(!isAccessibilityOpen);
  };

  const closeAccessibility = () => {
    setIsAccessibilityOpen(false);
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* Accessibility Panel */}
        <AccessibilityPanel 
          isOpen={isAccessibilityOpen} 
          onClose={closeAccessibility} 
        />
        
        {/* Header */}
        <Header 
          onAccessibilityToggle={toggleAccessibility}
          isAccessibilityOpen={isAccessibilityOpen}
        />
        
        {/* Main Content */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/councillors" element={<CouncillorsPage />} />
            <Route path="/ktc-events" element={<EventsPage />} />
            <Route path="/ktc-meetings" element={<MeetingsPage />} />
            <Route path="/ktc-meetings/:meetingType" element={<MeetingTypePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/content" element={<ContentHubPage />} />
            <Route path="/:category/:page" element={<ContentDetailPage />} />
          </Routes>
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;

