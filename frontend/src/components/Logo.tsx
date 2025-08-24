import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3 group cursor-pointer">
      {/* Logo Image */}
      <img 
        src="/logo.png" 
        alt="e-info.me logo" 
        className="w-8 h-8 object-contain dark:brightness-0 dark:invert"
      />
      
      {/* Brand Text */}
      <div className="flex flex-col">
        <span className="text-gray-900 dark:text-white font-medium text-base leading-none tracking-normal group-hover:text-gray-700 dark:group-hover:text-zinc-300 transition-colors duration-200">
          e-info<span className="text-gray-700 dark:text-zinc-400 font-normal">.me</span>
        </span>
        <span className="text-gray-500 dark:text-zinc-500 text-xs font-normal leading-none mt-1">
          one Link to You.
        </span>
      </div>
    </Link>
  );
}
