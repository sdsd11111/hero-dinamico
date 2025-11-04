import Link from 'next/link';
import Image from 'next/image';
import { SocialIcons } from './SocialIcons';

interface FooterProps {
  logo: string;
  description: string;
  socialLinks: { name: string; url: string; icon: string }[];
  footerLinks: { title: string; links: { label: string; href: string }[] }[];
}

export const Footer = ({ logo, description, socialLinks, footerLinks }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="col-span-1">
            <div className="mb-4">
              <Link href="/">
                <Image 
                  src={logo} 
                  alt="Logo" 
                  width={120} 
                  height={40} 
                  className="h-10 w-auto"
                />
              </Link>
            </div>
            <p className="text-gray-400 mb-6">{description}</p>
            <SocialIcons socialLinks={socialLinks} className="mt-2" />
          </div>

          {/* Enlaces del footer */}
          {footerLinks.map((section, index) => (
            <div key={index} className="col-span-1">
              <h3 className="text-white font-semibold mb-4 text-lg">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm md:text-base"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
          Diseñado por{' '}
          <a 
            href="https://cesarreyesjaramillo.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Cesar Reyes
          </a>{' '}
          | Los Almuerzos {currentYear}
        </div>
      </div>
    </footer>
  );
};
