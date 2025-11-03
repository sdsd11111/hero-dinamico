// Tipos para el Header
export interface NavItem {
  label: string;
  href: string;
}

// Tipos para el Footer
export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

export interface FooterLinkSection {
  title: string;
  links: NavItem[];
}

// Tipos para el Hero
export interface HeroContent {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  backgroundImage?: string;
}

// Datos de ejemplo para el header
export const headerData = {
  logo: "/logo.png",
  navItems: [
    { label: "Inicio", href: "/" },
    { label: "Servicios", href: "/servicios" },
    { label: "Nosotros", href: "/nosotros" },
    { label: "Contacto", href: "/contacto" },
  ],
};

// Datos de ejemplo para el hero
export const heroData: HeroContent = {
  title: "Bienvenidos a Nuestra Marca",
  subtitle: "Soluciones innovadoras para tus necesidades. Descubre cómo podemos ayudarte a alcanzar tus objetivos.",
  ctaText: "Conócenos",
  ctaHref: "/contacto",
  backgroundImage: "/hero-bg.jpg"
};

// Datos de ejemplo para el footer
export const footerData = {
  logo: "/logo-white.png",
  description: "Transformando ideas en soluciones digitales excepcionales. Comprometidos con la excelencia y la innovación.",
  socialLinks: [
    { name: "Facebook", url: "#", icon: "facebook" },
    { name: "Twitter", url: "#", icon: "twitter" },
    { name: "Instagram", url: "#", icon: "instagram" },
    { name: "LinkedIn", url: "#", icon: "linkedin" },
  ],
  footerLinks: [
    {
      title: "Compañía",
      links: [
        { label: "Sobre Nosotros", href: "/nosotros" },
        { label: "Servicios", href: "/servicios" },
        { label: "Trabajos", href: "/trabajos" },
        { label: "Blog", href: "/blog" },
      ],
    },
    {
      title: "Enlaces Rápidos",
      links: [
        { label: "Contacto", href: "/contacto" },
        { label: "FAQ", href: "/faq" },
        { label: "Términos y Condiciones", href: "/terminos" },
        { label: "Política de Privacidad", href: "/privacidad" },
      ],
    },
    {
      title: "Contacto",
      links: [
        { label: "info@ejemplo.com", href: "mailto:info@ejemplo.com" },
        { label: "+1 234 567 890", href: "tel:+1234567890" },
        { label: "Calle Falsa 123, Ciudad", href: "#" },
      ],
    },
  ],
};
