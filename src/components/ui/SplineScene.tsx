import React, { Suspense, useState } from 'react';
import Spline from '@splinetool/react-spline';

interface SplineSceneProps {
  scene: string;
  className?: string;
  style?: React.CSSProperties;
}

export function SplineScene({ scene, className = '', style = {} }: SplineSceneProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    console.log('Spline scene loaded successfully');
    setIsLoading(false);
  };

  const handleError = (error: any) => {
    console.error('Spline scene error:', error);
    setHasError(true);
    setIsLoading(false);
  };

  return (
    <div className={`w-full h-full ${className}`} style={style}>
      {hasError ? (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-400 via-cyan-400 to-teal-500 rounded-lg">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-red-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-red-200 text-lg font-medium mb-2">3D Scene Error</p>
            <p className="text-red-300 text-sm">Please check the scene URL</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-400 via-cyan-400 to-teal-500 rounded-lg">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-cyan-200 text-sm">Loading 3D Scene...</p>
            </div>
          </div>
        }>
          <Spline 
            scene={scene} 
            onLoad={handleLoad}
            onError={handleError}
          />
        </Suspense>
      )}
    </div>
  );
}

// Predefined scenes for common use cases
export const SplineScenes = {
  main: 'https://prod.spline.design/SJ9QHB7RihFzvpdu/scene.splinecode',
  // Alternative URL format if the above doesn't work
  mainAlt: 'https://prod.spline.design/SJ9QHB7RihFzvpdu/',
}; 