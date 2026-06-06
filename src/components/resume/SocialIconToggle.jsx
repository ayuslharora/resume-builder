export default function SocialIconToggle({ visible, onToggle, isEditing, children }) {
  const show = visible !== false;

  if (!isEditing) return show ? children : null;

  return (
    <span className="relative group/icn inline-flex items-center shrink-0">
      {show ? (
        <>
          {children}
          <button
            type="button"
            contentEditable={false}
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(false); }}
            className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 rounded-full bg-red-500 text-white items-center justify-center text-[9px] leading-none z-10 hidden group-hover/icn:flex cursor-pointer"
            title="Remove icon"
          >×</button>
        </>
      ) : (
        <button
          type="button"
          contentEditable={false}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(true); }}
          className="w-4 h-4 rounded border-2 border-dashed border-current opacity-40 hover:opacity-80 inline-flex items-center justify-center text-[10px] leading-none cursor-pointer"
          title="Show icon"
        >+</button>
      )}
    </span>
  );
}
