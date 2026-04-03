import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, Plus, Dumbbell, History } from "lucide-react";

const Layout = ({ children }) => {
  const location = useLocation();
  
  const navItems = [
    { path: "/", label: "Trang chủ", icon: BookOpen },
    { path: "/add", label: "Thêm từ", icon: Plus },
    { path: "/practice", label: "Luyện tập", icon: Dumbbell },
    { path: "/history", label: "Lịch sử", icon: History },
  ];
  
  return (
    <div className="min-h-screen bg-background-primary">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b-4 border-borders-default shadow-brutal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3" data-testid="logo-link">
              <div className="bg-brand-primary border-2 border-borders-default rounded-xl p-2 shadow-brutal-sm">
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={3} />
              </div>
              <h1 className="text-xl sm:text-2xl font-heading font-extrabold tracking-tight">
                Vocab Trainer
              </h1>
            </Link>
            
            {/* Navigation */}
            <nav className="flex items-center space-x-2 sm:space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    data-testid={`nav-${item.path.slice(1) || 'home'}`}
                    className={`
                      flex items-center space-x-2 px-3 py-2 sm:px-4 sm:py-2 rounded-lg border-2 font-bold text-sm sm:text-base
                      transition-all duration-150
                      ${
                        isActive
                          ? "bg-brand-primary border-borders-default shadow-brutal-sm translate-y-0"
                          : "bg-white border-borders-default hover:bg-gray-50 hover:-translate-y-0.5"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {children}
      </main>
    </div>
  );
};

export default Layout;