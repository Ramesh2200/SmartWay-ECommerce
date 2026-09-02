import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  SlidersHorizontal,
  ChevronRight,
  Search,
  Check,
  X,
  Star,
  RotateCcw,
  Sparkles,
  Filter,
  CheckSquare,
  Square,
  Flame,
  Tag,
  Package,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { Breadcrumb } from '../components/Breadcrumb';
import { EmptyState } from '../components/EmptyState';
import { ProductSkeletonGrid } from '../components/SkeletonLoader';

export const ProductsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  // URL Query Parameters
  const initialCategory = queryParams.get('category') || 'All';
  const initialSubcategory = queryParams.get('subcategory') || 'All';
  const initialBrand = queryParams.get('brand') || 'All';
  const initialMinPrice = queryParams.get('minPrice') || '';
  const initialMaxPrice = queryParams.get('maxPrice') || '';
  const initialRating = queryParams.get('rating') ? Number(queryParams.get('rating')) : 0;
  const initialDiscount = queryParams.get('discount') ? Number(queryParams.get('discount')) : 0;
  const initialAvailability = queryParams.get('availability') || 'all';
  const initialOffer = queryParams.get('offer') || (queryParams.get('deals') === 'true' ? 'deals' : '');
  const initialSearch = queryParams.get('search') || queryParams.get('q') || '';
  const initialSort = queryParams.get('sort') || 'featured';

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState(initialSubcategory);
  const [selectedBrands, setSelectedBrands] = useState(
    initialBrand === 'All' ? [] : initialBrand.split(',').map((b) => b.trim()).filter(Boolean)
  );
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [minRating, setMinRating] = useState(initialRating);
  const [minDiscount, setMinDiscount] = useState(initialDiscount);
  const [availability, setAvailability] = useState(initialAvailability);
  const [offer, setOffer] = useState(initialOffer);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState(initialSort);

  // Accordion State (DEFAULT: ALL CLOSED null, only 1 open at a time!)
  const [openAccordion, setOpenAccordion] = useState(null);

  // Brand search & pagination inside Brand accordion
  const [brandSearch, setBrandSearch] = useState('');
  const [showAllBrands, setShowAllBrands] = useState(false);

  // Mobile Filter Sheet
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Data from Master Backend API
  const [products, setProducts] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    subcategories: [],
    brands: [],
    priceRange: { min: 0, max: 300000 },
    ratings: [],
    discounts: [],
    availability: [],
    offers: [],
    totalProducts: 101
  });
  const [loading, setLoading] = useState(true);

  // Toggle single accordion (closing previously opened one)
  const toggleAccordion = (name) => {
    setOpenAccordion((prev) => (prev === name ? null : name));
  };

  // Sync state if URL changes (e.g. Back/Forward button)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSelectedCategory(params.get('category') || 'All');
    setSelectedSubcategory(params.get('subcategory') || 'All');
    const brandParam = params.get('brand') || 'All';
    setSelectedBrands(brandParam === 'All' ? [] : brandParam.split(',').map((b) => b.trim()).filter(Boolean));
    setMinPrice(params.get('minPrice') || '');
    setMaxPrice(params.get('maxPrice') || '');
    setMinRating(params.get('rating') ? Number(params.get('rating')) : 0);
    setMinDiscount(params.get('discount') ? Number(params.get('discount')) : 0);
    setAvailability(params.get('availability') || 'all');
    setOffer(params.get('offer') || (params.get('deals') === 'true' ? 'deals' : ''));
    setSearchQuery(params.get('search') || params.get('q') || '');
    setSortBy(params.get('sort') || 'featured');
  }, [location.search]);

  // Load Filter Options & Products from Unified Database API
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const [optRes, prodRes] = await Promise.all([
          api.getFilterOptions(selectedCategory),
          api.getProducts({
            search: searchQuery,
            category: selectedCategory,
            subcategory: selectedSubcategory,
            brand: selectedBrands.length > 0 ? selectedBrands.join(',') : 'All',
            minPrice,
            maxPrice,
            rating: minRating > 0 ? minRating : undefined,
            discount: minDiscount > 0 ? minDiscount : undefined,
            availability,
            offer,
            sort: sortBy
          })
        ]);

        if (isMounted) {
          if (optRes && optRes.success && optRes.data) {
            setFilterOptions(optRes.data);
          }
          if (prodRes && prodRes.success && prodRes.data) {
            setProducts(prodRes.data);
          }
        }
      } catch (err) {
        console.error('Error fetching master products data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [
    selectedCategory,
    selectedSubcategory,
    selectedBrands,
    minPrice,
    maxPrice,
    minRating,
    minDiscount,
    availability,
    offer,
    searchQuery,
    sortBy
  ]);

  // Push filter state to URL (for sharing, back/forward history)
  const syncUrlParams = (updates = {}) => {
    const params = new URLSearchParams();
    const newCategory = updates.category !== undefined ? updates.category : selectedCategory;
    const newSubcategory = updates.subcategory !== undefined ? updates.subcategory : selectedSubcategory;
    const newBrands = updates.brands !== undefined ? updates.brands : selectedBrands;
    const newMinPrice = updates.minPrice !== undefined ? updates.minPrice : minPrice;
    const newMaxPrice = updates.maxPrice !== undefined ? updates.maxPrice : maxPrice;
    const newRating = updates.rating !== undefined ? updates.rating : minRating;
    const newDiscount = updates.discount !== undefined ? updates.discount : minDiscount;
    const newAvailability = updates.availability !== undefined ? updates.availability : availability;
    const newOffer = updates.offer !== undefined ? updates.offer : offer;
    const newSearch = updates.search !== undefined ? updates.search : searchQuery;
    const newSort = updates.sort !== undefined ? updates.sort : sortBy;

    if (newCategory && newCategory !== 'All') params.set('category', newCategory);
    if (newSubcategory && newSubcategory !== 'All') params.set('subcategory', newSubcategory);
    if (newBrands && newBrands.length > 0) params.set('brand', newBrands.join(','));
    if (newMinPrice) params.set('minPrice', newMinPrice);
    if (newMaxPrice) params.set('maxPrice', newMaxPrice);
    if (newRating > 0) params.set('rating', newRating.toString());
    if (newDiscount > 0) params.set('discount', newDiscount.toString());
    if (newAvailability && newAvailability !== 'all') params.set('availability', newAvailability);
    if (newOffer) params.set('offer', newOffer);
    if (newSearch) params.set('search', newSearch);
    if (newSort && newSort !== 'featured') params.set('sort', newSort);

    const queryString = params.toString();
    navigate(`/products${queryString ? `?${queryString}` : ''}`, { replace: true });
  };

  // Handlers for filter actions
  const handleCategorySelect = (catName) => {
    setSelectedCategory(catName);
    setSelectedSubcategory('All');
    syncUrlParams({ category: catName, subcategory: 'All' });
  };

  const handleSubcategorySelect = (subName) => {
    setSelectedSubcategory(subName);
    syncUrlParams({ subcategory: subName });
  };

  const handleBrandToggle = (brandName) => {
    let nextBrands;
    if (brandName === 'All') {
      nextBrands = [];
    } else if (selectedBrands.includes(brandName)) {
      nextBrands = selectedBrands.filter((b) => b !== brandName);
    } else {
      nextBrands = [...selectedBrands, brandName];
    }
    setSelectedBrands(nextBrands);
    syncUrlParams({ brands: nextBrands });
  };

  const handleRatingSelect = (rate) => {
    const nextRate = minRating === rate ? 0 : rate;
    setMinRating(nextRate);
    syncUrlParams({ rating: nextRate });
  };

  const handleDiscountSelect = (disc) => {
    const nextDisc = minDiscount === disc ? 0 : disc;
    setMinDiscount(nextDisc);
    syncUrlParams({ discount: nextDisc });
  };

  const handleAvailabilitySelect = (avail) => {
    const nextAvail = availability === avail ? 'all' : avail;
    setAvailability(nextAvail);
    syncUrlParams({ availability: nextAvail });
  };

  const handleOfferSelect = (off) => {
    const nextOff = offer === off ? '' : off;
    setOffer(nextOff);
    syncUrlParams({ offer: nextOff });
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortBy(newSort);
    syncUrlParams({ sort: newSort });
  };

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setSelectedSubcategory('All');
    setSelectedBrands([]);
    setMinPrice('');
    setMaxPrice('');
    setMinRating(0);
    setMinDiscount(0);
    setAvailability('all');
    setOffer('');
    setSearchQuery('');
    setBrandSearch('');
    // Keep sort as is unless reset
    const params = new URLSearchParams();
    if (sortBy && sortBy !== 'featured') params.set('sort', sortBy);
    navigate(`/products${params.toString() ? `?${params.toString()}` : ''}`);
  };

  // Active filters detection for chips
  const activeChips = useMemo(() => {
    const chips = [];
    if (searchQuery.trim()) {
      chips.push({
        id: 'search',
        label: `Search: "${searchQuery}"`,
        onRemove: () => { setSearchQuery(''); syncUrlParams({ search: '' }); }
      });
    }
    if (selectedCategory && selectedCategory !== 'All') {
      chips.push({
        id: 'category',
        label: selectedCategory,
        onRemove: () => handleCategorySelect('All')
      });
    }
    if (selectedSubcategory && selectedSubcategory !== 'All') {
      chips.push({
        id: 'subcategory',
        label: selectedSubcategory,
        onRemove: () => handleSubcategorySelect('All')
      });
    }
    selectedBrands.forEach((b) => {
      chips.push({
        id: `brand-${b}`,
        label: b,
        onRemove: () => handleBrandToggle(b)
      });
    });
    if (minPrice || maxPrice) {
      const minText = minPrice ? `₹${Number(minPrice).toLocaleString('en-IN')}` : '₹0';
      const maxText = maxPrice ? `₹${Number(maxPrice).toLocaleString('en-IN')}` : 'Max';
      chips.push({
        id: 'price',
        label: `${minText} - ${maxText}`,
        onRemove: () => { setMinPrice(''); setMaxPrice(''); syncUrlParams({ minPrice: '', maxPrice: '' }); }
      });
    }
    if (minRating > 0) {
      chips.push({
        id: 'rating',
        label: `${minRating}★ & Up`,
        onRemove: () => handleRatingSelect(0)
      });
    }
    if (minDiscount > 0) {
      chips.push({
        id: 'discount',
        label: `${minDiscount}%+ Off`,
        onRemove: () => handleDiscountSelect(0)
      });
    }
    if (availability && availability !== 'all') {
      chips.push({
        id: 'availability',
        label: availability === 'inStock' ? 'In Stock' : 'Out of Stock',
        onRemove: () => handleAvailabilitySelect('all')
      });
    }
    if (offer) {
      const offerLabel = offer === 'deals' ? 'Deals & Offers' : (offer === 'featured' ? 'Featured' : 'Best Sellers');
      chips.push({
        id: 'offer',
        label: offerLabel,
        onRemove: () => handleOfferSelect('')
      });
    }
    return chips;
  }, [
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    selectedBrands,
    minPrice,
    maxPrice,
    minRating,
    minDiscount,
    availability,
    offer
  ]);

  // Filtered brand list according to brand search inside accordion
  const displayedBrands = useMemo(() => {
    let list = filterOptions.brands || [];
    if (brandSearch.trim()) {
      const term = brandSearch.toLowerCase().trim();
      list = list.filter((b) => b.name.toLowerCase().includes(term));
    }
    if (!showAllBrands && list.length > 8) {
      return list.slice(0, 8);
    }
    return list;
  }, [filterOptions.brands, brandSearch, showAllBrands]);

  // Subcategories relevant to active category
  const activeSubcategories = useMemo(() => {
    if (selectedCategory === 'All') return [];
    return (filterOptions.subcategories || []).filter(
      (s) => s.categoryName?.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [filterOptions.subcategories, selectedCategory]);

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <Breadcrumb
        items={[
          { label: 'Shop', link: '/products' },
          ...(selectedCategory !== 'All' ? [{ label: selectedCategory }] : [])
        ]}
      />

      {/* TOP TOOLBAR */}
      <div className="catalog-top-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', padding: '1.25rem 0 1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            {selectedCategory === 'All' ? 'Complete Product Catalog' : selectedCategory}
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Showing <strong style={{ color: '#fff' }}>{products.length}</strong> available products
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Mobile Filter Trigger */}
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="btn btn-secondary btn-sm mobile-only"
            style={{ display: 'none', alignItems: 'center', gap: '0.5rem' }}
          >
            <Filter size={16} /> Filters {activeChips.length > 0 && `(${activeChips.length})`}
          </button>

          {/* Sort By Dropdown (Strictly separated from filters) */}
          <div className="sort-select-wrap" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              SORT BY:
            </span>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="custom-select"
              style={{ minWidth: '210px', height: '42px', fontSize: '0.9rem', fontWeight: 600, background: '#0D1424', color: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0 0.85rem' }}
            >
              <option value="featured">Featured & Recommended</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="rating">Top Customer Rated</option>
              <option value="discount">Highest Discount</option>
              <option value="newest">Newest Arrivals</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* ACTIVE FILTER CHIPS (Displayed only if filters are active) */}
      {activeChips.length > 0 && (
        <div className="active-filters-container">
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '0.25rem' }}>
            Active Filters:
          </span>
          {activeChips.map((chip) => (
            <div key={chip.id} className="active-filter-chip">
              <span>{chip.label}</span>
              <button onClick={chip.onRemove} aria-label={`Remove filter ${chip.label}`}>
                <X size={14} />
              </button>
            </div>
          ))}
          <button
            onClick={clearAllFilters}
            className="btn-clear-filter"
            style={{ marginLeft: 'auto', fontSize: '0.82rem' }}
          >
            Clear All
          </button>
        </div>
      )}

      {/* MAIN LAYOUT: SIDEBAR ACCORDION + PRODUCT GRID */}
      <div className="catalog-layout" style={{ display: 'grid', gridTemplateColumns: '290px 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* COMPACT FILTER SIDEBAR (Accordion Model: default all closed, only 1 open at a time) */}
        <aside className="filter-sidebar desktop-only">
          <div className="filter-header">
            <span className="filter-title">
              <SlidersHorizontal size={18} /> FILTERS
            </span>
            {activeChips.length > 0 && (
              <button onClick={clearAllFilters} className="btn-clear-filter">
                Reset
              </button>
            )}
          </div>

          {/* Search in Catalog Input */}
          <div>
            <div className="input-with-icon">
              <Search size={16} className="input-icon" />
              <input
                type="text"
                placeholder="Search products, brands..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  syncUrlParams({ search: e.target.value });
                }}
                style={{ height: '40px', fontSize: '0.88rem', paddingLeft: '2.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: '#fff' }}
              />
            </div>
          </div>

          {/* ACCORDIONS */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>

            {/* 1. CATEGORIES ACCORDION */}
            <div className="filter-accordion-item">
              <button
                className={`filter-accordion-header ${openAccordion === 'categories' ? 'active' : ''}`}
                onClick={() => toggleAccordion('categories')}
              >
                <span>Categories</span>
                <ChevronRight size={18} className="chevron-icon" />
              </button>

              {openAccordion === 'categories' && (
                <div className="filter-accordion-body">
                  {/* All Products Option */}
                  <div
                    onClick={() => handleCategorySelect('All')}
                    className={`filter-option-item ${selectedCategory === 'All' ? 'active' : ''}`}
                  >
                    <span>All Products</span>
                    <span className="filter-option-count">({filterOptions.totalProducts || 101})</span>
                  </div>

                  {/* Individual Categories */}
                  {(filterOptions.categories || []).map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.name)}
                      className={`filter-option-item ${selectedCategory === cat.name ? 'active' : ''}`}
                    >
                      <span>{cat.name}</span>
                      <span className="filter-option-count">({cat.count})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. SUBCATEGORIES ACCORDION */}
            <div className="filter-accordion-item">
              <button
                className={`filter-accordion-header ${openAccordion === 'subcategories' ? 'active' : ''}`}
                onClick={() => toggleAccordion('subcategories')}
              >
                <span>Subcategories</span>
                <ChevronRight size={18} className="chevron-icon" />
              </button>

              {openAccordion === 'subcategories' && (
                <div className="filter-accordion-body">
                  {selectedCategory === 'All' ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '0.5rem 0.25rem', fontStyle: 'italic' }}>
                      Select a category to view subcategories.
                    </p>
                  ) : activeSubcategories.length > 0 ? (
                    <>
                      <div
                        onClick={() => handleSubcategorySelect('All')}
                        className={`filter-option-item ${selectedSubcategory === 'All' ? 'active' : ''}`}
                      >
                        <span>All {selectedCategory}</span>
                      </div>
                      {activeSubcategories.map((sub) => (
                        <div
                          key={sub.id}
                          onClick={() => handleSubcategorySelect(sub.name)}
                          className={`filter-option-item ${selectedSubcategory === sub.name ? 'active' : ''}`}
                        >
                          <span>{sub.name}</span>
                          <span className="filter-option-count">({sub.count})</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>
                      No subcategories available.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* 3. BRANDS ACCORDION */}
            <div className="filter-accordion-item">
              <button
                className={`filter-accordion-header ${openAccordion === 'brands' ? 'active' : ''}`}
                onClick={() => toggleAccordion('brands')}
              >
                <span>Brands</span>
                <ChevronRight size={18} className="chevron-icon" />
              </button>

              {openAccordion === 'brands' && (
                <div className="filter-accordion-body">
                  {/* Search Brands Box */}
                  <div style={{ marginBottom: '0.65rem' }}>
                    <div className="input-with-icon">
                      <Search size={14} className="input-icon" />
                      <input
                        type="text"
                        placeholder="Search brands..."
                        value={brandSearch}
                        onChange={(e) => setBrandSearch(e.target.value)}
                        style={{ height: '34px', fontSize: '0.82rem', paddingLeft: '2.2rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                      />
                    </div>
                  </div>

                  {/* All Brands Toggle */}
                  <div
                    onClick={() => handleBrandToggle('All')}
                    className={`filter-option-item ${selectedBrands.length === 0 ? 'active' : ''}`}
                  >
                    <span>All Brands</span>
                    <span className="filter-option-count">({filterOptions.totalProducts})</span>
                  </div>

                  {/* Dynamic Database Brands List with Multi-Select Checkboxes */}
                  <div style={{ maxHeight: '220px', overflowY: 'auto', paddingRight: '2px' }}>
                    {displayedBrands.map((b) => {
                      const isChecked = selectedBrands.includes(b.name);
                      return (
                        <div
                          key={b.id}
                          onClick={() => handleBrandToggle(b.name)}
                          className={`filter-option-item ${isChecked ? 'active' : ''}`}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {isChecked ? (
                              <CheckSquare size={16} color="var(--primary-light)" />
                            ) : (
                              <Square size={16} color="var(--text-muted)" />
                            )}
                            <span>{b.name}</span>
                          </div>
                          <span className="filter-option-count">({b.count})</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Show More / Show Less Button */}
                  {(filterOptions.brands || []).length > 8 && !brandSearch && (
                    <button
                      onClick={() => setShowAllBrands(!showAllBrands)}
                      style={{ background: 'none', border: 'none', color: 'var(--primary-light)', fontSize: '0.82rem', fontWeight: 700, padding: '0.5rem 0.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      {showAllBrands ? 'Show Less ↑' : `Show More (${(filterOptions.brands || []).length - 8} more) ↓`}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 4. PRICE RANGE ACCORDION */}
            <div className="filter-accordion-item">
              <button
                className={`filter-accordion-header ${openAccordion === 'price' ? 'active' : ''}`}
                onClick={() => toggleAccordion('price')}
              >
                <span>Price Range</span>
                <ChevronRight size={18} className="chevron-icon" />
              </button>

              {openAccordion === 'price' && (
                <div className="filter-accordion-body">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                        Minimum (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="₹ 0"
                        value={minPrice}
                        onChange={(e) => {
                          setMinPrice(e.target.value);
                          syncUrlParams({ minPrice: e.target.value });
                        }}
                        style={{ width: '100%', height: '36px', fontSize: '0.85rem', padding: '0 0.5rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                        Maximum (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="₹ 300,000"
                        value={maxPrice}
                        onChange={(e) => {
                          setMaxPrice(e.target.value);
                          syncUrlParams({ maxPrice: e.target.value });
                        }}
                        style={{ width: '100%', height: '36px', fontSize: '0.85rem', padding: '0 0.5rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                      />
                    </div>
                  </div>

                  {/* Dual Price Quick Preset Pills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {[
                      { label: 'Under ₹500', min: '', max: '500' },
                      { label: '₹500 - ₹5,000', min: '500', max: '5000' },
                      { label: '₹5k - ₹25k', min: '5000', max: '25000' },
                      { label: '₹25k - ₹100k', min: '25000', max: '100000' }
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setMinPrice(preset.min);
                          setMaxPrice(preset.max);
                          syncUrlParams({ minPrice: preset.min, maxPrice: preset.max });
                        }}
                        style={{
                          background: minPrice === preset.min && maxPrice === preset.max ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.04)',
                          border: '1px solid ' + (minPrice === preset.min && maxPrice === preset.max ? 'var(--primary-light)' : 'var(--border-subtle)'),
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          color: minPrice === preset.min && maxPrice === preset.max ? '#fff' : 'var(--text-secondary)',
                          padding: '0.25rem 0.5rem',
                          cursor: 'pointer'
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 5. CUSTOMER RATING ACCORDION */}
            <div className="filter-accordion-item">
              <button
                className={`filter-accordion-header ${openAccordion === 'rating' ? 'active' : ''}`}
                onClick={() => toggleAccordion('rating')}
              >
                <span>Customer Rating</span>
                <ChevronRight size={18} className="chevron-icon" />
              </button>

              {openAccordion === 'rating' && (
                <div className="filter-accordion-body">
                  {(filterOptions.ratings || []).map((r) => {
                    const isSelected = minRating === r.rating;
                    return (
                      <div
                        key={r.rating}
                        onClick={() => handleRatingSelect(r.rating)}
                        className={`filter-option-item ${isSelected ? 'active' : ''}`}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <div style={{ display: 'flex', gap: '1px' }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                fill={i < Math.floor(r.rating) ? '#FBBF24' : 'none'}
                                color="#FBBF24"
                              />
                            ))}
                          </div>
                          <span>{r.label}</span>
                        </div>
                        <span className="filter-option-count">({r.count})</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 6. DISCOUNT ACCORDION */}
            <div className="filter-accordion-item">
              <button
                className={`filter-accordion-header ${openAccordion === 'discount' ? 'active' : ''}`}
                onClick={() => toggleAccordion('discount')}
              >
                <span>Discount</span>
                <ChevronRight size={18} className="chevron-icon" />
              </button>

              {openAccordion === 'discount' && (
                <div className="filter-accordion-body">
                  <div
                    onClick={() => handleDiscountSelect(0)}
                    className={`filter-option-item ${minDiscount === 0 ? 'active' : ''}`}
                  >
                    <span>Any Discount</span>
                    <span className="filter-option-count">({filterOptions.totalProducts})</span>
                  </div>

                  {(filterOptions.discounts || []).map((d) => {
                    const isSelected = minDiscount === d.discount;
                    return (
                      <div
                        key={d.discount}
                        onClick={() => handleDiscountSelect(d.discount)}
                        className={`filter-option-item ${isSelected ? 'active' : ''}`}
                      >
                        <span>{d.label}</span>
                        <span className="filter-option-count">({d.count})</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 7. AVAILABILITY ACCORDION */}
            <div className="filter-accordion-item">
              <button
                className={`filter-accordion-header ${openAccordion === 'availability' ? 'active' : ''}`}
                onClick={() => toggleAccordion('availability')}
              >
                <span>Availability</span>
                <ChevronRight size={18} className="chevron-icon" />
              </button>

              {openAccordion === 'availability' && (
                <div className="filter-accordion-body">
                  <div
                    onClick={() => handleAvailabilitySelect('all')}
                    className={`filter-option-item ${availability === 'all' ? 'active' : ''}`}
                  >
                    <span>All</span>
                    <span className="filter-option-count">({filterOptions.totalProducts})</span>
                  </div>

                  {(filterOptions.availability || []).map((st) => {
                    const isSelected = availability === st.key;
                    return (
                      <div
                        key={st.key}
                        onClick={() => handleAvailabilitySelect(st.key)}
                        className={`filter-option-item ${isSelected ? 'active' : ''}`}
                      >
                        <span>{st.label}</span>
                        <span className="filter-option-count">({st.count})</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 8. OFFERS ACCORDION */}
            <div className="filter-accordion-item">
              <button
                className={`filter-accordion-header ${openAccordion === 'offers' ? 'active' : ''}`}
                onClick={() => toggleAccordion('offers')}
              >
                <span>Offers</span>
                <ChevronRight size={18} className="chevron-icon" />
              </button>

              {openAccordion === 'offers' && (
                <div className="filter-accordion-body">
                  {(filterOptions.offers || []).map((off) => {
                    const isSelected = offer === off.key;
                    return (
                      <div
                        key={off.key}
                        onClick={() => handleOfferSelect(off.key)}
                        className={`filter-option-item ${isSelected ? 'active' : ''}`}
                      >
                        <span>{off.label}</span>
                        <span className="filter-option-count">({off.count})</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* BOTTOM BUTTONS */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            <button
              onClick={clearAllFilters}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1 }}
            >
              Clear All
            </button>
            <button
              onClick={() => { setOpenAccordion(null); }}
              className="btn btn-primary btn-sm"
              style={{ flex: 1 }}
            >
              Apply Filters
            </button>
          </div>
        </aside>

        {/* MAIN PRODUCT GRID (4 per row desktop, 3 tablet, 2 mobile) */}
        <main>
          {loading ? (
            <ProductSkeletonGrid count={8} />
          ) : products.length > 0 ? (
            <div className="products-grid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Products Match Your Filters"
              subtitle="Try adjusting or clearing your active filters to explore our complete catalog."
              actionText="Reset All Filters"
              actionLink="/products"
              onAction={clearAllFilters}
            />
          )}
        </main>
      </div>

      {/* MOBILE BOTTOM SHEET MODAL */}
      {mobileDrawerOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileDrawerOpen(false)}>
          <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '85vh', overflowY: 'auto' }}>
            <div className="mobile-drawer-header">
              <span className="brand-title">Filters ({products.length})</span>
              <button onClick={() => setMobileDrawerOpen(false)} className="btn-close-drawer">
                <X size={22} />
              </button>
            </div>

            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Category selector */}
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>Categories</span>
                <div style={{ marginTop: '0.5rem' }}>
                  <div
                    onClick={() => handleCategorySelect('All')}
                    className={`filter-option-item ${selectedCategory === 'All' ? 'active' : ''}`}
                  >
                    <span>All Products</span>
                  </div>
                  {(filterOptions.categories || []).map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.name)}
                      className={`filter-option-item ${selectedCategory === cat.name ? 'active' : ''}`}
                    >
                      <span>{cat.name}</span>
                      <span className="filter-option-count">({cat.count})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sticky bottom actions */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={() => { clearAllFilters(); setMobileDrawerOpen(false); }}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Clear All
                </button>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Apply ({products.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
