import { useEffect, useRef, useCallback } from 'react';
import { Wand2 } from 'lucide-react';
import { sanitizeResumeHtml, stripResumeHtml } from '../../services/resumeHtmlSanitizer';

let _activeRewriteFn = null;
// eslint-disable-next-line react-refresh/only-export-components
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
  const sanitizedValue = sanitizeResumeHtml(value);

  // Stable ref callback: fires only on mount/unmount, not on re-renders.
  // Sets the initial innerHTML without dangerouslySetInnerHTML so React's reconciler
  // never touches this element's content — allowing inline formatting (bold, font size, etc.)
  // applied via Range API to survive re-renders.
  const refCallback = useCallback((el) => {
    contentEditableRef.current = el;
    if (el) el.innerHTML = sanitizeResumeHtml(value);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value changes (AI regeneration, parent load) when the field is not active.
  useEffect(() => {
    const el = contentEditableRef.current;
    if (!el || document.activeElement === el) return;
    if (el.innerHTML !== sanitizedValue) el.innerHTML = sanitizedValue;
  }, [sanitizedValue]);

  const handleBlur = () => {
    if (contentEditableRef.current) {
      const newValue = sanitizeResumeHtml(contentEditableRef.current.innerHTML);
      const isEmpty = stripResumeHtml(newValue).trim() === "";
      if (isEmpty) {
        onChange("");
      } else if (newValue !== sanitizedValue) {
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
    if (!stripResumeHtml(sanitizedValue).trim()) return null;
    return <span className={className} dangerouslySetInnerHTML={{ __html: sanitizedValue }} />;
  }

  const handleRewrite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAiRewrite) onAiRewrite(stripResumeHtml(value || ""));
  };

  const handleFocus = () => {
    _activeRewriteFn = onAiRewrite
      ? () => onAiRewrite(stripResumeHtml(contentEditableRef.current?.innerHTML || value || ""))
      : null;
  };

  return (
    <span className={`group w-full ${className}`}>
      <span
        ref={refCallback}
        contentEditable={true}
        suppressContentEditableWarning={true}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`outline-none min-w-[20px] whitespace-pre-wrap [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:my-1`}
        data-placeholder={placeholder}
      />
      {onAiRewrite && (
        <button
          contentEditable={false}
          onMouseDown={handleRewrite}
          className="inline-block align-middle ml-1 p-0.5 rounded-full bg-white shadow-sm border border-blue-100 hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
          style={{ color: '#3b82f6' }}
          title="Improve with AI"
        >
          <Wand2 size={13} />
        </button>
      )}
    </span>
  );
}
