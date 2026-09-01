import React from 'react';
import { Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react';

export const BenefitsStrip = () => {
  const benefits = [
    {
      icon: Truck,
      colorClass: 'b-cyan',
      title: 'Free Express Shipping',
      description: 'On all orders above ₹999 across India'
    },
    {
      icon: ShieldCheck,
      colorClass: 'b-emerald',
      title: '100% Secure Payment',
      description: 'Protected with 256-bit SSL encryption'
    },
    {
      icon: RotateCcw,
      colorClass: 'b-amber',
      title: '7-Day Easy Returns',
      description: 'Hassle-free replacement guarantee'
    },
    {
      icon: Headphones,
      colorClass: 'b-purple',
      title: '24/7 Dedicated Support',
      description: 'Live email & chat assistance anytime'
    }
  ];

  return (
    <div className="benefits-strip">
      {benefits.map((b, idx) => (
        <div key={idx} className="benefit-item">
          <div className={`benefit-icon-box ${b.colorClass}`}>
            <b.icon size={26} />
          </div>
          <div>
            <h4 className="benefit-title">{b.title}</h4>
            <p className="benefit-sub">{b.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
