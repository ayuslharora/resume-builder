import { useEffect, useRef } from 'react';

let _activeRewriteFn = null;
export function triggerActiveRewrite() { _activeRewriteFn?.(); }

export default function InlineEdit({
  value, 
  onChange, 
  isEditing = false, 
  placeholder = "Empty",
  className = "",
  multiline = false,
  onAiRewrite
}) {
  const contentEditableRef = useRef(null);

  // Sync external value changes (e.g. from AI regeneration or parent loading)
  useEffect(() => {
    if (contentEditableRef.current && document.activeElement !== contentEditableRef.current) {
      if (contentEditableRef.current.innerHTML !== value) {
        contentEditableRef.current.innerHTML = value || "";
      }
    }
  }, [value]);

  const handleBlur = () => {
    if (contentEditableRef.current) {
      const newValue = contentEditableRef.current.innerHTML;
      const isEmpty = newValue.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim() === "";
      if (isEmpty) {
        onChange("");
      } else if (newValue !== value) {
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
    if (!value) return null;
    return <span className={className} dangerouslySetInnerHTML={{ __html: value }} />;
  }

  const handleRewrite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAiRewrite) onAiRewrite(value || "");
  };

  const handleFocus = () => {
    _activeRewriteFn = onAiRewrite
      ? () => onAiRewrite(contentEditableRef.current?.innerHTML || value || "")
      : null;
  };

  return (
    <span className={`relative inline-block group w-full ${className}`}>
      <span
        ref={contentEditableRef}
        contentEditable={true}
        suppressContentEditableWarning={true}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`outline-none min-w-[20px] whitespace-pre-wrap ${multiline ? 'block w-full' : 'inline-block'} [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:my-1`}
        data-placeholder={placeholder}
        dangerouslySetInnerHTML={{ __html: value || "" }}
      />
      {onAiRewrite && (
        <button
          contentEditable={false}
          onMouseDown={handleRewrite}
          className="absolute -right-6 top-0 p-1 rounded-full text-blue-500 hover:bg-blue-100 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 scale-90 hover:scale-100"
          title="Improve with AI"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
        </button>
      )}
    </span>
  );
}
