interface FilterChipProps {
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'primary';
  size?: 'sm' | 'md';
  className?: string;
}

export default function FilterChip({
  children,
  isActive = false,
  onClick,
  variant = 'default',
  size = 'md',
  className = ""
}: FilterChipProps) {
  const baseClasses = "border border-gray-300 rounded-full transition-all cursor-pointer";
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm"
  };
  
  const variantClasses = {
    default: isActive 
      ? "bg-gray-900 text-white border-gray-900 hover:bg-gray-800" 
      : "bg-white text-gray-700 hover:bg-gray-50",
    primary: isActive 
      ? "bg-gray-900 text-white border-gray-900 hover:bg-gray-800" 
      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
  };

  return (
    <button 
      onClick={onClick}
      className={`
        ${baseClasses} 
        ${sizeClasses[size]} 
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}