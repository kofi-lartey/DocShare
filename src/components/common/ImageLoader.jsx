import { useState, useEffect } from 'react';
import { cn } from '../../utils/helpers';

const IMAGE_URL = 'https://res.cloudinary.com/djjgkezui/image/upload/v1783687895/Gemini_Generated_Image_buwg67buwg67buwg_whwjno.png';

export default function ImageLoader({ size = 'md', className = '' }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.src = IMAGE_URL;
    img.onload = () => setIsLoaded(true);
  }, []);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
    xl: 'h-32 w-32',
  };

  return (
    <div className={cn('relative flex items-center justify-center', sizeClasses[size], className)}>
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary-500/20 via-secondary-500/20 to-primary-500/20 animate-aurora" />
      <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-secondary-500/10 to-transparent animate-pulse-slow" />
      <img
        src={IMAGE_URL}
        alt="Loading"
        className={cn(
          'relative z-10 rounded-full object-cover shadow-lg',
          'transition-all duration-700 ease-out',
          isLoaded ? 'scale-100 opacity-100' : 'scale-90 opacity-0',
          'animate-float'
        )}
      />
    </div>
  );
}

export function AppLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <ImageLoader size="xl" className="mx-auto mb-6" />
        <div className="space-y-2">
          <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 animate-fade-in-up">
            Loading DocShare Pro
          </p>
          <div className="flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    </div>
  );
}
