import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Download, ExternalLink, FileText, Users, Home, ChevronRight, CalendarPlus, Share2, Mail, Facebook, Twitter, Linkedin } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8027';

const MeetingTypePage = () => {
  const { meetingType } = useParams();
  const navigate = useNavigate();

  const [meetingTypeDetails, setMeetingTypeDetails] = useState(null);
  const [nextMeeting, setNextMeeting] = useState(null);
  const [recentMeetings, setRecentMeetings] = useState([]);
  const [historicMeetings, setHistoricMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    const fetchMeetingData = async () => {
      try {
        setLoading(true);
        // Fetch all meetings for the specific type
        const response = await fetch(`${API_BASE_URL}/api/meetings/type/${encodeURIComponent(meetingType)}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch meetings for ${meetingType}`);
        }
        const responseData = await response.json();

        // Extract meetings array from the response object
        let allMeetings = responseData.meetings || [];
        
        // Set meeting type details from the response
        if (responseData.meeting_type) {
          setMeetingTypeDetails(responseData.meeting_type);
        }

        // Ensure allMeetings is an array before sorting
        if (!Array.isArray(allMeetings)) {
          console.warn("API meetings property is not an array, defaulting to empty array.", allMeetings);
          allMeetings = [];
        }

        // Sort meetings by date (most recent first)
        const sortedMeetings = allMeetings.sort((a, b) => {
          const [dayA, monthA, yearA] = a.date.split('/');
          const [dayB, monthB, yearB] = b.date.split('/');
          const dateA = new Date(`${yearA}-${monthA}-${dayA}`);
          const dateB = new Date(`${yearB}-${monthB}-${dayB}`);
          return dateB - dateA; // Descending order
        });

        const now = new Date();
        now.setHours(0, 0, 0, 0); // Normalize to start of day

        let next = null;
        const historic = [];
        const recent = [];

        for (const meeting of sortedMeetings) {
          const [day, month, year] = meeting.date.split('/');
          const meetingDate = new Date(`${year}-${month}-${day}`);

          if (meetingDate >= now && !next) {
            next = meeting; // Found the next upcoming meeting
          } else if (meetingDate < now) {
            historic.push(meeting);
            if (recent.length < 6) {
              recent.push(meeting); // Add to recent if less than 6
            }
          }
        }

        setNextMeeting(next);
        setRecentMeetings(recent);
        setHistoricMeetings(historic);

      } catch (err) {
        setError(err.message);
        console.error('Error fetching meeting data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetingData();
  }, [meetingType]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const [day, month, year] = dateStr.split('/');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    // Assuming timeStr is in HH:MM format
    return timeStr;
  };

  const getButtonText = (fileUrl) => {
    return fileUrl ? 'DOWNLOAD' : 'AVAILABLE SOON';
  };

  const getSummaryButtonText = (summaryUrl) => {
    return summaryUrl ? 'OPEN SUMMARY PAGE' : 'AVAILABLE SOON';
  };

  const handleDownload = (fileUrl) => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    } else {
      alert('Document not available yet.');
    }
  };

  const handleSummaryOpen = (summaryUrl) => {
    if (summaryUrl) {
      window.open(summaryUrl, '_blank');
    } else {
      alert('Summary page not available yet.');
    }
  };

  const handleAddToCalendar = (meeting) => {
    if (!meeting) return;

    const [day, month, year] = meeting.date.split('/');
    const [hours, minutes] = meeting.time.split(':');
    
    // Create start date
    const startDate = new Date(year, month - 1, day, hours, minutes);
    // Assume 2-hour meeting duration
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    // Format dates for calendar
    const formatCalendarDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const calendarData = {
      title: meeting.title,
      start: formatCalendarDate(startDate),
      end: formatCalendarDate(endDate),
      location: meeting.location,
      description: `${meetingType} meeting at ${meeting.location}`
    };

    // Create Google Calendar URL
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(calendarData.title)}&dates=${calendarData.start}/${calendarData.end}&location=${encodeURIComponent(calendarData.location)}&details=${encodeURIComponent(calendarData.description)}`;

    // Open Google Calendar
    window.open(googleCalendarUrl, '_blank');
  };

  const handleShare = (platform, meeting) => {
    if (!meeting) return;

    const meetingUrl = window.location.href;
    const shareText = `${meeting.title} - ${formatDate(meeting.date)} at ${formatTime(meeting.time)} in ${meeting.location}`;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(meetingUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(meetingUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(meetingUrl)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(meeting.title)}&body=${encodeURIComponent(shareText + '\n\nMore details: ' + meetingUrl)}`;
        break;
      default:
        return;
    }

    if (platform === 'email') {
      window.location.href = shareUrl;
    } else {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    
    setShowShareMenu(false);
  };

  const getIconForMeetingType = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('full council')) return Users;
    if (lowerName.includes('planning')) return FileText;
    if (lowerName.includes('finance')) return Calendar;
    if (lowerName.includes('community')) return Users;
    if (lowerName.includes('annual town')) return Home;
    return Calendar; // Default icon
  };

  const primaryColor = meetingTypeDetails?.color || '#2c5f2d'; // Default green
  const lightColor = `${primaryColor}1A`; // 10% opacity for light background

  if (loading) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-700"></div>
        <p className="ml-4 text-green-700">Loading meetings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-8 flex flex-col items-center justify-center text-red-600">
        <p className="text-lg">Error: {error}</p>
        <button
          onClick={() => navigate('/ktc-meetings')}
          className="mt-4 px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
        >
          Go to Main Meetings Page
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <button
            onClick={() => navigate('/')}
            className="hover:text-green-700 transition-colors"
          >
            Home
          </button>
          <ChevronRight className="w-4 h-4" />
          <button
            onClick={() => navigate('/ktc-meetings')}
            className="hover:text-green-700 transition-colors"
          >
            Meetings
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-800 font-medium">{meetingType}</span>
        </nav>

        {/* Header Section */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-800">{meetingType} Meetings</h1>
            
            {/* Action Buttons */}
            {nextMeeting && (
              <div className="flex items-center space-x-3">
                {/* Add to Calendar Button */}
                <button
                  onClick={() => handleAddToCalendar(nextMeeting)}
                  className="flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                  title="Add to Calendar"
                >
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  Add to Calendar
                </button>

                {/* Share Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                    title="Share Meeting"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </button>

                  {/* Share Menu */}
                  {showShareMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <div className="py-2">
                        <button
                          onClick={() => handleShare('facebook', nextMeeting)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Facebook className="w-4 h-4 mr-3 text-blue-600" />
                          Share on Facebook
                        </button>
                        <button
                          onClick={() => handleShare('twitter', nextMeeting)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Twitter className="w-4 h-4 mr-3 text-blue-400" />
                          Share on Twitter
                        </button>
                        <button
                          onClick={() => handleShare('linkedin', nextMeeting)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Linkedin className="w-4 h-4 mr-3 text-blue-700" />
                          Share on LinkedIn
                        </button>
                        <button
                          onClick={() => handleShare('email', nextMeeting)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Mail className="w-4 h-4 mr-3 text-gray-600" />
                          Share via Email
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {nextMeeting ? (
            <div className="flex items-center space-x-4 text-lg text-gray-700">
              <Calendar className="w-6 h-6 text-green-700" />
              <span>Next Meeting: {formatDate(nextMeeting.date)}</span>
              <Clock className="w-6 h-6 text-green-700" />
              <span>{formatTime(nextMeeting.time)}</span>
              <MapPin className="w-6 h-6 text-green-700" />
              <span>{nextMeeting.location}</span>
            </div>
          ) : (
            <p className="text-lg text-gray-600">No upcoming meetings scheduled for this type.</p>
          )}
        </div>

        {/* Recent Meetings Section */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Meetings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {recentMeetings.length > 0 ? (
            recentMeetings.map((meeting) => (
              <div key={meeting.id} className="bg-white shadow-md rounded-lg overflow-hidden">
                {/* Card Header */}
                <div className="p-6 pb-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{formatDate(meeting.date)}</h3>
                  <p className="text-gray-600 mb-4">{meeting.title}</p>
                  <div className="flex items-center text-sm text-gray-700 mb-2">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{formatTime(meeting.time)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700 mb-4">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{meeting.location}</span>
                  </div>
                </div>

                {/* Downloads Section */}
                <div className="px-6 pb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Meeting Documents</h4>
                  <div className="space-y-2">
                    {/* Agenda */}
                    <button
                      onClick={() => handleDownload(meeting.agenda?.file_url)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        meeting.agenda?.file_url 
                          ? 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200' 
                          : 'bg-gray-50 text-gray-500 cursor-not-allowed border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-3" />
                        <span>Meeting Agenda</span>
                      </div>
                      <span className="text-xs">{getButtonText(meeting.agenda?.file_url)}</span>
                    </button>

                    {/* Draft Minutes */}
                    <button
                      onClick={() => handleDownload(meeting.draft_minutes?.file_url)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        meeting.draft_minutes?.file_url 
                          ? 'bg-yellow-50 text-yellow-800 hover:bg-yellow-100 border border-yellow-200' 
                          : 'bg-gray-50 text-gray-500 cursor-not-allowed border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center">
                        <Download className="w-4 h-4 mr-3" />
                        <span>Draft Minutes</span>
                      </div>
                      <span className="text-xs">{getButtonText(meeting.draft_minutes?.file_url)}</span>
                    </button>

                    {/* Approved Minutes */}
                    <button
                      onClick={() => handleDownload(meeting.minutes?.file_url)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        meeting.minutes?.file_url 
                          ? 'bg-green-50 text-green-800 hover:bg-green-100 border border-green-200' 
                          : 'bg-gray-50 text-gray-500 cursor-not-allowed border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center">
                        <Download className="w-4 h-4 mr-3" />
                        <span>Approved Minutes</span>
                      </div>
                      <span className="text-xs">{getButtonText(meeting.minutes?.file_url)}</span>
                    </button>

                    {/* Schedule of Applications (Conditional) */}
                    {meetingType === 'Planning and Development' && (
                      <button
                        onClick={() => handleDownload(meeting.schedule_applications?.file_url)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          meeting.schedule_applications?.file_url 
                            ? 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200' 
                            : 'bg-gray-50 text-gray-500 cursor-not-allowed border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-3" />
                          <span>Schedule of Applications</span>
                        </div>
                        <span className="text-xs">{getButtonText(meeting.schedule_applications?.file_url)}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Summary Section */}
                <div className="bg-gray-50 px-6 py-4 border-t">
                  <button
                    onClick={() => handleSummaryOpen(meeting.summary_url)}
                    className={`w-full flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      meeting.summary_url 
                        ? 'bg-orange-50 text-orange-800 hover:bg-orange-100 border border-orange-200' 
                        : 'bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-300'
                    }`}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    <span>{getSummaryButtonText(meeting.summary_url)}</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No recent meetings found for this type.</p>
          )}
        </div>

        {/* Historic Meetings Section */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Historic Meetings</h2>
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
          {historicMeetings.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agenda</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Draft Minutes</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved Minutes</th>
                  {meetingType === 'Planning and Development' && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule of Applications</th>
                  )}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Summary</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historicMeetings.map((meeting) => (
                  <tr key={meeting.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatDate(meeting.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {meeting.agenda?.file_url ? (
                        <a href={meeting.agenda.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900 flex items-center">
                          <Download className="w-4 h-4 mr-1" /> Download
                        </a>
                      ) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {meeting.draft_minutes?.file_url ? (
                        <a href={meeting.draft_minutes.file_url} target="_blank" rel="noopener noreferrer" className="text-yellow-600 hover:text-yellow-900 flex items-center">
                          <Download className="w-4 h-4 mr-1" /> Download
                        </a>
                      ) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {meeting.minutes?.file_url ? (
                        <a href={meeting.minutes.file_url} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-900 flex items-center">
                          <Download className="w-4 h-4 mr-1" /> Download
                        </a>
                      ) : 'N/A'}
                    </td>
                    {meetingType === 'Planning and Development' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {meeting.schedule_applications?.file_url ? (
                          <a href={meeting.schedule_applications.file_url} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-900 flex items-center">
                            <Download className="w-4 h-4 mr-1" /> Download
                          </a>
                        ) : 'N/A'}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {meeting.summary_url ? (
                        <a href={meeting.summary_url} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-900 flex items-center">
                          <ExternalLink className="w-4 h-4 mr-1" /> Summary Web Page
                        </a>
                      ) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-600 p-6">No historic meetings found for this type.</p>
          )}
        </div>

        {/* Back to Main Meetings Page Button */}
        <div className="text-center">
          <button
            onClick={() => navigate('/ktc-meetings')}
            className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors flex items-center mx-auto"
          >
            <Home className="w-5 h-5 mr-2" /> Back to Main Meetings Page
          </button>
        </div>

      </div>
    </div>
  );
};

export default MeetingTypePage;

