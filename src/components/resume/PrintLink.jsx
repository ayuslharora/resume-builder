import React from 'react';

export default function PrintLink({ href, isEditing, children, className = "" }) {
  // Strip any HTML tags that may have crept in from contentEditable storage
  const cleanHref = (href || "").replace(/<[^>]*>/g, "").trim();

  if (!cleanHref || isEditing) {
    return <span className={className}>{children}</span>;
  }

  // Preserve mailto:/tel: as-is; prepend https:// for bare domain/path URLs
  const validUrl = /^(https?|mailto|tel):/i.test(cleanHref) ? cleanHref : `https://${cleanHref}`;
  
  return (
    <a href={validUrl} target="_blank" rel="noreferrer" className={`${className} hover:underline`}>
      {children}
    </a>
  );
}
