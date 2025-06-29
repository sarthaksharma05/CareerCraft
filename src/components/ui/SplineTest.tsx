import React from 'react';
import Spline from '@splinetool/react-spline';

export function SplineTest() {
  return (
    <div className="w-full h-96 bg-gradient-to-br from-emerald-400 via-cyan-400 to-teal-500 rounded-lg">
      <Spline 
        scene="https://prod.spline.design/SJ9QHB7RihFzvpdu/scene.splinecode"
        onLoad={() => console.log('Test scene loaded')}
        onError={(error) => console.error('Test scene error:', error)}
      />
    </div>
  );
} 