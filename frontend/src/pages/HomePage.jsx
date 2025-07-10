import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Clock, ArrowRight, ExternalLink } from 'lucide-react';
import EventModal from '../components/EventModal';
import '../components/EventModal.css';
import '../components/EventCardStyles.css';


const HomePage = () => {
  // State for all CMS data
  const [slides, setSlides] = useState([]);
  const [events, setEvents] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [quickLinks, setQuickLinks] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

// Modal state
const [selectedEventId, setSelectedEventId] = useState(null);
const [isModalOpen, setIsModalOpen] = useState(false);

// ADD THIS LINE:
const API_BASE_URL = 'http://127.0.0.1:8027';

console.log('🔍 API URL:', import.meta.env.VITE_CMS_API_URL );

  // Fetch all homepage data
  useEffect(() => {
    fetchHomepageData();
  }, []);

  const fetchHomepageData = async () => {
    try {
      const [slidesRes, eventsRes, meetingsRes, quickLinksRes] = await Promise.all([
  fetch(`${API_BASE_URL}/api/homepage/slides`),
  fetch(`${API_BASE_URL}/api/homepage/events`),
  fetch(`${API_BASE_URL}/api/homepage/meetings`),
  fetch(`${API_BASE_URL}/api/homepage/quick-links`)
]);


      if (slidesRes.ok) {
        const slidesData = await slidesRes.json();
        setSlides(slidesData);
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData);
      }

      if (meetingsRes.ok) {
        const meetingsData = await meetingsRes.json();
        setMeetings(meetingsData);
      }

      if (quickLinksRes.ok) {
        const quickLinksData = await quickLinksRes.json();
        setQuickLinks(quickLinksData);
      }
    } catch (error) {
      console.error('Error fetching homepage data:', error);
      // Set fallback data for demonstration
      setSlides([{
        id: 1,
        title: 'Welcome to Kesgrave Town Council',
        description: 'Serving our community with transparency, dedication, and commitment to local democracy.',
        action_button_text: 'Learn More',
        action_button_url: '/content',
        featured_image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        is_featured: false
      }]);
      
      setEvents([
        {
          id: 1,
          title: 'Community Clean-Up Day',
          description: 'Join us for our monthly community clean-up event. Help keep Kesgrave beautiful and meet your neighbors.',
          date: '2025-07-15',
          time: '10:00',
          location: 'Kesgrave Recreation Ground',
          categories: ['Community', 'Environment'],
          featured_image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          first_featured_link: '/ktc-events/community-cleanup'
        },
        {
          id: 2,
          title: 'Summer Festival Planning',
          description: 'Planning meeting for the annual Kesgrave Summer Festival. All volunteers welcome.',
          date: '2025-07-20',
          time: '19:00',
          location: 'Community Centre',
          categories: ['Community', 'Seasonal'],
          featured_image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          first_featured_link: '/ktc-events/summer-festival'
        }
      ]);

      setMeetings([
        {
          id: 1,
          type: 'Full Council',
          date: '2025-07-10',
          time: '19:30',
          location: 'Council Chambers'
        },
        {
          id: 2,
          type: 'Planning Committee',
          date: '2025-07-17',
          time: '19:00',
          location: 'Council Chambers'
        }
      ]);

      setQuickLinks([
        {
          id: 1,
          title: 'Report an Issue',
          description: 'Report potholes, street lighting, or other local issues directly to the council.',
          url: '/contact',
          button_text: 'Report Now'
        },
        {
          id: 2,
          title: 'Planning Applications',
          description: 'View current planning applications and submit comments on local developments.',
          url: '/content',
          button_text: 'View Applications'
        },
        {
          id: 3,
          title: 'Council Tax Information',
          description: 'Find information about council tax rates, payments, and support available.',
          url: '/content',
          button_text: 'Learn More'
        },
        {
          id: 4,
          title: 'Local Services',
          description: 'Access information about local services including waste collection and recycling.',
          url: '/content',
          button_text: 'View Services'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

// Modal handlers
const openEventModal = (eventId) => {
  setSelectedEventId(eventId);
  setIsModalOpen(true);
};

const closeEventModal = () => {
  setIsModalOpen(false);
  setSelectedEventId(null);
};

const handleEventClick = (event, eventId) => {
  event.preventDefault();
  openEventModal(eventId);
};


  // Slider navigation
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto-advance slider
  useEffect(() => {
    if (slides.length > 1) {
      const interval = setInterval(nextSlide, 5000);
      return () => clearInterval(interval);
    }
  }, [slides.length]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.slice(0, 5); // HH:MM format
  };

  // Truncate text for event descriptions
  const truncateText = (text, maxLength = 120) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      'community': '#28a745',
      'environment': '#17a2b8',
      'seasonal': '#fd7e14',
      'sports': '#007bff',
      'family': '#6f42c1',
      'charity': '#e83e8c',
      'planning': '#6c757d'
    };
    return colors[category?.toLowerCase()] || '#6c757d';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading homepage...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="homepage">
      {/* SEO Meta Tags */}
      <div style={{ display: 'none' }}>
        <h1>Kesgrave Town Council - Serving Our Community</h1>
        <meta name="description" content="Official website of Kesgrave Town Council. Find information about local meetings, events, councillors, and community services." />
        <meta name="keywords" content="Kesgrave, Town Council, local government, community, meetings, events" />
      </div>

      {/* Slider Section */}
      <section className="slider-section" role="region" aria-label="Featured content and announcements">
        <div className="slider-container">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`slide ${index === currentSlide ? 'active' : ''} ${slide.is_featured ? 'featured' : ''}`}
              style={{
                backgroundImage: slide.featured_image ? `url(${slide.featured_image})` : 'linear-gradient(135deg, #2c5f2d 0%, #97bc62 100%)'
              }}
              role="img"
              aria-label={slide.title}
            >
              <div className="slide-overlay"></div>
              <div className="slide-content">
                {slide.is_featured && (
                  <div className="slide-badge" role="status" aria-label="Featured content">
                    Featured
                  </div>
                )}
                <h2 className="slide-title">{slide.title}</h2>
                {slide.description && (
                  <p className="slide-description">{slide.description}</p>
                )}
                {slide.action_button_text && slide.action_button_url && (
                  <a
                    href={slide.action_button_url}
                    className={`slide-button ${slide.is_featured ? 'featured' : ''}`}
                    aria-label={`${slide.action_button_text} - ${slide.title}`}
                  >
                    {slide.action_button_text}
                    <ArrowRight size={16} className="ml-2 inline" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Controls */}
        {slides.length > 1 && (
          <>
            <button
              className="slider-nav slider-prev"
              onClick={prevSlide}
              aria-label="Previous slide"
              type="button"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              className="slider-nav slider-next"
              onClick={nextSlide}
              aria-label="Next slide"
              type="button"
            >
              <ChevronRight size={24} />
            </button>

            {/* Indicators */}
            <div className="slider-indicators" role="tablist" aria-label="Slide navigation">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  role="tab"
                  aria-selected={index === currentSlide}
                  type="button"
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Main Content Section */}
      <section className="content-section">
        <div className="content-container">
          {/* Events Section */}
          <div className="events-section">
            <div className="section-header">
              <h2>Upcoming Events</h2>
              <p>Stay connected with your community through our upcoming events and activities.</p>
            </div>
            
            {events.length > 0 ? (
              <div className="events-grid">
                {events.slice(0, 6).map((event) => (
                  <article 
  key={event.id} 
  className="event-card" 
  tabIndex="0"
  onClick={(e) => handleEventClick(e, event.id)}
  style={{ cursor: 'pointer' }}
  role="button"
  aria-label={`View details for ${event.title}`}
>
  {event.featured_image && (
    <div
      className="event-image"
      style={{ backgroundImage: `url(${event.featured_image})` }}
      role="img"
      aria-label={`Image for ${event.title}`}
    />
  )}

                    <div className="event-content">
                      <div className="event-meta">
                        <div className="event-date">
                          <Calendar size={16} />
                          {formatDate(event.date)}
                        </div>
                        {event.time && (
                          <div className="event-time">
                            <Clock size={16} />
                            {formatTime(event.time)}
                          </div>
                        )}
                      </div>
                      
                      <h3 className="event-title">
                        {event.first_featured_link ? (
                          <a href={event.first_featured_link} className="event-link">
                            {event.title}
                          </a>
                        ) : (
                          event.title
                        )}
                      </h3>
                      
                      {event.description && (
                        <p className="event-description">
                          {truncateText(event.description)}
                        </p>
                      )}
                      
                      {event.location && (
                        <div className="event-location">
                          <MapPin size={16} />
                          {event.location}
                        </div>
                      )}
                      
                      {event.categories && event.categories.length > 0 && (
  <div className="event-tags" role="list" aria-label="Event categories">
    {event.categories.map((category, index) => (
      <span
        key={index}
        className="event-tag"
        style={{ 
          backgroundColor: category.color || '#6c757d',
          color: 'white'
        }}
        role="listitem"
        title={category.name}
      >
        {category.name}
      </span>
    ))}
  </div>
)}

                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="no-events">
                <p>No upcoming events at this time. Check back soon for new announcements!</p>
              </div>
            )}
            
            <div className="section-footer">
              <a href="/ktc-events" className="view-all-btn">
                View all events
                <ArrowRight size={16} className="ml-2 inline" />
              </a>
            </div>
          </div>

          {/* Meetings Section */}
          <aside className="meetings-section" role="complementary" aria-label="Upcoming meetings">
            <div className="meetings-header">
              <h3>Upcoming Meetings</h3>
              <p>Stay informed about council decisions and participate in local democracy.</p>
            </div>
            
            {meetings.length > 0 ? (
              <div className="meetings-list">
                {meetings.map((meeting) => (
                  <article key={meeting.id} className="meeting-item" tabIndex="0">
                    <h4 className="meeting-type">{meeting.type}</h4>
                    <div className="meeting-details">
                      <div className="meeting-datetime">
                        <Calendar size={16} />
                        <span>{formatDate(meeting.date)}</span>
                      </div>
                      <div className="meeting-time">
                        <Clock size={16} />
                        <span>{formatTime(meeting.time)}</span>
                      </div>
                      {meeting.location && (
                        <div className="meeting-location">
                          <MapPin size={16} />
                          <span>{meeting.location}</span>
                        </div>
                      )}
                    </div>
                    <a 
                      href={`/ktc-meetings/${meeting.type.toLowerCase().replace(/\s+/g, '-')}`}
                      className="meeting-link"
                      aria-label={`View details for ${meeting.type} meeting`}
                    >
                      View Details
                      <ArrowRight size={14} />
                    </a>
                  </article>
                ))}
              </div>
            ) : (
              <div className="no-meetings">
                <p>No upcoming meetings scheduled.</p>
              </div>
            )}
            
            <div className="meetings-footer">
              <a href="/ktc-meetings" className="view-all-meetings-btn">
                View all meetings
                <ArrowRight size={16} className="ml-1 inline" />
              </a>
            </div>
          </aside>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="quick-links-section" role="region" aria-label="Quick access to popular services">
        <div className="quick-links-container">
          <div className="quick-links-header">
            <h2>Quick Links</h2>
            <p>Find what you're looking for quickly with our most popular services and information.</p>
          </div>
          
          {quickLinks.length > 0 ? (
            <div className="quick-links-grid">
              {quickLinks.map((link, index) => (
                <article key={link.id} className={`quick-link-card ${index % 2 === 0 ? 'green-theme' : 'orange-theme'}`}>
                  <h3 className="quick-link-title">{link.title}</h3>
                  <p className="quick-link-description">{link.description}</p>
                  <a
                    href={link.url}
                    className="quick-link-button"
                    target={link.url.startsWith('http') ? '_blank' : '_self'}
                    rel={link.url.startsWith('http') ? 'noopener noreferrer' : ''}
                    aria-label={`${link.button_text || 'Learn More'} about ${link.title}`}
                  >
                    {link.button_text || 'Learn More'}
                    {link.url.startsWith('http') ? (
                      <ExternalLink size={16} className="ml-2 inline" />
                    ) : (
                      <ArrowRight size={16} className="ml-2 inline" />
                    )}
                  </a>
                </article>
              ))}
            </div>
          ) : (
            <div className="no-quick-links">
              <p>Quick links will be available soon.</p>
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        /* Global Styles */
        .homepage {
          min-height: 100vh;
        }

        /* Slider Section */
        .slider-section {
          position: relative;
          height: 500px;
          overflow: hidden;
          background: linear-gradient(135deg, #2c5f2d 0%, #97bc62 100%);
        }

        .slider-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .slide {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 1s ease-in-out;
        }

        .slide.active {
          opacity: 1;
        }

        .slide.featured {
          border-top: 4px solid #dc3545;
        }

        .slide-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.4);
        }

        .slide-content {
          position: relative;
          z-index: 2;
          text-align: center;
          color: white;
          max-width: 700px;
          padding: 40px;
          background: rgba(0, 0, 0, 0.6);
          border-radius: 12px;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .slide-badge {
          background: #dc3545;
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 15px;
          display: inline-block;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .slide-title {
          font-size: 42px;
          font-weight: bold;
          margin-bottom: 20px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
          line-height: 1.2;
        }

        .slide-description {
          font-size: 18px;
          margin-bottom: 30px;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
          line-height: 1.6;
          opacity: 0.95;
        }

        .slide-button {
          background: #ff8c00;
          color: white;
          padding: 15px 30px;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(255, 140, 0, 0.3);
        }

        .slide-button:hover,
        .slide-button:focus {
          background: #e67e00;
          transform: translateY(-2px);
          outline: 2px solid white;
          outline-offset: 2px;
          box-shadow: 0 6px 20px rgba(255, 140, 0, 0.4);
        }

        .slide-button.featured {
          background: #dc3545;
          box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
        }

        .slide-button.featured:hover,
        .slide-button.featured:focus {
          background: #c82333;
          box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
        }

        .slider-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.5);
          border: none;
          color: white;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
        }

        .slider-nav:hover,
        .slider-nav:focus {
          background: rgba(0, 0, 0, 0.8);
          outline: 2px solid white;
          outline-offset: 2px;
          transform: translateY(-50%) scale(1.1);
        }

        .slider-prev {
          left: 20px;
        }

        .slider-next {
          right: 20px;
        }

        .slider-indicators {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
          z-index: 3;
        }

        .indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }

        .indicator.active {
          background: white;
          transform: scale(1.2);
        }

        .indicator:hover,
        .indicator:focus {
          background: rgba(255, 255, 255, 0.8);
          outline: 2px solid white;
          outline-offset: 2px;
        }

        /* Content Section */
        .content-section {
          padding: 60px 20px;
          background-color: #f8f9fa;
        }

        .content-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 40px;
        }

        /* Section Headers */
        .section-header {
          margin-bottom: 30px;
        }

        .section-header h2 {
          color: #2c5f2d;
          font-size: 32px;
          margin-bottom: 10px;
          font-weight: 700;
        }

        .section-header p {
          color: #6c757d;
          font-size: 16px;
          line-height: 1.5;
        }

        /* Events Section */
        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 30px;
        }

        .event-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          cursor: pointer;
          border: 1px solid #e5e7eb;
          position: relative;
        }

        .event-card:hover,
        .event-card:focus {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          outline: 2px solid #2c5f2d;
          outline-offset: 2px;
        }

        .event-image {
          height: 160px;
          background-size: cover;
          background-position: center;
          background-color: #e5e7eb;
        }

        .event-content {
          padding: 20px;
        }

        .event-meta {
          display: flex;
          gap: 15px;
          margin-bottom: 12px;
          font-size: 14px;
          color: #6c757d;
        }

        .event-date,
        .event-time {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .event-title {
          font-size: 18px;
          font-weight: 600;
          color: #2c5f2d;
          margin-bottom: 12px;
          line-height: 1.3;
        }

        .event-link {
          color: inherit;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .event-link:hover,
        .event-link:focus {
          color: #1a4d1b;
          text-decoration: underline;
        }

        .event-description {
          color: #495057;
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 12px;
        }

        .event-location {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6c757d;
          font-size: 14px;
          margin-bottom: 12px;
        }

        .event-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .event-tag {
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          text-transform: capitalize;
        }

        .no-events {
          text-align: center;
          padding: 40px 20px;
          color: #6c757d;
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }

        .section-footer {
          text-align: center;
        }

        .view-all-btn {
          background: #2c5f2d;
          color: white;
          padding: 12px 24px;
          border-radius: 6px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .view-all-btn:hover,
        .view-all-btn:focus {
          background: #1a4d1b;
          transform: translateY(-1px);
          outline: 2px solid #2c5f2d;
          outline-offset: 2px;
        }

        /* Meetings Section */
        .meetings-section {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          height: fit-content;
        }

        .meetings-header {
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f8f9fa;
        }

        .meetings-header h3 {
          color: #2c5f2d;
          font-size: 24px;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .meetings-header p {
          color: #6c757d;
          font-size: 14px;
          line-height: 1.4;
        }

        .meetings-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 25px;
        }

        .meeting-item {
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #2c5f2d;
          transition: all 0.3s ease;
        }

        .meeting-item:hover,
        .meeting-item:focus {
          background: #e9ecef;
          transform: translateX(4px);
          outline: 2px solid #2c5f2d;
          outline-offset: 2px;
        }

        .meeting-type {
          color: #2c5f2d;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .meeting-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 12px;
        }

        .meeting-datetime,
        .meeting-time,
        .meeting-location {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #6c757d;
          font-size: 14px;
        }

        .meeting-link {
          color: #2c5f2d;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: color 0.3s ease;
        }

        .meeting-link:hover,
        .meeting-link:focus {
          color: #1a4d1b;
          text-decoration: underline;
        }

        .no-meetings {
          text-align: center;
          padding: 20px;
          color: #6c757d;
          background: #f8f9fa;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .meetings-footer {
          text-align: center;
          padding-top: 15px;
          border-top: 1px solid #e5e7eb;
        }

        .view-all-meetings-btn {
          color: #2c5f2d;
          text-decoration: none;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: color 0.3s ease;
        }

        .view-all-meetings-btn:hover,
        .view-all-meetings-btn:focus {
          color: #1a4d1b;
          text-decoration: underline;
        }

        /* Quick Links Section */
        .quick-links-section {
          padding: 60px 20px;
          background: white;
        }

        .quick-links-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .quick-links-header {
          text-align: center;
          margin-bottom: 50px;
        }

        .quick-links-header h2 {
          color: #2c5f2d;
          font-size: 32px;
          margin-bottom: 15px;
          font-weight: 700;
        }

        .quick-links-header p {
          color: #6c757d;
          font-size: 18px;
          line-height: 1.6;
          max-width: 600px;
          margin: 0 auto;
        }

        .quick-links-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }

        .quick-link-card {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border: 2px solid transparent;
          position: relative;
        }

        .quick-link-card.green-theme {
          border-color: #2c5f2d;
        }

        .quick-link-card.orange-theme {
          border-color: #ff8c00;
        }

        .quick-link-card:hover,
        .quick-link-card:focus-within {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .quick-link-title {
          color: #2c5f2d;
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 12px;
          line-height: 1.3;
        }

        .quick-link-description {
          color: #495057;
          font-size: 15px;
          line-height: 1.5;
          margin-bottom: 20px;
        }

        .quick-link-button {
          display: inline-flex;
          align-items: center;
          background: #2c5f2d;
          color: white;
          padding: 12px 20px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 500;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .orange-theme .quick-link-button {
          background: #ff8c00;
        }

        .quick-link-button:hover,
        .quick-link-button:focus {
          transform: translateY(-1px);
          outline: 2px solid currentColor;
          outline-offset: 2px;
        }

        .green-theme .quick-link-button:hover,
        .green-theme .quick-link-button:focus {
          background: #1a4d1b;
        }

        .orange-theme .quick-link-button:hover,
        .orange-theme .quick-link-button:focus {
          background: #e67e00;
        }

        .no-quick-links {
          text-align: center;
          padding: 40px 20px;
          color: #6c757d;
          background: #f8f9fa;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .content-container {
            grid-template-columns: 1fr;
            gap: 30px;
          }

          .slide-title {
            font-size: 28px;
          }

          .slide-description {
            font-size: 16px;
          }

          .slide-content {
            padding: 30px 20px;
          }

          .events-grid {
            grid-template-columns: 1fr;
          }

          .quick-links-grid {
            grid-template-columns: 1fr;
          }

          .section-header h2,
          .quick-links-header h2 {
            font-size: 28px;
          }

          .meetings-section {
            padding: 20px;
          }
        }

        @media (max-width: 480px) {
          .slider-section {
            height: 400px;
          }

          .slide-title {
            font-size: 24px;
          }

          .slide-description {
            font-size: 14px;
          }

          .slide-content {
            padding: 20px 15px;
          }

          .content-section,
          .quick-links-section {
            padding: 40px 15px;
          }

          .slider-nav {
            width: 40px;
            height: 40px;
          }

          .slider-prev {
            left: 10px;
          }

          .slider-next {
            right: 10px;
          }
        }

        /* High Contrast Mode Support */
        @media (prefers-contrast: high) {
          .slide-overlay {
            background: rgba(0, 0, 0, 0.7);
          }

          .event-card,
          .meeting-item,
          .quick-link-card {
            border-width: 2px;
          }
        }

        /* Reduced Motion Support */
        @media (prefers-reduced-motion: reduce) {
          .slide,
          .event-card,
          .meeting-item,
          .quick-link-card,
          .slider-nav,
          .indicator {
            transition: none;
          }
        }
      `}</style>

{/* Event Modal */}
      <EventModal
        eventId={selectedEventId}
        isOpen={isModalOpen}
        onClose={closeEventModal}
      />

    </main>
  );
};

export default HomePage;

