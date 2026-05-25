import React from 'react';

export default function PrintLink({ href, isEditing, children, className = "" }) {
  if (!href || isEditing) {
    return <span className={className}>{children}</span>;
  }
  
  // Preserve mailto:/tel: as-is; prepend https:// for bare domain/path URLs
  const validUrl = /^(https?|mailto|tel):/i.test(href) ? href : `https://${href}`;
  
  return (
    <a href={validUrl} target="_blank" rel="noreferrer" className={`${className} hover:underline`}>
      {children}
    </a>
  );
}
