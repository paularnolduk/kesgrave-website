import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Calendar, ExternalLink, Search, ArrowUp, Tag, Eye } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8027';

const ContentHubPage = () => {
  const [categories, setCategories] = useState([]);
  const [allPages, setAllPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [filteredPages, setFilteredPages] = useState([]);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Color palette for category cards
  const colorPalette = [
    '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', 
    '#1abc9c', '#e67e22', '#34495e', '#f1c40f', '#e91e63'
  ];

  // Categories to hide
  const hiddenCategories = ['News', 'Meetings'];

  useEffect(() => {
    fetchData();
    
    // Handle scroll for back to top button
    const handleScroll = () => {
      setShowBackToTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Filter content based on search term
    if (searchTerm.trim() === '') {
      setFilteredCategories(categories);
      setFilteredPages(allPages);
    } else {
      const searchLower = searchTerm.toLowerCase();
      
      // Filter categories
      const filteredCats = categories.filter(category =>
        category.name.toLowerCase().includes(searchLower) ||
        category.description?.toLowerCase().includes(searchLower) ||
        category.subcategories?.some(sub => 
          sub.name.toLowerCase().includes(searchLower) ||
          sub.description?.toLowerCase().includes(searchLower)
        )
      );
      
      // Filter pages
      const filteredPgs = allPages.filter(page =>
        page.title.toLowerCase().includes(searchLower) ||
        page.short_description?.toLowerCase().includes(searchLower) ||
        page.category?.name?.toLowerCase().includes(searchLower)
      );
      
      setFilteredCategories(filteredCats);
      setFilteredPages(filteredPgs);
    }
  }, [searchTerm, categories, allPages]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories and pages in parallel
      const [categoriesResponse, pagesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/content/categories`),
        fetch(`${API_BASE_URL}/api/content/pages`)
      ]);

      if (!categoriesResponse.ok || !pagesResponse.ok) {
        throw new Error('Failed to fetch content data');
      }

      const categoriesData = await categoriesResponse.json();
      const pagesData = await pagesResponse.json();

      console.log('Raw categories data:', categoriesData);
      console.log('Raw pages data:', pagesData);

      // Filter out hidden categories and assign colors
      const visibleCategories = categoriesData
        .filter(category => !hiddenCategories.includes(category.name))
        .map((category, index) => ({
          ...category,
          color: category.color || colorPalette[index % colorPalette.length],
          // Use the correct field names from API
          updated_at: category.last_updated || category.created_at
        }));

      console.log('Processed categories:', visibleCategories);
      console.log('All pages:', pagesData);

      setCategories(visibleCategories);
      setAllPages(pagesData);
      setFilteredCategories(visibleCategories);
      setFilteredPages(pagesData);

    } catch (err) {
      setError(err.message);
      console.error('Error fetching content data:', err);
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

  const scrollToCategory = (categoryId) => {
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCategoryPages = (categoryId) => {
    // Use the correct field structure from API - pages have category.id
    const pages = filteredPages.filter(page => {
      console.log(`Checking page ${page.title}: category.id=${page.category?.id}, looking for=${categoryId}`);
      return page.category && page.category.id === categoryId;
    });
    console.log(`Pages for category ${categoryId}:`, pages);
    return pages;
  };

  const getSubcategoryPages = (subcategoryId) => {
    // Use the correct field structure from API - pages have subcategory.id
    return filteredPages.filter(page => page.subcategory && page.subcategory.id === subcategoryId);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by useEffect
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-700"></div>
        <p className="ml-4 text-green-700">Loading content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-8 flex flex-col items-center justify-center text-red-600">
        <p className="text-lg">Error: {error}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-700 mb-4">
            Information Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find all council information, policies, documents, and services for Kesgrave Town Council. 
            Search our comprehensive information database.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for documents, policies, or information..."
                className="w-full pl-12 pr-24 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-800 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
          {searchTerm && (
            <p className="text-sm text-gray-600 mt-2 text-center">
              {filteredCategories.length + filteredPages.length} results found for "{searchTerm}"
            </p>
          )}
        </div>

        {/* Category Cards - Compact Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredCategories.map((category) => {
            const categoryPages = getCategoryPages(category.id);
            const hasSubcategories = category.subcategories && category.subcategories.length > 0;
            const hasContent = categoryPages.length > 0 || hasSubcategories;
            
            return (
              <Card 
                key={category.id} 
                className="hover:shadow-lg transition-all duration-300 border-l-4 group"
                style={{ borderLeftColor: category.color }}
              >
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-center mb-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <FileText className="w-5 h-5" style={{ color: category.color }} />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="text-lg font-semibold text-gray-800 leading-tight truncate" title={category.name}>
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {category.page_count} page{category.page_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {category.description || 'No description available'}
                  </p>
                  
                  {/* Footer with subcategories and view button */}
                  <div className="flex items-center justify-between">
                    {/* Subcategories indicator */}
                    {hasSubcategories ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border"
                        style={{ 
                          borderColor: '#f39c12',
                          color: '#f39c12',
                          backgroundColor: '#f39c1210'
                        }}
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {category.subcategories.length} Related
                      </span>
                    ) : (
                      <div></div>
                    )}
                    
                    {hasContent && (
                      <button
                        onClick={() => scrollToCategory(category.id)}
                        className="flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors text-white hover:opacity-90"
                        style={{ backgroundColor: category.color }}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* No results message */}
        {searchTerm && filteredCategories.length === 0 && filteredPages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No results found for "{searchTerm}"</p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 text-green-700 hover:text-green-800 underline"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Category Sections */}
        {filteredCategories.map((category) => {
          const categoryPages = getCategoryPages(category.id);
          const hasDirectPages = categoryPages.length > 0;
          const hasSubcategoryPages = category.subcategories && category.subcategories.some(sub => getSubcategoryPages(sub.id).length > 0);
          const hasContent = hasDirectPages || hasSubcategoryPages;
          
          console.log(`Category ${category.name}: hasDirectPages=${hasDirectPages}, hasSubcategoryPages=${hasSubcategoryPages}, hasContent=${hasContent}`);
          
          if (!hasContent) return null;

          return (
            <section key={category.id} id={`category-${category.id}`} className="mb-16">
              <div className="border-t-4 pt-8" style={{ borderTopColor: category.color }}>
                <div className="flex items-center mb-6">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center mr-4"
                    style={{ backgroundColor: category.color }}
                  >
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800">{category.name}</h2>
                </div>
                <p className="text-lg text-gray-600 mb-8">{category.description}</p>
                
                {/* Direct category pages */}
                {hasDirectPages && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Pages</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {categoryPages.map((page) => (
                        <Card key={page.id} className="hover:shadow-md transition-shadow h-full">
                          <CardContent className="p-6 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="text-lg font-semibold">{page.title}</h4>
                              <ExternalLink className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            </div>
                            <p className="text-gray-600 mb-4 flex-grow line-clamp-3">
                              {page.short_description}
                            </p>
                            <div className="flex justify-between items-center mt-auto">
                              <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>Updated {formatUKDate(page.updated_at)}</span>
                              </div>
                              <a
                                href={`/content/${page.slug}`}
                                className="text-white px-4 py-2 rounded-md hover:opacity-90 transition-colors text-sm"
                                style={{ backgroundColor: category.color }}
                              >
                                View Page
                              </a>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subcategory sections */}
                {category.subcategories && category.subcategories.map((subcategory) => {
                  const subcategoryPages = getSubcategoryPages(subcategory.id);
                  if (subcategoryPages.length === 0) return null;

                  return (
                    <div key={subcategory.id} className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <Tag className="w-5 h-5 mr-2" style={{ color: category.color }} />
                        {subcategory.name}
                      </h3>
                      {subcategory.description && (
                        <p className="text-gray-600 mb-4">{subcategory.description}</p>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {subcategoryPages.map((page) => (
                          <Card key={page.id} className="hover:shadow-md transition-shadow h-full">
                            <CardContent className="p-6 flex flex-col h-full">
                              <div className="flex justify-between items-start mb-3">
                                <h4 className="text-lg font-semibold">{page.title}</h4>
                                <ExternalLink className="w-5 h-5 text-gray-400 flex-shrink-0" />
                              </div>
                              <p className="text-gray-600 mb-4 flex-grow line-clamp-3">
                                {page.short_description}
                              </p>
                              <div className="flex justify-between items-center mt-auto">
                                <div className="flex items-center text-sm text-gray-500">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  <span>Updated {formatUKDate(page.updated_at)}</span>
                                </div>
                                <a
                                  href={`/content/${page.slug}`}
                                  className="text-white px-4 py-2 rounded-md hover:opacity-90 transition-colors text-sm"
                                  style={{ backgroundColor: category.color }}
                                >
                                  View Page
                                </a>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Back to Top Button */}
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 bg-green-700 text-white p-3 rounded-full shadow-lg hover:bg-green-800 transition-colors z-50"
            title="Back to Top"
          >
            <ArrowUp className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ContentHubPage;

