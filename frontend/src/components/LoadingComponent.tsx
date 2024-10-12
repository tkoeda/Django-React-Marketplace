import { Loader } from 'lucide-react';

const LoadingSpinner = ({ size = 24, color = 'currentColor' }) => (
  <Loader size={size} color={color} className="animate-spin" />
);

const LoadingOverlay = ({ isLoading, children }) => {
  if (!isLoading) return children;

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
        <LoadingSpinner size={48} />
      </div>
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
    </div>
  );
};

export { LoadingSpinner, LoadingOverlay };
