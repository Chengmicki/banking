import { useState } from "react";
import { Building, Shield, Zap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/auth/login-modal";
import { RegisterModal } from "@/components/auth/register-modal";

export default function Landing() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const features = [
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Your money and data are protected with enterprise-grade security measures and encryption.",
    },
    {
      icon: Zap,
      title: "Instant Transfers",
      description: "Send money instantly to friends, family, or businesses with our real-time payment system.",
    },
    {
      icon: TrendingUp,
      title: "Smart Insights",
      description: "Get personalized financial insights and recommendations to help you reach your goals.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building className="text-primary text-2xl mr-3" />
              <span className="font-bold text-xl text-gray-900">Everstead Bank</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setShowLogin(true)}
              >
                Login
              </Button>
              <Button 
                className="btn-gradient"
                onClick={() => setShowRegister(true)}
              >
                Get Started
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/admin/login'}
                className="text-gray-500 hover:text-gray-700"
              >
                Admin
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
              Banking Made <span className="text-primary">Simple</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-slide-up">
              Experience the future of banking with our secure, intuitive platform. 
              Manage your finances, transfer money, and grow your wealth with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-bounce-in">
              <Button 
                className="btn-gradient px-8 py-4 text-lg font-semibold"
                onClick={() => setShowRegister(true)}
              >
                Open Account Today
              </Button>
              <Button 
                variant="outline" 
                className="px-8 py-4 text-lg font-semibold"
                onClick={() => setShowRegister(true)}
              >
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Everstead Bank?</h2>
            <p className="text-lg text-gray-600">Advanced features designed for modern banking</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="feature-card p-8 rounded-xl shadow-card">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-6">
                    <Icon className="text-white w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      <LoginModal 
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitchToRegister={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
      />
      
      <RegisterModal 
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onSwitchToLogin={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
      />
    </div>
  );
}
