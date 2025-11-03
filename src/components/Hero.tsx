import Image from 'next/image';
import Link from 'next/link';

interface HeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  backgroundImage?: string;
}

export const Hero = ({
  title,
  subtitle,
  ctaText,
  ctaHref,
  backgroundImage = '/hero-bg.jpg'
}: HeroProps) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={backgroundImage}
            alt=""
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
      )}
      
      <div className="container mx-auto px-4 relative z-10 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto">
            {subtitle}
          </p>
          <Link
            href={ctaHref}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-10 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 text-lg"
          >
            {ctaText}
          </Link>
        </div>
      </div>

      {/* Flecha de desplazamiento */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <svg 
          className="w-10 h-10 text-white" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 14l-7 7m0 0l-7-7m7 7V3" 
          />
        </svg>
      </div>
    </div>
  );
};
