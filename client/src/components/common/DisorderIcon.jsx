import React from 'react';
import {
  FaCloudRain,
  FaExclamationTriangle,
  FaSync,
  FaShieldAlt,
  FaBolt,
  FaMoon,
  FaBrain,
} from 'react-icons/fa';

export const DisorderIcon = ({ name, className = 'text-2xl text-brand-600 dark:text-brand-400' }) => {
  switch (name) {
    case 'FaCloudRain':
      return <FaCloudRain className={className} />;
    case 'FaExclamationTriangle':
      return <FaExclamationTriangle className={className} />;
    case 'FaSync':
      return <FaSync className={className} />;
    case 'FaShieldAlt':
      return <FaShieldAlt className={className} />;
    case 'FaBolt':
      return <FaBolt className={className} />;
    case 'FaMoon':
      return <FaMoon className={className} />;
    case 'FaBrain':
    default:
      return <FaBrain className={className} />;
  }
};
