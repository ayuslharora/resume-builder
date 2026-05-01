import { Wand2 } from "lucide-react";

export default function EditableSection({ sectionName, isActive, onClick, children, isEditing, onRegenerate, isRegenerating }) {
  if (!isEditing) return <>{children}</>;

  return (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        onClick(sectionName);
      }}
      className={`relative rounded-md transition-all cursor-pointer group ${
        isActive ? 'ring-2 ring-blue-500 bg-blue-50/20' : 'hover:ring-2 hover:ring-blue-500/30 hover:bg-blue-500/5'
      }`}
    >
      {isActive && (
        <div className="absolute -top-3 -right-3 bg-blue-600 text-white text-[10px] px-2 py-1 rounded-full shadow-sm z-10 font-bold uppercase tracking-wider flex items-center gap-1">
          Editing
        </div>
      )}
      
      {isActive && sectionName !== 'personalInfo' && onRegenerate && (
        <button
          disabled={isRegenerating}
          onClick={(e) => {
            e.stopPropagation();
            onRegenerate(sectionName);
          }}
          className="absolute -top-3 -right-12 bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-full shadow-md z-20 transition-all disabled:opacity-50"
          title="Regenerate Section with AI"
        >
          <Wand2 size={12} className={isRegenerating ? "animate-pulse" : ""} />
        </button>
      )}


      {children}
    </div>
  );
}
