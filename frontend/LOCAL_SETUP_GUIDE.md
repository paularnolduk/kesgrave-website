# Kesgrave Town Council Website - Local Setup Guide

## 📋 **Prerequisites**

Before starting, ensure you have:
- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- Your **CMS admin running locally** (Flask app)
- **Git** (optional, for version control)

## 🚀 **Step 1: Extract and Setup Project**

1. **Extract the project files** from `kesgrave-website-complete.zip`
2. **Open terminal/command prompt** and navigate to the project directory:
   ```bash
   cd path/to/kesgrave-website
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

## 🔧 **Step 2: Configure CMS Integration**

### **Update API Base URL**

1. **Create environment file** in the project root:
   ```bash
   # Create .env file
   touch .env
   ```

2. **Add your local CMS URL** to `.env`:
   ```env
   VITE_CMS_API_URL=http://localhost:5000
   ```
   *(Replace `5000` with your CMS port if different)*

### **Update Footer Component for Dynamic Links**

1. **Open** `src/components/Footer.jsx`
2. **Replace the existing Footer component** with this updated version:

```jsx
import { useState, useEffect } from 'react';

const Footer = () => {
  const [footerLinks, setFooterLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFooterLinks();
  }, []);

  const fetchFooterLinks = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_CMS_API_URL}/api/footer-links`);
      if (response.ok) {
        const data = await response.json();
        setFooterLinks(data);
      } else {
        console.warn('Footer links API not available, using fallback');
        setFooterLinks(getFallbackLinks());
      }
    } catch (error) {
      console.warn('Error fetching footer links:', error);
      setFooterLinks(getFallbackLinks());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackLinks = () => [
    { title: 'Privacy Policy', url: '/privacy-policy' },
    { title: 'Terms of Service', url: '/terms' },
    { title: 'Accessibility Statement', url: '/accessibility' },
    { title: 'Contact Us', url: '/contact' }
  ];

  if (loading) {
    return (
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>Loading footer...</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="space-y-2 text-sm">
              <p>📞 01473 625179</p>
              <p>✉️ info@kesgrave-tc.gov.uk</p>
              <p>📍 Kesgrave Town Council</p>
              <p>Council Offices, Kesgrave, Suffolk IP5 2BY</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2 text-sm">
              {footerLinks.map((link, index) => (
                <div key={index}>
                  <a 
                    href={link.url} 
                    className="hover:text-green-300 transition-colors"
                  >
                    {link.title}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About Kesgrave Town Council</h3>
            <p className="text-sm text-gray-300">
              Serving our community with dedication, transparency, and commitment 
              to making Kesgrave a better place for everyone.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Kesgrave Town Council. All rights reserved.</p>
          {error && (
            <p className="text-yellow-300 mt-2">
              Note: Using fallback links (CMS connection unavailable)
            </p>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
```

## 🔗 **Step 3: Add CMS API Endpoints**

### **Add Footer Links Endpoint to Your CMS**

Add this route to your `cms_final_complete.py` file:

```python
@app.route('/api/footer-links', methods=['GET'])
def get_footer_links():
    """API endpoint to get footer links for the frontend website"""
    try:
        # You can customize these links or pull from database
        footer_links = [
            {'title': 'Privacy Policy', 'url': '/privacy-policy'},
            {'title': 'Terms of Service', 'url': '/terms'},
            {'title': 'Accessibility Statement', 'url': '/accessibility'},
            {'title': 'Contact Us', 'url': '/contact'},
            {'title': 'Freedom of Information', 'url': '/foi'},
            {'title': 'Complaints Procedure', 'url': '/complaints'}
        ]
        
        return jsonify(footer_links)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Add CORS support for local development
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response
```

### **Optional: Dynamic Header Links**

If you want dynamic header links too, add this endpoint:

