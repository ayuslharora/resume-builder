import { useEffect, useRef } from 'react';

export default function InlineEdit({ 
  value, 
  onChange, 
  isEditing = false, 
  placeholder = "Empty",
  className = "",
  multiline = false
}) {
  const contentEditableRef = useRef(null);

  // Sync external value changes (e.g. from AI regeneration or parent loading)
  useEffect(() => {
    if (contentEditableRef.current && document.activeElement !== contentEditableRef.current) {
      if (contentEditableRef.current.innerText !== value) {
        contentEditableRef.current.innerText = value || "";
      }
    }
  }, [value]);

  const handleBlur = () => {
    if (contentEditableRef.current) {
      const newValue = contentEditableRef.current.innerText;
      if (newValue !== value) {
        onChange(newValue);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      contentEditableRef.current?.blur();
    }
  };

  if (!isEditing) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span
      ref={contentEditableRef}
      contentEditable={true}
      suppressContentEditableWarning={true}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`outline-none min-w-[20px] whitespace-pre-wrap inline-block ${className}`}
      data-placeholder={placeholder}
      dangerouslySetInnerHTML={{ __html: value || "" }}
    />
  );
}
