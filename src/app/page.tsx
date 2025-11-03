"use client";

import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import HeroPlatos from "@/components/HeroPlatos";
import { headerData, heroData, footerData } from "@/types";

interface HeaderProps {
  logo: string;
  navItems: { label: string; href: string }[];
  className?: string;
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        logo={headerData.logo} 
        navItems={headerData.navItems} 
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm"
      />
      
      <main className="flex-1 flex flex-col">
        {/* Hero Section - Viewport completo */}
        <HeroPlatos />
        
        {/* Resto del contenido */}
        <div className="bg-white">
          {/* Sección de contenido adicional */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
                Nuestros Servicios
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-semibold mb-3 text-gray-800">Servicio {item}</h3>
                    <p className="text-gray-600">
                      Descripción del servicio {item}. Incluye características y beneficios clave para el cliente.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
          
          {/* Footer */}
          <Footer 
            logo={footerData.logo}
            description={footerData.description}
            socialLinks={footerData.socialLinks}
            footerLinks={footerData.footerLinks}
          />
        </div>
      </main>
    </div>
  );
}
