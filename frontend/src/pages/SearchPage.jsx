import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Sparkles, Filter, X } from 'lucide-react';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { Breadcrumb } from '../components/Breadcrumb';
import { EmptyState } from '../components/EmptyState';
import { ProductSkeletonGrid } from '../components/SkeletonLoader';

export const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('q') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(query);
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await api.getProducts();
        if (res.success && res.data) {
          setProducts(res.data);
        }
      } catch (err) {
        console.error('Search fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const results = useMemo(() => {
    const qLower = query.toLowerCase().trim();
    if (!qLower) return products;
    return products
      .filter((p) => {
        return (
          p.name?.toLowerCase().includes(qLower) ||
          p.brand?.toLowerCase().includes(qLower) ||
          p.category?.toLowerCase().includes(qLower) ||
          p.subcategory?.toLowerCase().includes(qLower) ||
          p.description?.toLowerCase().includes(qLower)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'priceLow') return a.price - b.price;
        if (sortBy === 'priceHigh') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return 0;
      });
  }, [products, query, sortBy]);

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <Breadcrumb items={[{ label: 'Search Results', link: '/search' }, ...(query ? [{ label: `"${query}"` }] : [])]} />

      {/* Search Header Form */}
      <div style={{ maxWidth: '680px', margin: '1rem auto 2.5rem' }}>
        <form onSubmit={handleSearchSubmit} className="search-input-wrap">
          <Search size={20} className="search-icon-inside" />
          <input
            type="text"
            placeholder="Search products by keyword, category, or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="header-search-input"
            style={{ height: '54px', fontSize: '1.05rem', paddingLeft: '3.25rem' }}
          />
          {searchTerm && (
            <button type="button" onClick={() => setSearchTerm('')} className="search-clear-btn">
              <X size={18} />
            </button>
          )}
        </form>
      </div>

      <div className="catalog-top-bar">
        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)' }}>
            {query ? `Search results for: "${query}"` : 'All Search Catalog'}
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            Found <strong>{results.length}</strong> matching items
          </p>
        </div>

        {results.length > 0 && (
          <div className="sort-select-wrap">
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>
              SORT:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="custom-select"
            >
              <option value="featured">Relevance</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <ProductSkeletonGrid count={6} />
      ) : results.length > 0 ? (
        <div className="products-grid">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={`No products found for "${query}"`}
          subtitle="Check your spelling or search for general terms like 'Phone', 'Audio', or 'Laptop'."
          actionText="Explore All Products"
          actionLink="/products"
        />
      )}
    </div>
  );
};
