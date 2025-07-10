import { useState, useEffect } from 'react';
import { X, Mail, Phone, MapPin, User, ExternalLink, Award, Calendar } from 'lucide-react';

const CouncillorModal = ({ councillorId, isOpen, onClose }) => {
  const [councillor, setCouncillor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://127.0.0.1:8027';

  // Fetch full councillor details when modal opens
  useEffect(() => {
    if (isOpen && councillorId) {
      fetchCouncillorDetails();
    }
  }, [isOpen, councillorId]);

  const fetchCouncillorDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/councillors/${councillorId}`);
      if (response.ok) {
        const councillorData = await response.json();
        setCouncillor(councillorData);
      } else {
        setError('Failed to load councillor details');
      }
    } catch (err) {
      setError('Error loading councillor details');
      console.error('Error fetching councillor:', err);
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

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="councillor-modal-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="councillor-modal-title"
    >
      <div className="councillor-modal">
        <div className="councillor-modal-content">
          {/* Close Button */}
          <button
            className="councillor-modal-close"
            onClick={onClose}
            aria-label="Close councillor details"
            type="button"
          >
            <X size={24} />
          </button>

          {loading && (
            <div className="councillor-modal-loading">
              <div className="loading-spinner"></div>
              <p>Loading councillor details...</p>
            </div>
          )}

          {error && (
            <div className="councillor-modal-error">
              <p>Sorry, we couldn't load the councillor details. Please try again.</p>
              <button onClick={fetchCouncillorDetails} className="retry-button">
                Retry
              </button>
            </div>
          )}

          {councillor && (
            <>
              {/* Header Section with Vertical Line Divider */}
              <div className="councillor-modal-header">
                {/* Left Side - Green Background with Text */}
                <div className="councillor-modal-text-area">
                  {/* Ward Tags */}
                  {councillor.tags && councillor.tags.length > 0 && (
                    <div className="councillor-modal-tags">
                      {councillor.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="councillor-modal-tag"
                          style={{ 
                            backgroundColor: tag.color || '#6c757d',
                            color: 'white'
                          }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Councillor Name */}
                  <h1 id="councillor-modal-title" className="councillor-modal-title">
                    {councillor.name}
                  </h1>
                  
                  {/* Title */}
                  {councillor.title && (
                    <p className="councillor-modal-subtitle">
                      {councillor.title}
                    </p>
                  )}
                </div>

                {/* Right Side - Image Area with Vertical Divider */}
                {councillor.image_url && (
                  <div className="councillor-modal-image-area">
                    <img
                      src={councillor.image_url}
                      alt={`Photo of ${councillor.name}`}
                      className="councillor-header-image"
                    />
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="councillor-modal-body">
                {/* Introduction */}
                {councillor.intro && (
                  <section className="councillor-modal-section">
                    <div className="councillor-intro">
                      <p className="intro-text">{councillor.intro}</p>
                    </div>
                  </section>
                )}

                {/* Biography */}
                {councillor.bio && (
                  <section className="councillor-modal-section">
                    <h2>Biography</h2>
                    <div className="councillor-bio">
                      {councillor.bio.split('\n').map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </section>
                )}

                {/* Contact and Details Grid */}
                <div className="councillor-details-grid">
                  {/* Contact Information */}
                  {(councillor.email || councillor.phone) && (
                    <section className="councillor-detail-card">
                      <h3>
                        <User size={20} />
                        Contact Information
                      </h3>
                      {councillor.email && (
                        <a href={`mailto:${councillor.email}`} className="detail-link">
                          <Mail size={16} />
                          {councillor.email}
                        </a>
                      )}
                      {councillor.phone && (
                        <a href={`tel:${councillor.phone}`} className="detail-link">
                          <Phone size={16} />
                          {councillor.phone}
                        </a>
                      )}
                    </section>
                  )}

                  {/* Address */}
                  {councillor.address && (
                    <section className="councillor-detail-card">
                      <h3>
                        <MapPin size={20} />
                        Address
                      </h3>
                      <div className="detail-primary">
                        {councillor.address.split('\n').map((line, index) => (
                          <div key={index}>{line}</div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Qualifications */}
                  {councillor.qualifications && (
                    <section className="councillor-detail-card">
                      <h3>
                        <Award size={20} />
                        Qualifications
                      </h3>
                      <div className="detail-primary">
                        {councillor.qualifications.split('\n').map((qualification, index) => (
                          <div key={index}>{qualification}</div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Service Information */}
                  {(councillor.created_at || councillor.updated_at) && (
                    <section className="councillor-detail-card">
                      <h3>
                        <Calendar size={20} />
                        Service Information
                      </h3>
                      {councillor.created_at && (
                        <p className="detail-secondary">
                          Profile created: {formatDate(councillor.created_at)}
                        </p>
                      )}
                      {councillor.updated_at && (
                        <p className="detail-secondary">
                          Last updated: {formatDate(councillor.updated_at)}
                        </p>
                      )}
                    </section>
                  )}
                </div>

                {/* Social Links */}
                {councillor.social_links && Object.keys(councillor.social_links).length > 0 && (
                  <section className="councillor-modal-section">
                    <h2>Social Media & Links</h2>
                    <div className="councillor-social-links">
                      {Object.entries(councillor.social_links).map(([platform, url], index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-link-item"
                        >
                          <span>{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                          <ExternalLink size={16} />
                        </a>
                      ))}
                    </div>
                  </section>
                )}

                {/* Ward Information */}
                {councillor.tags && councillor.tags.length > 0 && (
                  <section className="councillor-modal-section">
                    <h2>Responsibilities & Wards</h2>
                    <div className="ward-info-grid">
                      {councillor.tags.map((tag, index) => (
                        <div key={index} className="ward-info-card">
                          <div 
                            className="ward-color-indicator"
                            style={{ backgroundColor: tag.color }}
                          ></div>
                          <div className="ward-info-content">
                            <h4>{tag.name}</h4>
                            {tag.description && (
                              <p className="ward-description">{tag.description}</p>
                            )}
                          </div>
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

export default CouncillorModal;

