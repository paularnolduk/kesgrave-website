import { useState, useEffect } from 'react';
import { Filter, X, Mail, Phone, MapPin, User, Users, ChevronDown } from 'lucide-react';
import CouncillorModal from '../components/CouncillorModal';
import '../components/CouncillorModal.css';

const CouncillorsPage = () => {
  const [councillors, setCouncillors] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter state
  const [selectedTags, setSelectedTags] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal state
  const [selectedCouncillorId, setSelectedCouncillorId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const API_BASE_URL = 'http://127.0.0.1:8027';

  // Fetch councillors and tags
  useEffect(() => {
    fetchCouncillors();
    fetchTags();
  }, []);

  const fetchCouncillors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/councillors`);
      if (response.ok) {
        const data = await response.json();
        setCouncillors(data);
      } else {
        setError('Failed to load councillors');
      }
    } catch (err) {
      setError('Error loading councillors');
      console.error('Error fetching councillors:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/councillor-tags`);
      if (response.ok) {
        const data = await response.json();
        setTags(data);
      }
    } catch (err) {
      console.error('Error fetching tags:', err);
    }
  };

  // Filter handlers
  const toggleTag = (tagId) => {
    setSelectedTags(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
  };

  // Filter councillors
  const filteredCouncillors = councillors.filter(councillor => {
    if (selectedTags.length === 0) return true;
    
    return councillor.tags && councillor.tags.some(tag => 
      selectedTags.includes(tag.id)
    );
  });

  // Modal handlers
  const handleCouncillorClick = (councillorId) => {
    setSelectedCouncillorId(councillorId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCouncillorId(null);
  };

  // Get councillor description (intro first, fallback to bio)
  const getCouncillorDescription = (councillor) => {
    return councillor.intro || councillor.bio || '';
  };

  // Truncate text for card descriptions
  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
            <span className="ml-3 text-lg text-gray-600">Loading councillors...</span>
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
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Councillors</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchCouncillors}
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
            Your Councillors
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Meet the dedicated individuals who represent your interests and work tirelessly to serve the Kesgrave community.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          {/* Filter Toggle */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter by Ward/Role
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                {selectedTags.length > 0 && (
                  <span className="ml-2 bg-green-700 text-white text-xs px-2 py-1 rounded-full">
                    {selectedTags.length}
                  </span>
                )}
              </button>
              
              {selectedTags.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-red-600 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>

            <div className="text-sm text-gray-600">
              {filteredCouncillors.length} councillor{filteredCouncillors.length !== 1 ? 's' : ''} found
            </div>
          </div>

          {/* Tag Filters */}
          {showFilters && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Filter by Ward or Role</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedTags.includes(tag.id)
                        ? 'text-white'
                        : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                    }`}
                    style={{
                      backgroundColor: selectedTags.includes(tag.id) 
                        ? tag.color 
                        : undefined
                    }}
                  >
                    {tag.name}
                    {tag.councillor_count > 0 && (
                      <span className="ml-1 text-xs opacity-75">
                        ({tag.councillor_count})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Councillors Grid */}
        {filteredCouncillors.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No Councillors Found
            </h3>
            <p className="text-gray-500 mb-4">
              {selectedTags.length > 0 
                ? 'Try adjusting your filters to see more councillors.'
                : 'No councillors are currently available.'
              }
            </p>
            {selectedTags.length > 0 && (
              <button
                onClick={clearFilters}
                className="text-green-700 hover:text-green-800 transition-colors"
              >
                Clear filters to see all councillors
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCouncillors.map(councillor => {
              const description = getCouncillorDescription(councillor);
              
              return (
                <article
                  key={councillor.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 flex flex-col overflow-hidden"
                  onClick={() => handleCouncillorClick(councillor.id)}
                  role="button"
                  tabIndex="0"
                  aria-label={`View details for ${councillor.name}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleCouncillorClick(councillor.id);
                    }
                  }}
                >
                  {/* Councillor Image */}
                  <div className="relative h-56 overflow-hidden bg-gray-200">
                    {councillor.image_url ? (
                      <img
                        src={councillor.image_url}
                        alt={`Photo of ${councillor.name}`}
                        className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
                        style={{ objectPosition: 'center 15%' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200">
                        <User className="w-16 h-16 text-green-600" />
                      </div>
                    )}
                    
                    {/* Ward Tags Overlay */}
                    {councillor.tags && councillor.tags.length > 0 && (
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                        {councillor.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 rounded-full text-xs font-medium text-white shadow-lg"
                            style={{ backgroundColor: tag.color }}
                          >
                            {tag.name}
                          </span>
                        ))}
                        {councillor.tags.length > 2 && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium text-white bg-gray-600 shadow-lg">
                            +{councillor.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Councillor Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Name and Title */}
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {councillor.name}
                      </h3>
                      {councillor.title && (
                        <p className="text-green-700 font-medium text-sm">
                          {councillor.title}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    {description && (
                      <p className="text-gray-600 text-sm line-height-relaxed mb-4 flex-1">
                        {truncateText(description)}
                      </p>
                    )}

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4">
                      {councillor.email && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{councillor.email}</span>
                        </div>
                      )}
                      {councillor.phone && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{councillor.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Read More Button */}
                    <div className="mt-auto">
                      <button className="w-full bg-green-700 text-white py-2 px-4 rounded-md hover:bg-green-800 transition-colors text-sm font-medium">
                        Read More
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Modal */}
        <CouncillorModal
          councillorId={selectedCouncillorId}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      </div>
    </div>
  );
};

export default CouncillorsPage;

