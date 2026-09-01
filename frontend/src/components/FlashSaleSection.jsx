import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight, Clock } from 'lucide-react';
import { ProductCard } from './ProductCard';

export const FlashSaleSection = ({ products = [] }) => {
  // 12-hour recurring countdown simulation
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 45,
    seconds: 30
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 12, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const flashProducts = products.slice(0, 4);

  return (
    <section className="flash-sale-wrapper">
      <div className="flash-sale-header">
        <div className="flash-title-wrap">
          <div className="flash-icon-box">
            <Zap size={26} fill="currentColor" />
          </div>
          <div>
            <h2 className="section-heading">Flash Deals 🔥</h2>
            <p className="text-muted">Limited time offer with extra discounts. Ends soon!</p>
          </div>
        </div>

        {/* Animated Countdown */}
        <div className="countdown-timer-group">
          <div className="timer-digit-box">
            <span className="timer-num">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="timer-label">Hours</span>
          </div>
          <span className="timer-colon">:</span>
          <div className="timer-digit-box">
            <span className="timer-num">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="timer-label">Mins</span>
          </div>
          <span className="timer-colon">:</span>
          <div className="timer-digit-box">
            <span className="timer-num">{String(timeLeft.seconds).padStart(2, '0')}</span>
            <span className="timer-label">Secs</span>
          </div>
        </div>
      </div>

      <div className="products-grid">
        {flashProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
};
