import React, { useState } from 'react';

const CATEGORY_FALLBACKS = {
  electronics: '/images/fallback/electronics.svg',
  fashion: '/images/fallback/fashion.svg',
  'home & living': '/images/fallback/home.svg',
  'home-living': '/images/fallback/home.svg',
  'beauty & care': '/images/fallback/beauty.svg',
  'beauty & personal care': '/images/fallback/beauty.svg',
  'beauty-care': '/images/fallback/beauty.svg',
  'sports & fitness': '/images/fallback/sports.svg',
  'sports & outdoors': '/images/fallback/sports.svg',
  'sports-fitness': '/images/fallback/sports.svg',
  automotive: '/images/fallback/automotive.svg',
  'toys & games': '/images/fallback/toys.svg',
  'toys-games': '/images/fallback/toys.svg',
  'books & stationery': '/images/fallback/books.svg',
  'books-stationery': '/images/fallback/books.svg',
  accessories: '/images/fallback/accessories.svg'
};

const GENERIC_FALLBACK = '/images/fallback/generic.svg';

export const getCategoryFallback = (category) => {
  if (!category) return GENERIC_FALLBACK;
  const key = category.toLowerCase().trim();
  return CATEGORY_FALLBACKS[key] || GENERIC_FALLBACK;
};

export const ProductImage = ({
  src,
  alt = 'Product image',
  category = '',
  gallery = [],
  className = '',
  style = {},
  objectFit = 'contain',
  aspectRatio = '1 / 1'
}) => {
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [useCategoryFallback, setUseCategoryFallback] = useState(false);
  const [useGenericFallback, setUseGenericFallback] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Determine current image source candidate
  let currentSrc = src;
  if (useGenericFallback) {
    currentSrc = GENERIC_FALLBACK;
  } else if (useCategoryFallback) {
    currentSrc = getCategoryFallback(category);
  } else if (galleryIndex > 0 && Array.isArray(gallery) && gallery[galleryIndex]) {
    currentSrc = gallery[galleryIndex];
  }

  const handleError = () => {
    // Step 1: Try next gallery image if available
    if (Array.isArray(gallery) && galleryIndex + 1 < gallery.length) {
      setGalleryIndex(prev => prev + 1);
      return;
    }
    // Step 2: Try category fallback
    if (!useCategoryFallback) {
      setUseCategoryFallback(true);
      return;
    }
    // Step 3: Generic fallback
    if (!useGenericFallback) {
      setUseGenericFallback(true);
    }
  };

  return (
    <div
      className={`product-img-wrapper ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: aspectRatio,
        background: 'radial-gradient(circle at 50% 50%, #172033 0%, #0D1424 100%)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}
    >
      {/* Shimmer skeleton before image loads */}
      {!loaded && (
        <div
          className="skeleton-shimmer"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite linear',
            zIndex: 1
          }}
        />
      )}

      <img
        src={currentSrc || getCategoryFallback(category)}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={handleError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: objectFit,
          padding: objectFit === 'contain' ? '0.6rem' : '0',
          transition: 'transform 0.4s ease, opacity 0.3s ease',
          opacity: loaded ? 1 : 0,
          zIndex: 2
        }}
      />
    </div>
  );
};
