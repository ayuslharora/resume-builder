import React from 'react';

export default function PrintLink({ href, isEditing, children, className = "" }) {
  if (!href || isEditing) {
    return <span className={className}>{children}</span>;
  }
  
  // Ensure the URL is fully qualified for PDF clickability
  const validUrl = /^https?:\/\//i.test(href) ? href : `https://${href}`;
  
  return (
    <a href={validUrl} target="_blank" rel="noreferrer" className={`${className} hover:underline`}>
      {children}
    </a>
  );
}
