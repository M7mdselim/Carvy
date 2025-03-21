
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const { t } = useLanguage();
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
          {t('pageNotFound')}
        </p>
        <p className="text-gray-600 mb-8">
          {t('pageDoesntExist')}
        </p>
        <AnimatedButton 
          variant="primary" 
          onClick={() => navigate('/')}
          icon={<ArrowLeft className="w-5 h-5" />}
          iconPosition="left"
        >
          {t('returnHome')}
        </AnimatedButton>
      </div>
    </div>
  );
};

export default NotFound;
