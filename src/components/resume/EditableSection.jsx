export default function EditableSection({ sectionName, isActive, onClick, children, isEditing }) {
  if (!isEditing) return <>{children}</>;

  return (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        onClick(sectionName);
      }}
      className={`relative rounded-md transition-all cursor-pointer group ${
        isActive ? 'ring-2 ring-brand-500 bg-brand-50/20' : 'hover:bg-gray-50'
      }`}
    >
      {isActive && (
        <div className="absolute -top-3 -right-3 bg-brand-600 text-white text-[10px] px-2 py-1 rounded-full shadow-sm z-10 font-bold uppercase tracking-wider">
          Editing
        </div>
      )}
      <div className={`absolute top-0 -left-6 text-brand-500 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        ✎
      </div>
      {children}
    </div>
  );
}
