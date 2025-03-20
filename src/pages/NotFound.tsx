
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="text-center max-w-lg">
        <h1 className="text-8xl md:text-9xl font-bold mb-4 gradient-text">404</h1>
        <p className="text-xl md:text-2xl text-gray-800 mb-6">
          This page has driven off the map
        </p>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <AnimatedButton 
          variant="primary" 
          onClick={() => navigate('/')}
          icon={<ArrowLeft className="w-5 h-5" />}
          iconPosition="left"
        >
          Return Home
        </AnimatedButton>
      </div>
    </div>
  );
};

export default NotFound;
