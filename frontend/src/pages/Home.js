import React from "react";
import { Link } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import { useTheme } from "../contexts/ThemeContext";
import { cn } from "../lib/utils";

const Home = () => {
  const { isDarkMode } = useTheme();

  return (
    <MainLayout className={cn(
      isDarkMode 
        ? "bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950" 
        : "bg-white"
    )}>
      {/* Hero Section */}
      <section className="relative py-20 flex flex-col items-center justify-center text-center px-4">
        {/* Background animated elements */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className={cn(
            "absolute top-1/4 left-1/4 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-soft",
            isDarkMode ? "bg-purple-900" : "bg-purple-100"
          )}></div>
          <div className={cn(
            "absolute top-3/4 right-1/4 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-soft",
            isDarkMode ? "bg-blue-900" : "bg-blue-100"
          )}></div>
          
          {/* Gold/Silver theme lines */}
          <div 
            className="absolute inset-0 z-0"
            style={{
              background: isDarkMode 
                ? 'linear-gradient(to top right, transparent, rgba(255, 215, 0, 0.1), transparent)'
                : 'linear-gradient(to top right, transparent, rgba(212, 175, 55, 0.2), transparent)',
              opacity: '0.5'
            }}
          ></div>
          <div 
            className="absolute inset-0 z-0"
            style={{
              background: isDarkMode 
                ? 'linear-gradient(to bottom left, transparent, rgba(192, 192, 192, 0.1), transparent)'
                : 'linear-gradient(to bottom left, transparent, rgba(170, 169, 173, 0.2), transparent)',
              opacity: '0.5'
            }}
          ></div>
          
          {/* Floating music notes animation */}
          <div 
            className={cn(
              "absolute top-10 left-1/4 text-5xl z-10 animate-float-slow",
              isDarkMode ? "text-gold-100/40" : "text-gold-300/50"
            )}
            style={{animationPlayState: "running"}}
          >♪</div>
          <div 
            className={cn(
              "absolute top-1/3 right-1/4 text-6xl z-10 animate-float-medium",
              isDarkMode ? "text-silver-100/35" : "text-silver-200/45"
            )}
            style={{animationPlayState: "running"}}
          >♫</div>
          <div 
            className={cn(
              "absolute bottom-1/4 left-1/3 text-4xl z-10 animate-float-fast",
              isDarkMode ? "text-gold-200/45" : "text-gold-100/50"
            )}
            style={{animationPlayState: "running"}}
          >♩</div>
          <div 
            className={cn(
              "absolute top-2/3 right-1/3 text-7xl z-10 animate-float-slow",
              isDarkMode ? "text-silver-200/30" : "text-silver-300/40"
            )}
            style={{animationPlayState: "running"}}
          >♬</div>
          <div 
            className={cn(
              "absolute bottom-1/3 left-10 text-5xl z-10 animate-float-medium",
              isDarkMode ? "text-gold-300/40" : "text-gold-200/45"
            )}
            style={{animationPlayState: "running"}}
          >♪</div>
          <div 
            className={cn(
              "absolute top-1/2 right-20 text-6xl z-10 animate-float-fast",
              isDarkMode ? "text-silver-300/35" : "text-silver-100/45"
            )}
            style={{animationPlayState: "running"}}
          >♫</div>
        </div>
        
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <h1 className={cn(
            "text-5xl md:text-6xl font-bold text-center bg-clip-text text-transparent animate-fade-in",
            isDarkMode 
              ? "bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400" 
              : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"
          )}>
            AI-Powered Music Composition<br />Made Easy
          </h1>
          <p className={cn(
            "mt-6 text-xl max-w-3xl animate-fade-in",
            isDarkMode ? "text-gray-300" : "text-ibm-gray-70"
          )}>
            Generate professional-quality music with the power of AI. Transform text, images, or audio into unique compositions that match your creative vision.
          </p>
          <div className="mt-10 animate-fade-in">
            <Link to="/composer" className="bg-ibm-blue hover:bg-ibm-blue-70 text-white text-lg px-8 py-3 rounded-md inline-flex items-center">
              Start Creating <span className="ml-2">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={cn(
        "py-20 px-4",
        isDarkMode ? "bg-transparent" : "bg-gray-50"
      )}>
        <div className="max-w-7xl mx-auto">
          <h2 className={cn(
            "text-3xl md:text-4xl font-bold text-center mb-16 bg-clip-text text-transparent",
            isDarkMode 
              ? "bg-gradient-to-r from-indigo-400 to-purple-400" 
              : "bg-gradient-to-r from-indigo-600 to-purple-600"
          )}>
            Unlock Your Musical Creativity
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className={cn(
              "p-8 rounded-xl shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center",
              isDarkMode 
                ? "bg-gray-800 border border-purple-900" 
                : "bg-white border border-purple-100"
            )}>
              <div className={cn(
                "h-14 w-14 rounded-full flex items-center justify-center mb-6",
                isDarkMode ? "bg-purple-900" : "bg-purple-100"
              )}>
                <span className="text-2xl">💬</span>
              </div>
              <h3 className={cn(
                "text-xl font-semibold mb-2",
                isDarkMode ? "text-gray-100" : "text-ibm-gray-100"
              )}>Text to Music</h3>
              <p className={cn(
                isDarkMode ? "text-gray-400" : "text-ibm-gray-60"
              )}>Describe the mood, style, or story you want to express, and watch it transform into melody.</p>
            </div>
            
            <div className={cn(
              "p-8 rounded-xl shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center",
              isDarkMode 
                ? "bg-gray-800 border border-blue-900" 
                : "bg-white border border-blue-100"
            )}>
              <div className={cn(
                "h-14 w-14 rounded-full flex items-center justify-center mb-6",
                isDarkMode ? "bg-blue-900" : "bg-blue-100"
              )}>
                <span className="text-2xl">🖼️</span>
              </div>
              <h3 className={cn(
                "text-xl font-semibold mb-2",
                isDarkMode ? "text-gray-100" : "text-ibm-gray-100"
              )}>Image to Music</h3>
              <p className={cn(
                isDarkMode ? "text-gray-400" : "text-ibm-gray-60"
              )}>Upload any image and our AI will interpret its colors, shapes, and content into musical elements.</p>
            </div>
            
            <div className={cn(
              "p-8 rounded-xl shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center",
              isDarkMode 
                ? "bg-gray-800 border border-indigo-900" 
                : "bg-white border border-indigo-100"
            )}>
              <div className={cn(
                "h-14 w-14 rounded-full flex items-center justify-center mb-6",
                isDarkMode ? "bg-indigo-900" : "bg-indigo-100"
              )}>
                <span className="text-2xl">🎧</span>
              </div>
              <h3 className={cn(
                "text-xl font-semibold mb-2",
                isDarkMode ? "text-gray-100" : "text-ibm-gray-100"
              )}>Audio Enhancement</h3>
              <p className={cn(
                isDarkMode ? "text-gray-400" : "text-ibm-gray-60"
              )}>Upload audio and let our AI enhance it or create variations in different styles and moods.</p>
            </div>
            
            <div className={cn(
              "p-8 rounded-xl shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center",
              isDarkMode 
                ? "bg-gray-800 border border-pink-900" 
                : "bg-white border border-pink-100"
            )}>
              <div className={cn(
                "h-14 w-14 rounded-full flex items-center justify-center mb-6",
                isDarkMode ? "bg-pink-900" : "bg-pink-100"
              )}>
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className={cn(
                "text-xl font-semibold mb-2",
                isDarkMode ? "text-gray-100" : "text-ibm-gray-100"
              )}>Eco-Friendly Options</h3>
              <p className={cn(
                isDarkMode ? "text-gray-400" : "text-ibm-gray-60"
              )}>Enable Green Mode for energy-efficient compositions that reduce computational resources.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className={cn(
        "py-20 text-white",
        isDarkMode 
          ? "bg-gradient-to-r from-indigo-900 to-purple-900" 
          : "bg-gradient-to-r from-indigo-500 to-purple-600"
      )}>
        <div className="max-w-5xl mx-auto text-center px-4">
          <h3 className="text-3xl md:text-4xl font-bold mb-6">Ready to Compose Your Next Masterpiece?</h3>
          <p className="text-xl text-white/80 mb-10 max-w-3xl mx-auto">
            Join thousands of musicians, composers, and creators who are exploring new frontiers in AI-assisted music composition.
          </p>
          <Link to="/composer" className={cn(
            "text-lg px-10 py-4 rounded-md inline-block",
            isDarkMode 
              ? "bg-gray-800 text-purple-400 hover:bg-gray-700" 
              : "bg-white hover:bg-gray-100 text-purple-600"
          )}>
            Start Creating Now
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className={cn(
        "py-10 border-t",
        isDarkMode 
          ? "bg-gray-900 border-gray-800" 
          : "bg-white border-gray-200"
      )}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className={cn(
            isDarkMode ? "text-gray-400" : "text-ibm-gray-60"
          )}>
            © {new Date().getFullYear()} Tune Enchanter - TCD SwEng2025 Group 10
          </p>
        </div>
      </footer>
    </MainLayout>
  );
};

export default Home; 