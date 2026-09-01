import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { IMAGES } from '../assets/images';

export const CategoryCard = ({ category }) => {
  const catData = IMAGES.categories[category.name] || {};
  const bgImage = category.image || catData.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80';
  const desc = category.desc || catData.desc || 'Explore top gear';

  return (
    <Link to={`/products?category=${encodeURIComponent(category.name)}`} className="category-card">
      <img src={bgImage} alt={category.name} className="category-bg-img" loading="lazy" />
      <div className="category-gradient-overlay" />

      <div className="category-card-content">
        <div className="category-icon-tag">
          {category.icon ? <category.icon size={22} /> : '🛍️'}
        </div>
        <h3 className="category-name">{category.name}</h3>
        <span className="category-sub-desc">
          {desc} <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
};
