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
  const baseClasses = "rounded-lg transition-all duration-200 cursor-pointer font-semibold";

  const sizeClasses = {
    sm: "px-4 py-2 text-[15px]",
    md: "px-5 py-2.5 text-[16px]"
  };

  const variantClasses = {
    default: isActive
      ? "text-white shadow-sm hover:shadow-md"
      : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200",
    primary: isActive
      ? "text-white shadow-sm hover:shadow-md"
      : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200"
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
      style={isActive ? { backgroundColor: '#B8312F' } : {}}
      onMouseEnter={(e) => {
        if (isActive) {
          e.currentTarget.style.backgroundColor = '#9e2825';
        }
      }}
      onMouseLeave={(e) => {
        if (isActive) {
          e.currentTarget.style.backgroundColor = '#B8312F';
        }
      }}
    >
      {children}
    </button>
  );
}