```python
@app.route('/api/header-links', methods=['GET'])
def get_header_links():
    """API endpoint to get header navigation links"""
    try:
        header_links = [
            {'title': 'Home', 'url': '/', 'active': True},
            {'title': 'Councillors', 'url': '/councillors', 'active': True},
            {'title': 'Information', 'url': '/content', 'active': True},
            {'title': 'Meetings', 'url': '/ktc-meetings', 'active': True},
            {'title': 'Things to Do', 'url': '/ktc-events', 'active': True},
            {'title': 'Contact', 'url': '/contact', 'active': True}
        ]
        
        return jsonify(header_links)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

## 🏃‍♂️ **Step 4: Run Both Applications**

### **Start Your CMS Admin**
1. **Open first terminal** and navigate to your CMS directory
2. **Start the Flask app**:
   ```bash
   python cms_final_complete.py
   ```
   *(Should run on http://localhost:5000)*

### **Start the Frontend Website**
1. **Open second terminal** and navigate to the website directory
2. **Start the development server**:
   ```bash
   npm run dev
   ```
   *(Should run on http://localhost:5173)*

## 🧪 **Step 5: Test Everything**

### **Test Dynamic Footer Links**
1. **Open** http://localhost:5173 in your browser
2. **Scroll to footer** - should show links from your CMS
3. **Check browser console** for any API errors
4. **Modify footer links** in your CMS and refresh to see changes

### **Test All Pages**
Visit each page to ensure they work:
- ✅ http://localhost:5173/ (Homepage)
- ✅ http://localhost:5173/councillors
- ✅ http://localhost:5173/ktc-events  
- ✅ http://localhost:5173/ktc-meetings
- ✅ http://localhost:5173/ktc-meetings/full-council
- ✅ http://localhost:5173/contact
- ✅ http://localhost:5173/content
- ✅ http://localhost:5173/policies-and-documents/privacy-policy

### **Test Accessibility Panel**
1. **Click "Accessibility"** button in top-right
2. **Test Contrast, Size, Reset** buttons
3. **Verify panel opens/closes** correctly

## 🔧 **Step 6: Advanced CMS Integration (Optional)**

### **Connect Content Pages to CMS**

To make content pages dynamic, add this endpoint to your CMS:

```python
@app.route('/api/content/<category>/<page>', methods=['GET'])
def get_content_page(category, page):
    """Get specific content page from CMS"""
    try:
        # Query your ContentPage model
        content_page = ContentPage.query.filter_by(
            category=category.replace('-', ' ').title(),
            slug=page
        ).first()
        
        if not content_page:
            return jsonify({'error': 'Page not found'}), 404
            
        return jsonify({
            'title': content_page.title,
            'content': content_page.content,
            'category': content_page.category,
            'last_updated': content_page.updated_at.isoformat(),
            'status': content_page.status
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

## 🐛 **Troubleshooting**

### **Common Issues:**

1. **"Cannot connect to CMS"**
   - Check CMS is running on correct port
   - Verify CORS headers are added
   - Check `.env` file has correct URL

2. **"Footer shows fallback links"**
   - CMS API endpoint not responding
   - Check browser console for errors
   - Verify `/api/footer-links` endpoint exists

3. **"npm install fails"**
   - Update Node.js to latest version
   - Clear npm cache: `npm cache clean --force`
   - Delete `node_modules` and try again

4. **"Page not found errors"**
   - Check React Router is working
   - Verify all page components exist
   - Check browser console for errors

## 📝 **Development Workflow**

1. **Make changes** to website code
2. **Save files** - Vite will auto-reload
3. **Test in browser** at http://localhost:5173
4. **Check CMS integration** works correctly
5. **Build for production** when ready: `npm run build`

## 🚀 **Production Deployment**

When ready to deploy:
1. **Update `.env`** with production CMS URL
2. **Build the project**: `npm run build`
3. **Deploy the `dist` folder** to your web server
4. **Ensure CMS API** is accessible from production domain

---

**Need help?** If you encounter any issues during setup, let me know and I'll help troubleshoot!

