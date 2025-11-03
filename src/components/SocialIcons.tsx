import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition, findIconDefinition } from "@fortawesome/fontawesome-svg-core";
import { 
  faFacebook, 
  faTwitter, 
  faInstagram, 
  faLinkedin,
  faGithub,
  faYoutube,
  faPinterest,
  faTiktok,
  faWhatsapp
} from "@fortawesome/free-brands-svg-icons";

const iconMap: Record<string, IconDefinition> = {
  'facebook': faFacebook,
  'twitter': faTwitter,
  'instagram': faInstagram,
  'linkedin': faLinkedin,
  'github': faGithub,
  'youtube': faYoutube,
  'pinterest': faPinterest,
  'tiktok': faTiktok,
  'whatsapp': faWhatsapp
};

interface SocialIconProps {
  name: string;
  url: string;
  className?: string;
}

export const SocialIcon = ({ name, url, className = '' }: SocialIconProps) => {
  const iconName = name.toLowerCase();
  const icon = iconMap[iconName];
  
  if (!icon) {
    console.warn(`Icono no encontrado: ${name}`);
    return null;
  }

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 hover:bg-blue-600 transition-colors ${className}`}
      aria-label={name}
    >
      <FontAwesomeIcon icon={icon} className="text-white text-lg" />
    </a>
  );
};

interface SocialIconsProps {
  socialLinks: { name: string; url: string; icon: string }[];
  className?: string;
}

export const SocialIcons = ({ socialLinks, className = '' }: SocialIconsProps) => {
  return (
    <div className={`flex space-x-3 ${className}`}>
      {socialLinks.map((social, index) => (
        <SocialIcon 
          key={index} 
          name={social.icon} 
          url={social.url} 
        />
      ))}
    </div>
  );
};
