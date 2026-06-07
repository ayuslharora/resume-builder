import { FaLinkedin, FaGithub, FaTwitter, FaYoutube, FaInstagram, FaGlobe } from 'react-icons/fa';

export function getIconForUrl(url = '') {
  const u = (url || '').toLowerCase();
  if (u.includes('linkedin.com')) return FaLinkedin;
  if (u.includes('github.com')) return FaGithub;
  if (u.includes('twitter.com') || u.includes('x.com')) return FaTwitter;
  if (u.includes('youtube.com') || u.includes('youtu.be')) return FaYoutube;
  if (u.includes('instagram.com')) return FaInstagram;
  return FaGlobe;
}
