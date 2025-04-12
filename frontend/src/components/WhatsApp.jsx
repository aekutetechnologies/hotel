'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Check, ChevronRight, Zap, MessageCircle } from 'lucide-react';

export default function WhatsApp() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show chat popup after 2 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const toggleChat = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="fixed bottom-8 right-8 font-sans z-50">
      <div className="relative">
        {isVisible && (
          <div className="absolute bottom-16 right-0 bg-white rounded-3xl shadow-xl w-80 overflow-hidden border border-gray-100 mb-2 transition-all duration-300 ease-in-out">
            <div className="p-6 relative">
              <div className="absolute top-5 left-5 bg-red-500 w-12 h-12 rounded-full flex items-center justify-center shadow-md">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div className="ml-16 text-xl font-semibold text-gray-800 leading-snug">
                I checked the website, and I have a few questions to ask
              </div>
              <div className="absolute -right-3 -bottom-3 w-12 h-12 bg-white rotate-45 transform" />
            </div>
            
            <div className="mx-5 mb-5">
              <button className="w-full bg-gray-900 text-white py-4 px-5 rounded-xl flex items-center justify-between hover:bg-gray-800 hover:-translate-y-0.5 transition-all duration-200 shadow-sm">
                <div className="flex items-center">
                  <MessageCircle className="w-6 h-6 mr-3" />
                  <span className="text-lg font-medium">Chat With Us</span>
                </div>
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            
            <div className="text-center text-sm text-gray-500 py-3 flex items-center justify-center gap-2 border-t border-gray-100">
              <Zap className="w-4 h-4" />
              <span>Powered by wati.io</span>
            </div>
          </div>
        )}
        
        <button 
          onClick={toggleChat}
          className="bg-red-500 w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
          aria-label="Toggle chat"
        >
          {isVisible ? (
            <Check className="w-6 h-6 text-white" />
          ) : (
            <MessageSquare className="w-6 h-6 text-white" />
          )}
        </button>
      </div>
    </div>
  );
}