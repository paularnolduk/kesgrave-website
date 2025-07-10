import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock, AlertTriangle, FileText, Users, Shield } from 'lucide-react';
import { useState } from 'react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    privacy: false
  });
  const [formMessage, setFormMessage] = useState({ show: false, type: '', text: '' });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setFormMessage({
          show: true,
          type: 'success',
          text: result.message || 'Thank you for your message. We will get back to you within 2 working days.'
        });
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          privacy: false
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      setFormMessage({
        show: true,
        type: 'error',
        text: error.message || 'Sorry, there was an error sending your message. Please try again or call us directly.'
      });
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold ktc-green mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get in touch with Kesgrave Town Council. We're here to help and answer your questions.
          </p>
        </div>

        {/* Quick Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-l-4 border-l-green-700">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-green-700" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Phone</h3>
              <p className="text-2xl font-bold text-green-700 mb-2">
                <a href="tel:01473625179" className="hover:underline">
                  01473 625179
                </a>
              </p>
              <p className="text-sm text-gray-600">Our main office number for general enquiries</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-700" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Opening Hours</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>Monday - Friday:</strong> 9:00 AM - 5:00 PM</p>
                <p><strong>Saturday - Sunday:</strong> Closed</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-purple-700" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Email</h3>
              <div className="text-sm space-y-1">
                <p>
                  <a href="mailto:info@kesgrave-tc.gov.uk" className="text-purple-700 hover:underline">
                    info@kesgrave-tc.gov.uk
                  </a>
                </p>
                <p>
                  <a href="mailto:clerk@kesgrave-tc.gov.uk" className="text-purple-700 hover:underline">
                    clerk@kesgrave-tc.gov.uk
                  </a>
                </p>
                <p className="text-gray-600 text-xs mt-2">We aim to respond within 2 working days</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Contact Form */}
          <div>
            <h2 className="text-3xl font-semibold mb-6 ktc-green">Send Us a Message</h2>
            <p className="text-gray-600 mb-6">Use the form below to send us a message directly. We'll get back to you as soon as possible.</p>
            
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Please enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="your.email@example.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">We'll use this to respond to your message</p>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="01473 000000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Optional - in case we need to call you</p>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Please select a subject</option>
                      <option value="general">General Enquiry</option>
                      <option value="planning">Planning Application</option>
                      <option value="meetings">Council Meetings</option>
                      <option value="services">Council Services</option>
                      <option value="complaint">Complaint</option>
                      <option value="suggestion">Suggestion</option>
                      <option value="other">Other</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Help us direct your message to the right person</p>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-vertical"
                      placeholder="Please provide as much detail as possible"
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-1">Please provide as much detail as possible</p>
                  </div>

                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="privacy"
                      name="privacy"
                      checked={formData.privacy}
                      onChange={handleInputChange}
                      required
                      className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="privacy" className="text-sm text-gray-700 leading-relaxed">
                      I agree to the council's <a href="/privacy" className="text-green-700 hover:underline">Privacy Policy</a> and consent to my personal data being processed to respond to this enquiry. *
                    </label>
                  </div>

                  {formMessage.show && (
                    <div className={`p-4 rounded-md ${
                      formMessage.type === 'success' 
                        ? 'bg-green-50 border border-green-200 text-green-800' 
                        : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                      {formMessage.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-green-700 hover:bg-green-800 text-white py-3 px-6 rounded-md font-semibold transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Office Information */}
          <div>
            <h2 className="text-3xl font-semibold mb-6 ktc-green">Visit Our Offices</h2>
            <p className="text-gray-600 mb-6">You're welcome to visit our offices during opening hours. No appointment is necessary for general enquiries.</p>
            
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <MapPin className="w-6 h-6 text-green-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Office Location</h3>
                    <p className="text-gray-600 leading-relaxed">
                      <strong>Kesgrave Town Council</strong><br />
                      Ferguson Way<br />
                      Kesgrave<br />
                      Ipswich<br />
                      IP5 2FZ
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Accessibility & Parking</h3>
                <div className="space-y-3 text-gray-600">
                  <p><strong>Accessibility:</strong> Our offices are fully accessible with disabled parking and step-free access.</p>
                  <p><strong>Parking:</strong> Free parking is available on-site, including designated disabled parking spaces.</p>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-orange-600 mr-2" />
                  <h3 className="font-semibold text-lg">Emergency Contacts</h3>
                </div>
                <div className="space-y-4">
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Emergency Services</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Police, Fire, Ambulance:</strong> 999</p>
                      <p><strong>Non-emergency Police:</strong> 101</p>
                      <p><strong>NHS Non-emergency:</strong> 111</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Council Emergency Contact</h4>
                    <p className="text-sm mb-2">For urgent council matters outside office hours:</p>
                    <p className="font-semibold">
                      <a href="tel:07562296609" className="text-green-700 hover:underline">
                        07562 296609
                      </a>
                    </p>
                    <p className="text-xs text-gray-600 italic mt-2">
                      This line is for genuine emergencies only, such as dangerous conditions on council property.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Interactive Map */}
        <div className="mb-12">
          <h2 className="text-3xl font-semibold mb-6 ktc-green text-center">Find Us</h2>
          <p className="text-center text-gray-600 mb-6">Our offices are located in the heart of Kesgrave. Use the map below to find us:</p>
          
          <Card>
            <CardContent className="p-0">
              <div className="w-full h-96 rounded-lg overflow-hidden">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2467.123456789!2d1.2345678!3d52.0123456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sFerguson%20Way%2C%20Kesgrave%2C%20Ipswich%20IP5%202FZ!5e0!3m2!1sen!2suk!4v1234567890123!5m2!1sen!2suk"
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }}
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Kesgrave Town Council Location"
                  className="w-full h-full"
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="text-center mt-4">
            <a 
              href="https://www.google.com/maps/search/Ferguson+Way,+Kesgrave,+Ipswich+IP5+2FZ" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center text-green-700 hover:underline"
            >
              <MapPin className="w-4 h-4 mr-1" />
              Open in Google Maps
            </a>
          </div>
        </div>

        {/* Additional Information Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Council Meetings */}
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Users className="w-6 h-6 text-blue-600 mr-2" />
                <h3 className="text-xl font-semibold">Attend Council Meetings</h3>
              </div>
              <p className="text-gray-600 mb-4">
                All council meetings are open to the public, and we encourage residents to attend.
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold">Public Participation</h4>
                  <p className="text-sm text-gray-600">
                    Most meetings include a public participation period where residents can address the council. 
                    Please contact us in advance if you wish to speak.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Meeting Schedule</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    View our meeting calendar to see when the next council or committee meeting is scheduled.
                  </p>
                  <a 
                    href="/meetings" 
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    View Meeting Schedule
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Complaints Procedure */}
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <FileText className="w-6 h-6 text-red-600 mr-2" />
                <h3 className="text-xl font-semibold">Complaints Procedure</h3>
              </div>
              <p className="text-gray-600 mb-4">
                If you're not satisfied with our service, we have a formal complaints procedure to ensure your concerns are addressed fairly.
              </p>
              <div className="space-y-3">
                <h4 className="font-semibold">How to Make a Complaint</h4>
                <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                  <li>Contact us using any of the methods above, clearly stating that you wish to make a formal complaint</li>
                  <li>Provide full details of your complaint and what outcome you're seeking</li>
                  <li>We will acknowledge your complaint within 3 working days</li>
                  <li>We will investigate and respond within 15 working days</li>
                  <li>If you're not satisfied with our response, you can escalate to the Local Government Ombudsman</li>
                </ol>
                <div className="mt-4">
                  <a 
                    href="/council-information/complaints" 
                    className="inline-block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    View Full Complaints Procedure
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

