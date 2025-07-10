import { useState, useEffect } from 'react';

const Footer = () => {
  const [footerLinks, setFooterLinks] = useState({
    column1: [],
    column2: [],
    column3: []
  });

  // This would normally fetch from CMS, for now using placeholder data
  useEffect(() => {
    // Placeholder footer links - these would come from CMS /homepage endpoint
    setFooterLinks({
      column1: [
        { title: 'About Us', url: '/content/about-us' },
        { title: 'Council Services', url: '/content/services' },
        { title: 'Community', url: '/content/community' },
        { title: 'Local History', url: '/content/history' }
      ],
      column2: [
        { title: 'Policies', url: '/content/policies' },
        { title: 'Privacy Policy', url: '/content/privacy-policy' },
        { title: 'Terms of Service', url: '/content/terms' },
        { title: 'Accessibility', url: '/content/accessibility' }
      ],
      column3: [
        { title: 'Contact Us', url: '/contact' },
        { title: 'Opening Hours', url: '/content/opening-hours' },
        { title: 'Location', url: '/content/location' },
        { title: 'Emergency Contacts', url: '/content/emergency' }
      ]
    });
  }, []);

  return (
    <footer className="bg-gray-50 border-t">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1 */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Council Information</h3>
            <ul className="space-y-2">
              {footerLinks.column1.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.url}
                    className="text-gray-600 hover:text-green-700 transition-colors duration-200"
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Policies & Documents</h3>
            <ul className="space-y-2">
              {footerLinks.column2.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.url}
                    className="text-gray-600 hover:text-green-700 transition-colors duration-200"
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Get in Touch</h3>
            <ul className="space-y-2">
              {footerLinks.column3.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.url}
                    className="text-gray-600 hover:text-green-700 transition-colors duration-200"
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="ktc-header-light text-white py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p className="mb-2 md:mb-0">
              © 2025 Kesgrave Town Council. All rights reserved.
            </p>
            <p>
              Created and Managed by Paul Arnold,{' '}
              <a
                href="https://www.localprices.net"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-200 transition-colors"
              >
                LocalPrices.net
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

