import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Users, FileText, Clock, Download, ExternalLink } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8027';

const MeetingsPage = () => {
  const [meetingTypes, setMeetingTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch meeting types from API
  useEffect(() => {
    const fetchMeetingTypes = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/meeting-types`);
        if (!response.ok) {
          throw new Error('Failed to fetch meeting types');
        }
        const data = await response.json();
        
        // Filter to only show specific meeting types
        const allowedMeetingTypes = [
          'Annual Town Meeting',
          'Community and Recreation',
          'Finance and Governance',
          'Full Council Meetings',
          'Planning and Development'
        ];
        
        const filteredData = data.filter(meetingType => 
          allowedMeetingTypes.includes(meetingType.name)
        );
        
        setMeetingTypes(filteredData);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching meeting types:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetingTypes();
  }, []);

  // Get icon based on meeting type name
  const getIconForMeetingType = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('full council')) return Users;
    if (lowerName.includes('planning')) return FileText;
    if (lowerName.includes('finance')) return Calendar;
    if (lowerName.includes('community')) return Users;
    return Calendar; // Default icon
  };

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      // Assuming date is in DD/MM/YYYY format from API
      const [day, month, year] = dateStr.split('/');
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (err) {
      return dateStr;
    }
  };

  // Format time for display
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      // Assuming time is in HH:MM format
      const [hours, minutes] = timeStr.split(':');
      const time = new Date();
      time.setHours(parseInt(hours), parseInt(minutes));
      return time.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (err) {
      return timeStr;
    }
  };

  // Handle agenda download
  const handleAgendaDownload = async (meetingId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/meetings/${meetingId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch meeting details');
      }
      const meeting = await response.json();
      
      // Check if agenda exists and has file_url
      if (meeting.agenda && meeting.agenda.file_url) {
        // Open agenda file URL in new tab
        window.open(meeting.agenda.file_url, '_blank');
      } else {
        alert('Agenda not yet available for this meeting.');
      }
    } catch (err) {
      console.error('Error downloading agenda:', err);
      alert('Unable to download agenda at this time.');
    }
  };

  // Handle "Show all" button click
  const handleShowAll = (meetingTypeName) => {
    // Navigate to meeting type page (removed /type from path)
    const encodedName = encodeURIComponent(meetingTypeName);
    window.location.href = `/ktc-meetings/${encodedName}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading meeting types...</p>
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
            <p className="text-red-600">Error loading meeting types: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold ktc-green mb-4">
            Council Meetings
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay informed about council meetings, access agendas, minutes, and find out when the next meetings are scheduled.
          </p>
        </div>

        {/* Meeting Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {meetingTypes.map((meetingType) => {
            const IconComponent = getIconForMeetingType(meetingType.name);
            const hasNextMeeting = meetingType.next_meeting;
            
            return (
              <Card key={meetingType.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
                      style={{ 
                        backgroundColor: `${meetingType.color}20`,
                        color: meetingType.color 
                      }}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{meetingType.name}</h3>
                      <p className="text-sm text-gray-500">
                        {meetingType.meeting_count} meeting{meetingType.meeting_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{meetingType.description}</p>
                  
                  {/* Next Meeting Info */}
                  {hasNextMeeting ? (
                    <div className="bg-green-50 p-3 rounded-lg mb-4">
                      <div className="flex items-start text-sm text-green-700">
                        <Clock className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Next meeting:</p>
                          <p>{formatDate(hasNextMeeting.date)}</p>
                          <p>{formatTime(hasNextMeeting.time)} at {hasNextMeeting.location}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>No upcoming meetings scheduled</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Agenda Download Section - Separate with light grey styling */}
                  {hasNextMeeting && (
                    <div className="bg-gray-100 p-3 rounded-lg mb-4">
                      <button
                        onClick={() => handleAgendaDownload(hasNextMeeting.id)}
                        className="flex items-center text-sm text-gray-700 hover:text-gray-900 transition-colors w-full"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Agenda
                      </button>
                    </div>
                  )}
                  
                  {/* Show All Button */}
                  <button
                    onClick={() => handleShowAll(meetingType.name)}
                    className="block w-full text-center bg-green-700 text-white py-2 rounded-md hover:bg-green-800 transition-colors flex items-center justify-center"
                  >
                    <span>Show All</span>
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Public Participation Section */}
        <div className="bg-white p-8 rounded-lg shadow-sm max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 ktc-green text-center">
            Attend Council Meetings
          </h2>
          <div className="text-center space-y-4">
            <p className="text-lg text-gray-700">
              All council meetings are open to the public, and we encourage residents to attend.
            </p>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-green-800 mb-3">
                Public Participation
              </h3>
              <p className="text-gray-700 mb-4">
                Most meetings include a public participation period where residents can address the council. 
                Please <a 
                  href="/contact" 
                  className="text-green-700 hover:text-green-800 underline font-medium"
                >
                  contact us
                </a> in advance if you wish to speak.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingsPage;

