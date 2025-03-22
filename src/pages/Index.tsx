
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { CarFront, ChevronRight, Key, Menu, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import DarkModeToggle from "@/components/DarkModeToggle";

export default function Index() {
  const { user, isAdmin, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto py-4 px-4 md:px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CarFront className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Carvy</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            
            {/* Mobile menu toggle */}
            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex gap-4">
            {user ? (
              <>
                {isAdmin && (
                  <Button asChild>
                    <Link to="/admin">Admin Dashboard</Link>
                  </Button>
                )}
                {!isAdmin && (
                  <Button asChild>
                    <Link to="/dashboard">Shop Dashboard</Link>
                  </Button>
                )}
                <Button variant="outline" onClick={signOut}>Sign Out</Button>
              </>
            ) : (
              <Button asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className={cn(
          "md:hidden absolute w-full bg-white dark:bg-gray-900 border-b transition-all duration-300 ease-in-out overflow-hidden",
          mobileMenuOpen ? "max-h-40" : "max-h-0"
        )}>
          <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {user ? (
              <>
                {isAdmin && (
                  <Button asChild className="w-full justify-between">
                    <Link to="/admin">
                      Admin Dashboard <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
                {!isAdmin && (
                  <Button asChild className="w-full justify-between">
                    <Link to="/dashboard">
                      Shop Dashboard <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
                <Button variant="outline" onClick={signOut} className="w-full">Sign Out</Button>
              </>
            ) : (
              <Button asChild className="w-full justify-between">
                <Link to="/login">
                  Sign In <Key className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative">
        {/* Hero background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 mix-blend-multiply z-10"></div>
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ 
              backgroundImage: 'url("https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2952&q=80")',
              filter: 'brightness(0.8)'
            }}
          ></div>
        </div>

        <div className="container mx-auto py-12 md:py-24 px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold text-white drop-shadow-md">
              Welcome to Carvy
            </h2>
            <p className="text-lg md:text-xl text-white/90 drop-shadow">
              The premium marketplace for car accessories and products for your vehicle.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-8 text-center">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
                <CarFront className="h-10 w-10 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Premium Products</h3>
                <p className="text-gray-600 dark:text-gray-300">Discover high-quality accessories for all makes and models.</p>
              </div>
              
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
                <ShieldCheck className="h-10 w-10 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Verified Sellers</h3>
                <p className="text-gray-600 dark:text-gray-300">Shop with confidence from trusted automotive specialists.</p>
              </div>
              
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
                <CarFront className="h-10 w-10 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Perfect Fit</h3>
                <p className="text-gray-600 dark:text-gray-300">Find parts specifically designed for your vehicle model.</p>
              </div>
            </div>
            
            {!user && (
              <div className="pt-8">
                <Button size="lg" asChild className="px-8 py-6 text-lg">
                  <Link to="/login">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="border-t py-6 bg-white dark:bg-gray-900 dark:text-gray-400">
        <div className="container mx-auto text-center text-gray-500 px-4">
          &copy; {new Date().getFullYear()} Carvy. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
