

import {
  FaLinkedin, FaGithub, FaTwitter, FaYoutube, FaInstagram,
  FaStackOverflow, FaMedium, FaDev, FaCodepen, FaGitlab,
  FaBitbucket, FaBehance, FaDribbble, FaDiscord, FaReddit,
  FaTwitch, FaTelegram, FaNpm, FaFigma, FaPatreon, FaGlobe,
} from 'react-icons/fa';
import {
  SiLeetcode, SiHackerrank, SiCodeforces, SiCodechef,
  SiKaggle, SiTopcoder, SiNotion, SiHashnode, SiSubstack,
} from 'react-icons/si';

const RULES = [
  ['linkedin.com', FaLinkedin],
  ['github.com', FaGithub],
  ['gitlab.com', FaGitlab],
  ['bitbucket.org', FaBitbucket],
  ['twitter.com', FaTwitter],
  ['x.com', FaTwitter],
  ['youtube.com', FaYoutube],
  ['youtu.be', FaYoutube],
  ['instagram.com', FaInstagram],
  ['reddit.com', FaReddit],
  ['discord.com', FaDiscord],
  ['discord.gg', FaDiscord],
  ['twitch.tv', FaTwitch],
  ['telegram.org', FaTelegram],
  ['t.me', FaTelegram],
  ['leetcode.com', SiLeetcode],
  ['hackerrank.com', SiHackerrank],
  ['codeforces.com', SiCodeforces],
  ['codechef.com', SiCodechef],
  ['topcoder.com', SiTopcoder],
  ['kaggle.com', SiKaggle],
  ['stackoverflow.com', FaStackOverflow],
  ['medium.com', FaMedium],
  ['dev.to', FaDev],
  ['hashnode.com', SiHashnode],
  ['substack.com', SiSubstack],
  ['codepen.io', FaCodepen],
  ['npmjs.com', FaNpm],
  ['figma.com', FaFigma],
  ['behance.net', FaBehance],
  ['dribbble.com', FaDribbble],
  ['notion.so', SiNotion],
  ['notion.site', SiNotion],
  ['patreon.com', FaPatreon],
];

export function getIconForUrl(url = '') {
  const u = (url || '').toLowerCase();
  for (const [domain, icon] of RULES) {
    if (u.includes(domain)) return icon;
  }
  return FaGlobe;
}
