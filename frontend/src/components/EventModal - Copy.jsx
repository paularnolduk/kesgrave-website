import { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, User, Phone, Mail, ExternalLink, Download, Users, DollarSign, Star } from 'lucide-react';

const EventModal = ({ eventId, isOpen, onClose }) => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://127.0.0.1:8027';

  // Fetch full event details when modal opens
  useEffect(() => {
    if (isOpen && eventId) {
      fetchEventDetails();
    }
  }, [isOpen, eventId]);

  const fetchEventDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`);
      if (response.ok) {
        const eventData = await response.json();
        setEvent(eventData);
      } else {
        setError('Failed to load event details');
      }
    } catch (err) {
      setError('Error loading event details');
      console.error('Error fetching event:', err);
    } finally {
      setLoading(false);
    }
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Format date and time - FIXED VERSION
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    
    try {
      const date = new Date(dateTimeString);
      
      // Check if it's an all-day event (time is 00:00)
      if (date.getHours() === 0 && date.getMinutes() === 0) {
        return 'All Day';
      }
      
      // Format time in 24-hour format (HH:MM)
      return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="event-modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
    >
      <div className="event-modal-container">
        <div className="event-modal-content">
          {/* Close Button */}
          <button
            className="event-modal-close"
            onClick={onClose}
            aria-label="Close event details"
            type="button"
          >
            <X size={24} />
          </button>

          {loading && (
            <div className="event-modal-loading">
              <div className="loading-spinner"></div>
              <p>Loading event details...</p>
            </div>
          )}

          {error && (
            <div className="event-modal-error">
              <p>Sorry, we couldn't load the event details. Please try again.</p>
              <button onClick={fetchEventDetails} className="retry-button">
                Retry
              </button>
            </div>
          )}

          {event && (
            <>
              {/* Header Section with Image */}
              <div className="event-modal-header">
                {event.featured_image && (
                  <div 
                    className="event-modal-image"
                    style={{ backgroundImage: `url(${event.featured_image})` }}
                    role="img"
                    aria-label={`Image for ${event.title}`}
                  />
                )}
                <div className="event-modal-overlay">
                  <div className="event-modal-header-content">
                    {/* Event Categories */}
                    {event.categories && event.categories.length > 0 && (
                      <div className="event-modal-tags">
                        {event.categories.map((category, index) => (
                          <span
                            key={index}
                            className="event-modal-tag"
                            style={{ 
                              backgroundColor: category.color || '#6c757d',
                              color: 'white'
                            }}
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Event Title */}
                    <h1 id="event-modal-title" className="event-modal-title">
                      {event.title}
                    </h1>
                    
                    {/* Date and Time - FIXED */}
                    <div className="event-modal-datetime">
                      <div className="datetime-item">
                        <Calendar size={20} />
                        <span>{formatDate(event.start_date)}</span>
                      </div>
                      {event.start_date && (
                        <div className="datetime-item">
                          <Clock size={20} />
                          <span>{formatTime(event.start_date)}</span>
                          {event.end_date && event.end_date !== event.start_date && (
                            <span> - {formatTime(event.end_date)}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Featured Badge */}
                    {event.featured && (
                      <div className="event-modal-featured-badge">
                        <Star size={16} />
                        Featured Event
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="event-modal-body">
                {/* Description */}
                {event.description && (
                  <section className="event-modal-section">
                    <h2>About This Event</h2>
                    <div className="event-description">
                      {event.description.split('\n').map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </section>
                )}

                {/* Event Details Grid */}
                <div className="event-details-grid">
                  {/* Location */}
                  {event.location_name && (
                    <section className="event-detail-card">
                      <h3>
                        <MapPin size={20} />
                        Location
                      </h3>
                      <p className="detail-primary">{event.location_name}</p>
                      {event.location_address && (
                        <p className="detail-secondary">{event.location_address}</p>
                      )}
                      {event.location_url && (
                        <a 
                          href={event.location_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="detail-link"
                        >
                          View on Map <ExternalLink size={14} />
                        </a>
                      )}
                    </section>
                  )}

                  {/* Contact Information */}
                  {(event.contact_name || event.contact_email || event.contact_phone) && (
                    <section className="event-detail-card">
                      <h3>
                        <User size={20} />
                        Contact
                      </h3>
                      {event.contact_name && (
                        <p className="detail-primary">{event.contact_name}</p>
                      )}
                      {event.contact_email && (
                        <a href={`mailto:${event.contact_email}`} className="detail-link">
                          <Mail size={16} />
                          {event.contact_email}
                        </a>
                      )}
                      {event.contact_phone && (
                        <a href={`tel:${event.contact_phone}`} className="detail-link">
                          <Phone size={16} />
                          {event.contact_phone}
                        </a>
                      )}
                    </section>
                  )}

                  {/* Booking Information */}
                  {(event.booking_required || event.max_attendees || !event.is_free) && (
                    <section className="event-detail-card">
                      <h3>
                        <Users size={20} />
                        Booking & Pricing
                      </h3>
                      
                      {event.is_free ? (
                        <p className="detail-primary free-event">Free Event</p>
                      ) : (
                        <p className="detail-primary">
                          <DollarSign size={16} />
                          {event.price || 'Paid Event'}
                        </p>
                      )}
                      
                      {event.booking_required && (
                        <p className="detail-secondary">Booking Required</p>
                      )}
                      
                      {event.max_attendees && (
                        <p className="detail-secondary">
                          Max Attendees: {event.max_attendees}
                        </p>
                      )}
                      
                      {event.booking_url && (
                        <a 
                          href={event.booking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="detail-link booking-link"
                        >
                          Book Now <ExternalLink size={14} />
                        </a>
                      )}
                    </section>
                  )}
                </div>

                {/* Related Links */}
                {event.links && event.links.length > 0 && (
                  <section className="event-modal-section">
                    <h2>Related Links</h2>
                    <div className="event-links">
                      {event.links.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target={link.open_method === 'new_tab' ? '_blank' : '_self'}
                          rel={link.open_method === 'new_tab' ? 'noopener noreferrer' : ''}
                          className="event-link-item"
                        >
                          <span>{link.title}</span>
                          <ExternalLink size={16} />
                        </a>
                      ))}
                    </div>
                  </section>
                )}

                {/* Downloads */}
                {event.downloads && event.downloads.length > 0 && (
                  <section className="event-modal-section">
                    <h2>Downloads</h2>
                    <div className="event-downloads">
                      {event.downloads.map((download, index) => (
                        <a
                          key={index}
                          href={download.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="event-download-item"
                        >
                          <Download size={20} />
                          <span>{download.title}</span>
                        </a>
                      ))}
                    </div>
                  </section>
                )}

                {/* Photo Gallery */}
                {event.gallery && event.gallery.length > 0 && (
                  <section className="event-modal-section">
                    <h2>Photo Gallery</h2>
                    <div className="event-gallery">
                      {event.gallery.map((photo, index) => (
                        <div key={index} className="gallery-item">
                          <img
                            src={photo.image_url}
                            alt={photo.alt_text || photo.title}
                            title={photo.title}
                          />
                          {photo.title && (
                            <p className="gallery-caption">{photo.title}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventModal;