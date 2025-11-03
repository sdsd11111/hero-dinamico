import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface HeaderProps {
  logo: string;
  navItems: { label: string; href: string }[];
  className?: string;
}

export const Header = ({ logo, navItems, className }: HeaderProps) => {
  return (
    <header className={cn("bg-white shadow-md w-full", className)}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image 
              src={logo} 
              alt="Logo" 
              width={120} 
              height={40} 
              className="h-10 w-auto"
              priority
            />
          </Link>
        </div>
        
        <nav className="hidden md:flex space-x-8">
          {navItems.map((item, index) => (
            <Link 
              key={index} 
              href={item.href}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        
        <button className="md:hidden">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>
    </header>
  );
};
