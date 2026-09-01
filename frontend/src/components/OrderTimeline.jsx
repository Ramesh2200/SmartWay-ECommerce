import React from 'react';
import { CheckCircle2, Circle, Clock, Package, Truck, Home } from 'lucide-react';

export const OrderTimeline = ({ currentStatus = 'COMPLETED' }) => {
  const steps = [
    { label: 'Order Placed', icon: Clock, completed: true },
    { label: 'Confirmed', icon: CheckCircle2, completed: true },
    { label: 'Packed', icon: Package, completed: true },
    { label: 'Shipped', icon: Truck, completed: currentStatus === 'SHIPPED' || currentStatus === 'COMPLETED' || currentStatus === 'DELIVERED' },
    { label: 'Delivered', icon: Home, completed: currentStatus === 'DELIVERED' || currentStatus === 'COMPLETED' }
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '2rem 0', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '20px', left: '5%', right: '5%', height: '3px', background: 'rgba(255,255,255,0.1)', zIndex: 1 }}>
        <div style={{ height: '100%', width: '100%', background: 'var(--gradient-primary)' }} />
      </div>

      {steps.map((step, idx) => (
        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: step.completed ? 'var(--primary)' : '#1F2937',
              border: `2px solid ${step.completed ? 'var(--primary-light)' : 'rgba(255,255,255,0.1)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              marginBottom: '0.5rem',
              boxShadow: step.completed ? 'var(--shadow-glow)' : 'none'
            }}
          >
            <step.icon size={20} />
          </div>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: step.completed ? '#fff' : 'var(--text-muted)' }}>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
};
