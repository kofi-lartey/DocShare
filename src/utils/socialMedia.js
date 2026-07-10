import { FaWhatsapp, FaTelegramPlane, FaFacebookF, FaTwitter, FaLinkedinIn } from 'react-icons/fa';

const encodeUrl = (url) => encodeURIComponent(url);

export const SOCIAL_PLATFORMS = [
  {
    name: 'WhatsApp',
    Icon: FaWhatsapp,
    color: '#25D366',
    bgColor: 'bg-green-500',
    getShareUrl: (url) => `https://wa.me/?text=Check+out+this+document+on+DocShare+Pro:+${encodeUrl(url)}`,
  },
  {
    name: 'Telegram',
    Icon: FaTelegramPlane,
    color: '#0088cc',
    bgColor: 'bg-sky-500',
    getShareUrl: (url) => `https://t.me/share/url?url=${encodeUrl(url)}&text=Check+out+this+document+on+DocShare+Pro`,
  },
  {
    name: 'Facebook',
    Icon: FaFacebookF,
    color: '#1877F2',
    bgColor: 'bg-blue-600',
    getShareUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeUrl(url)}`,
  },
  {
    name: 'Twitter',
    Icon: FaTwitter,
    color: '#1DA1F2',
    bgColor: 'bg-sky-400',
    getShareUrl: (url) => `https://twitter.com/intent/tweet?url=${encodeUrl(url)}&text=Check+out+this+document+on+DocShare+Pro`,
  },
  {
    name: 'LinkedIn',
    Icon: FaLinkedinIn,
    color: '#0A66C2',
    bgColor: 'bg-blue-700',
    getShareUrl: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeUrl(url)}`,
  },
];
