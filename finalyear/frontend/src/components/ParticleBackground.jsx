import React, { useMemo } from 'react';

const ParticleBackground = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 8,
      duration: Math.random() * 10 + 8,
      opacity: Math.random() * 0.3 + 0.05,
      color: ['#6366f1', '#8b5cf6', '#a855f7', '#22d3ee', '#818cf8'][Math.floor(Math.random() * 5)]
    }));
  }, []);

  return (
    <div className="particles-bg">
      {/* Ambient gradient orbs */}
      <div
        className="absolute rounded-full blur-[120px] animate-pulse"
        style={{
          width: '600px', height: '600px',
          top: '-10%', right: '-10%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)'
        }}
      />
      <div
        className="absolute rounded-full blur-[120px] animate-pulse"
        style={{
          width: '500px', height: '500px',
          bottom: '10%', left: '-5%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, transparent 70%)',
          animationDelay: '2s'
        }}
      />
      <div
        className="absolute rounded-full blur-[100px]"
        style={{
          width: '400px', height: '400px',
          top: '40%', left: '30%',
          background: 'radial-gradient(circle, rgba(34, 211, 238, 0.04) 0%, transparent 70%)',
          animation: 'float 12s ease-in-out infinite'
        }}
      />
      {/* Particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: p.color,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`
          }}
        />
      ))}
    </div>
  );
};

export default ParticleBackground;
