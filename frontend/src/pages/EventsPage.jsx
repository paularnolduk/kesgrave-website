import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, ChevronLeft, ChevronRight, Filter, X, Users, Star } from 'lucide-react';
import EventModal from '../components/EventModal';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Date navigation state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [displayMonth, setDisplayMonth] = useState(new Date());
  
  // Filter state
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal state
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const API_BASE_URL = 'http://127.0.0.1:8027';

  // Fetch events and categories
  useEffect(() => {
    fetchEvents();
    fetchCategories();
  }, []);

  // Set initial display month after events are loaded
  useEffect(() => {
    if (events.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Find first event on or after today
      const futureEvents = events
        .filter(event => new Date(event.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      if (futureEvents.length > 0) {
        const firstFutureEvent = new Date(futureEvents[0].date);
        setDisplayMonth(firstFutureEvent);
      }
    }
  }, [events]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/homepage/events`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        setError('Failed to load events');
      }
    } catch (err) {
      setError('Error loading events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/event-categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        // Fallback: extract categories from events
        const uniqueCategories = [];
        events.forEach(event => {
          if (event.categories) {
            event.categories.forEach(cat => {
              if (!uniqueCategories.find(c => c.id === cat.id)) {
                uniqueCategories.push(cat);
              }
            });
          }
        });
        setCategories(uniqueCategories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Date utilities
  const formatDate = (dateString) => {
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
      if (date.getHours() === 0 && date.getMinutes() === 0) {
        return 'All Day';
      }
      return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      return '';
    }
  };

  const isEventInMonth = (eventDate, month) => {
    const event = new Date(eventDate);
    return event.getMonth() === month.getMonth() && 
           event.getFullYear() === month.getFullYear();
  };

  const isEventPast = (eventDate) => {
    const event = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return event < today;
  };

  const getEventsForMonth = (month) => {
    return events.filter(event => isEventInMonth(event.date, month));
  };

  const getAllMonthsWithEvents = () => {
    const months = new Set();
    events.forEach(event => {
      const eventDate = new Date(event.date);
      const monthKey = `${eventDate.getFullYear()}-${eventDate.getMonth()}`;
      months.add(monthKey);
    });
    
    return Array.from(months)
      .map(key => {
        const [year, month] = key.split('-');
        return new Date(parseInt(year), parseInt(month), 1);
      })
      .sort((a, b) => a - b);
  };

  const findNextMonthWithEvents = (startMonth, direction = 1) => {
    const monthsWithEvents = getAllMonthsWithEvents();
    if (monthsWithEvents.length === 0) return startMonth;

    const currentMonthKey = `${startMonth.getFullYear()}-${startMonth.getMonth()}`;
    const currentIndex = monthsWithEvents.findIndex(month => 
      `${month.getFullYear()}-${month.getMonth()}` === currentMonthKey
    );

    if (direction === 1) {
      // Next month
      if (currentIndex >= 0 && currentIndex < monthsWithEvents.length - 1) {
        return monthsWithEvents[currentIndex + 1];
      } else {
        // If not found or at end, find next month with events
        const futureMonths = monthsWithEvents.filter(month => month > startMonth);
        return futureMonths.length > 0 ? futureMonths[0] : startMonth;
      }
    } else {
      // Previous month
      if (currentIndex > 0) {
        return monthsWithEvents[currentIndex - 1];
      } else {
        // If not found or at beginning, find previous month with events
        const pastMonths = monthsWithEvents.filter(month => month < startMonth);
        return pastMonths.length > 0 ? pastMonths[pastMonths.length - 1] : startMonth;
      }
    }
  };

  // Navigation handlers
  const goToPreviousMonth = () => {
    const prevMonth = findNextMonthWithEvents(displayMonth, -1);
    setDisplayMonth(new Date(prevMonth));
  };

  const goToNextMonth = () => {
    const nextMonth = findNextMonthWithEvents(displayMonth, 1);
    setDisplayMonth(new Date(nextMonth));
  };

  const goToCurrentMonth = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find first event on or after today
    const futureEvents = events
      .filter(event => new Date(event.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (futureEvents.length > 0) {
      const firstFutureEvent = new Date(futureEvents[0].date);
      setDisplayMonth(firstFutureEvent);
    } else {
      // If no future events, go to current month
      setDisplayMonth(today);
    }
  };

  // Filter handlers
  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
  };

  // Filter events
  const filteredEvents = getEventsForMonth(displayMonth).filter(event => {
    if (selectedCategories.length === 0) return true;
    
    return event.categories && event.categories.some(cat => 
      selectedCategories.includes(cat.id)
    );
  });

  // Modal handlers
  const handleEventClick = (eventId) => {
    setSelectedEventId(eventId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEventId(null);
  };

  // Get month display name
  const getMonthDisplayName = () => {
    return displayMonth.toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric'
    });
  };

  // Get event description (short_description first, fallback to description)
  const getEventDescription = (event) => {
    return event.short_description || event.description || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
            <span className="ml-3 text-lg text-gray-600">Loading events...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Events</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchEvents}
              className="bg-green-700 text-white px-6 py-2 rounded-md hover:bg-green-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-700 mb-4">
            Community Events
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover upcoming events, community activities, and opportunities to get involved in Kesgrave.
          </p>
        </div>

        {/* Navigation and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={goToPreviousMonth}
              className="flex items-center px-4 py-2 text-green-700 border border-green-700 rounded-md hover:bg-green-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </button>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-green-700 mb-2">
                {getMonthDisplayName()}
              </h2>
              <button
                onClick={goToCurrentMonth}
                className="text-sm text-gray-600 hover:text-green-700 transition-colors"
              >
                Go to Current Month
              </button>
            </div>

            <button
              onClick={goToNextMonth}
              className="flex items-center px-4 py-2 text-green-700 border border-green-700 rounded-md hover:bg-green-50 transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {selectedCategories.length > 0 && (
                  <span className="ml-2 bg-green-700 text-white text-xs px-2 py-1 rounded-full">
                    {selectedCategories.length}
                  </span>
                )}
              </button>
              
              {selectedCategories.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-red-600 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>

            <div className="text-sm text-gray-600">
              {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
            </div>
          </div>

          {/* Category Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Filter by Category</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategories.includes(category.id)
                        ? 'text-white'
                        : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                    }`}
                    style={{
                      backgroundColor: selectedCategories.includes(category.id) 
                        ? category.color 
                        : undefined
                    }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No Events Found
            </h3>
            <p className="text-gray-500 mb-4">
              {selectedCategories.length > 0 
                ? 'Try adjusting your filters or check another month.'
                : `No events scheduled for ${getMonthDisplayName()}.`
              }
            </p>
            {selectedCategories.length > 0 && (
              <button
                onClick={clearFilters}
                className="text-green-700 hover:text-green-800 transition-colors"
              >
                Clear filters to see all events
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => {
              const isPast = isEventPast(event.date);
              const eventDescription = getEventDescription(event);
              const hasBookingUrl = event.booking_url && event.booking_url.trim() !== '';
              
              return (
                <article
                  key={event.id}
                  className={`bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${
                    isPast ? 'opacity-60 grayscale' : ''
                  } flex flex-col overflow-hidden`}
                  onClick={() => handleEventClick(event.id)}
                  role="button"
                  tabIndex="0"
                  aria-label={`View details for ${event.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleEventClick(event.id);
                    }
                  }}
                >
                  {/* Event Image */}
                  {event.featured_image && (
                    <div className="relative h-48 overflow-hidden">
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${event.featured_image})` }}
                        role="img"
                        aria-label={`Image for ${event.title}`}
                      />
                      
                      {/* Past Event Badge */}
                      {isPast && (
                        <div className="absolute top-3 left-3 bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-medium z-20">
                          Past Event
                        </div>
                      )}
                      
                      {/* Featured Badge */}
                      {event.featured && (
                        <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center z-20 shadow-lg">
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          Featured
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-6 flex flex-col flex-grow">
                    {/* Event Categories */}
                    {event.categories && event.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {event.categories.map((category, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs font-medium text-white rounded-full"
                            style={{ backgroundColor: category.color }}
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Event Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {event.title}
                    </h3>

                    {/* Event Details */}
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-green-700" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      
                      {event.date && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-green-700" />
                          <span>{formatTime(event.date)}</span>
                          {event.end_date && event.end_date !== event.date && (
                            <span> - {formatTime(event.end_date)}</span>
                          )}
                        </div>
                      )}

                      {event.location && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-green-700" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}

                      {event.max_attendees && (
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1 text-green-700" />
                          <span>Max {event.max_attendees}</span>
                        </div>
                      )}
                    </div>

                    {/* Event Description */}
                    {eventDescription && (
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow">
                        {eventDescription}
                      </p>
                    )}

                    {/* Action Buttons - Always at bottom and aligned */}
                    <div className="flex items-center justify-between mt-auto pt-4">
                      <div className="flex items-center space-x-2">
                        {event.is_free ? (
                          <span className="text-sm font-medium text-green-600">
                            Free Event
                          </span>
                        ) : (
                          <div className="flex items-center space-x-2">
                            {hasBookingUrl && (
                              <a
                                href={event.booking_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                Booking Link
                              </a>
                            )}
                            {event.price && (
                              <span className="text-sm font-medium text-gray-600">
                                {event.price}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <button className="bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-800 transition-colors text-sm font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Event Modal */}
        <EventModal
          eventId={selectedEventId}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      </div>
    </div>
  );
};

export default EventsPage;