import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, User, ArrowLeft, Download, ExternalLink, X, ChevronLeft, ChevronRight, Home } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8027';

const ContentDetailPage = () => {
  const params = useParams();
  const slug = params.slug || params.page || params.id || params['*'];
  
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [galleryModal, setGalleryModal] = useState({ isOpen: false, currentIndex: 0 });

  useEffect(() => {
    if (slug) {
      fetchPageData();
    } else {
      setError('No page identifier found in URL');
      setLoading(false);
    }
  }, [slug]);

  const fetchPageData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/content/page/${slug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Page "${slug}" not found`);
        }
        throw new Error(`Failed to fetch page data (${response.status})`);
      }

      const data = await response.json();
      setPageData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatUKDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  const getCorrectImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    if (imageUrl.includes('/uploads/content/images/')) {
      return imageUrl;
    }
    return imageUrl.replace('/uploads/content/', '/uploads/content/images/');
  };

  const getCorrectDownloadUrl = (downloadUrl) => {
    if (!downloadUrl) return '';
    if (downloadUrl.includes('/uploads/content/downloads/')) {
      return downloadUrl;
    }
    return downloadUrl.replace('/uploads/content/', '/uploads/content/downloads/');
  };

  const handleDownload = (downloadUrl, filename) => {
    const correctedUrl = getCorrectDownloadUrl(downloadUrl);
    const link = document.createElement('a');
    link.href = correctedUrl;
    link.download = filename || 'download';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openGallery = (index) => {
    setGalleryModal({ isOpen: true, currentIndex: index });
  };

  const closeGallery = () => {
    setGalleryModal({ isOpen: false, currentIndex: 0 });
  };

  const nextImage = () => {
    if (pageData?.gallery_images) {
      setGalleryModal(prev => ({
        ...prev,
        currentIndex: (prev.currentIndex + 1) % pageData.gallery_images.length
      }));
    }
  };

  const prevImage = () => {
    if (pageData?.gallery_images) {
      setGalleryModal(prev => ({
        ...prev,
        currentIndex: prev.currentIndex === 0 ? pageData.gallery_images.length - 1 : prev.currentIndex - 1
      }));
    }
  };

  const handleKeyPress = (e) => {
    if (galleryModal.isOpen) {
      if (e.key === 'Escape') closeGallery();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [galleryModal.isOpen]);

  if (loading) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-700"></div>
        <p className="ml-4 text-green-700">Loading content...</p>
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="min-h-screen py-8 flex flex-col items-center justify-center text-red-600">
        <p className="text-lg">Error: {error || 'Page not found'}</p>
        <a
          href="/content"
          className="mt-4 px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
        >
          Back to Information Hub
        </a>
      </div>
    );
  }

  const hasGallery = pageData.gallery_images && pageData.gallery_images.length > 0;
  const hasDownloads = pageData.downloads && pageData.downloads.length > 0;
  const hasRelatedLinks = pageData.related_links && pageData.related_links.length > 0;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm">
            <a href="/" className="text-green-700 hover:underline flex items-center">
              <Home className="w-4 h-4 mr-1" />
              Home
            </a>
            <span className="text-gray-400">/</span>
            <a href="/content" className="text-green-700 hover:underline">
              Information Hub
            </a>
            {pageData.category && (
              <>
                <span className="text-gray-400">/</span>
                <a href={`/content${pageData.category.url_path}`} className="text-green-700 hover:underline">
                  {pageData.category.name}
                </a>
              </>
            )}
            {pageData.subcategory && (
              <>
                <span className="text-gray-400">/</span>
                <a href={`/content${pageData.subcategory.url_path}`} className="text-green-700 hover:underline">
                  {pageData.subcategory.name}
                </a>
              </>
            )}
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">{pageData.title}</span>
          </div>
        </nav>

        {/* Back Button */}
        <div className="mb-6">
          <a 
            href="/content" 
            className="inline-flex items-center text-green-700 hover:text-green-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Information Hub
          </a>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-700 mb-4">
            {pageData.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Updated {formatUKDate(pageData.updated_at)}</span>
            </div>
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              <span>By Kesgrave Town Council</span>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {pageData.status}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Introduction Container - WITH GREEN LEFT BORDER */}
            {pageData.short_description && (
              <Card className="mb-8 border-l-4 border-l-green-700">
                <CardContent className="p-6">
                  <p className="text-gray-700 leading-relaxed text-lg font-bold">
                    {pageData.short_description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Content Container - NO TITLE */}
            <Card className="mb-8">
              <CardContent className="p-8">
                <div 
                  className="prose max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-li:text-gray-700 prose-a:text-green-700 hover:prose-a:text-green-800"
                  dangerouslySetInnerHTML={{ __html: pageData.long_description }}
                />
              </CardContent>
            </Card>

            {/* Gallery Container - USING WORKING APPROACH */}
            {hasGallery && (
              <Card className="mb-8">
                <CardContent className="p-8">
                  <div className="inline-block mb-6">
                    <h2 className="text-xl font-semibold text-white bg-green-700 px-4 py-2 rounded-lg">
                      Gallery ({pageData.gallery_images.length} images)
                    </h2>
                  </div>

                  {/* Using the EXACT approach that worked in minimal version */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    {pageData.gallery_images.map((image, index) => {
                      const correctedImageUrl = getCorrectImageUrl(image.image_url);
                      const altText = image.alt_text || image.title || `Gallery image ${index + 1}`;
                      
                      return (
                        <div
                          key={index}
                          style={{
                            border: '2px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '10px',
                            backgroundColor: '#f9fafb',
                            cursor: 'pointer',
                            transition: 'border-color 0.2s'
                          }}
                          onClick={() => openGallery(index)}
                          title={altText}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#10b981';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e5e7eb';
                          }}
                        >
                          <img
                            src={correctedImageUrl}
                            alt={altText}
                            style={{
                              width: '100%',
                              height: '200px',
                              objectFit: 'cover',
                              borderRadius: '4px',
                              border: '1px solid #d1d5db'
                            }}
                            onLoad={() => console.log(`✅ Gallery thumbnail ${index} loaded successfully`)}
                            onError={() => console.error(`❌ Gallery thumbnail ${index} failed to load`)}
                          />
                          
                          {/* Image info */}
                          <div style={{ marginTop: '8px', textAlign: 'center' }}>
                            {image.title && (
                              <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: '4px 0' }}>
                                {image.title}
                              </p>
                            )}
                            {image.description && (
                              <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0' }}>
                                {image.description}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Page Information Section - Mobile - WITH ORANGE LEFT BORDER */}
            <div className="lg:hidden mb-8">
              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Page Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Created:</span>
                      <p className="text-gray-600">{formatUKDate(pageData.creation_date)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Approved:</span>
                      <p className="text-gray-600">{formatUKDate(pageData.approval_date)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Updated:</span>
                      <p className="text-gray-600">{formatUKDate(pageData.updated_at)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Next Review:</span>
                      <p className="text-gray-600">{formatUKDate(pageData.next_review_date)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Floating Sidebar - Desktop */}
          <div className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-8 space-y-6">
              {/* Related Links */}
              {hasRelatedLinks && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="bg-green-700 px-6 py-4">
                    <h3 className="font-semibold text-white text-lg">Related Links</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {pageData.related_links.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target={link.new_tab ? "_blank" : "_self"}
                        rel={link.new_tab ? "noopener noreferrer" : undefined}
                        className="flex items-center p-4 text-gray-700 hover:bg-green-700 hover:text-white transition-colors group"
                      >
                        <ExternalLink className="w-5 h-5 mr-3 flex-shrink-0 text-green-700 group-hover:text-white" />
                        <span className="font-medium">{link.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Downloads */}
              {hasDownloads && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="bg-green-700 px-6 py-4">
                    <h3 className="font-semibold text-white text-lg">Related Downloads</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {pageData.downloads.map((download, index) => (
                      <button
                        key={index}
                        onClick={() => handleDownload(download.download_url, download.filename)}
                        className="w-full text-left p-4 hover:bg-green-700 hover:text-white transition-colors group"
                      >
                        <div className="flex items-start">
                          <Download className="w-5 h-5 mr-3 text-green-700 group-hover:text-white flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-700 group-hover:text-white truncate">
                              {download.title}
                            </p>
                            {download.description && (
                              <p className="text-sm text-gray-500 group-hover:text-gray-200 mt-1">
                                {download.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Need Help */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold mb-3">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  If you have questions about this information or need additional assistance, please contact us.
                </p>
                <a
                  href="/contact"
                  className="block w-full text-center bg-green-700 text-white py-2 px-4 rounded-lg hover:bg-green-800 transition-colors"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </div>

          {/* Mobile Sidebar Content */}
          <div className="lg:hidden space-y-6">
            {/* Related Links - Mobile */}
            {hasRelatedLinks && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-green-700 px-6 py-4">
                  <h3 className="font-semibold text-white text-lg">Related Links</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {pageData.related_links.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target={link.new_tab ? "_blank" : "_self"}
                      rel={link.new_tab ? "noopener noreferrer" : undefined}
                      className="flex items-center p-4 text-gray-700 hover:bg-green-700 hover:text-white transition-colors group"
                    >
                      <ExternalLink className="w-5 h-5 mr-3 flex-shrink-0 text-green-700 group-hover:text-white" />
                      <span className="font-medium">{link.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Related Downloads - Mobile */}
            {hasDownloads && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-green-700 px-6 py-4">
                  <h3 className="font-semibold text-white text-lg">Related Downloads</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {pageData.downloads.map((download, index) => (
                    <button
                      key={index}
                      onClick={() => handleDownload(download.download_url, download.filename)}
                      className="w-full text-left p-4 hover:bg-green-700 hover:text-white transition-colors group"
                    >
                      <div className="flex items-start">
                        <Download className="w-5 h-5 mr-3 text-green-700 group-hover:text-white flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-700 group-hover:text-white truncate">
                            {download.title}
                          </p>
                          {download.description && (
                            <p className="text-sm text-gray-500 group-hover:text-gray-200 mt-1">
                              {download.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Need Help - Mobile */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold mb-3">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                If you have questions about this information or need additional assistance, please contact us.
              </p>
              <a
                href="/contact"
                className="block w-full text-center bg-green-700 text-white py-2 px-4 rounded-lg hover:bg-green-800 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>

        {/* Page Information Section - Desktop - WITH ORANGE LEFT BORDER */}
        <div className="hidden lg:block mt-12">
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold mb-6">Page Information</h3>
              <div className="grid grid-cols-4 gap-8 text-sm">
                <div>
                  <span className="font-medium text-gray-700 block mb-2">Created:</span>
                  <p className="text-gray-600">{formatUKDate(pageData.creation_date)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 block mb-2">Approved:</span>
                  <p className="text-gray-600">{formatUKDate(pageData.approval_date)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 block mb-2">Updated:</span>
                  <p className="text-gray-600">{formatUKDate(pageData.updated_at)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 block mb-2">Next Review:</span>
                  <p className="text-gray-600">{formatUKDate(pageData.next_review_date)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Gallery Modal */}
      {galleryModal.isOpen && pageData.gallery_images && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-full p-4">
            {/* Close Button */}
            <button
              onClick={closeGallery}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X size={32} />
            </button>

            {/* Navigation Arrows */}
            {pageData.gallery_images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-400 hover:text-green-300 z-10"
                >
                  <ChevronLeft size={48} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-400 hover:text-green-300 z-10"
                >
                  <ChevronRight size={48} />
                </button>
              </>
            )}

            {/* Image */}
            <div className="text-center">
              <img
                src={getCorrectImageUrl(pageData.gallery_images[galleryModal.currentIndex].image_url)}
                alt={pageData.gallery_images[galleryModal.currentIndex].alt_text || pageData.gallery_images[galleryModal.currentIndex].title}
                className="max-w-full max-h-[70vh] object-contain mx-auto"
              />
              
              {/* Image Information */}
              <div className="mt-4 text-white">
                {pageData.gallery_images[galleryModal.currentIndex].title && (
                  <h3 className="text-xl font-semibold text-green-400 mb-2">
                    {pageData.gallery_images[galleryModal.currentIndex].title}
                  </h3>
                )}
                {pageData.gallery_images[galleryModal.currentIndex].description && (
                  <p className="text-gray-300">
                    {pageData.gallery_images[galleryModal.currentIndex].description}
                  </p>
                )}
                
                {/* Image Counter */}
                <div className="mt-4 text-sm text-gray-400">
                  {galleryModal.currentIndex + 1} of {pageData.gallery_images.length}
                </div>

                {/* Dot Navigation */}
                {pageData.gallery_images.length > 1 && (
                  <div className="flex justify-center mt-4 space-x-2">
                    {pageData.gallery_images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setGalleryModal(prev => ({ ...prev, currentIndex: index }))}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === galleryModal.currentIndex ? 'bg-green-400' : 'bg-gray-600 hover:bg-gray-500'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentDetailPage;

