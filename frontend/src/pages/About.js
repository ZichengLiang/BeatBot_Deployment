import React from "react";
import MainLayout from "../components/MainLayout";
import { useTheme } from "../contexts/ThemeContext";
import { cn } from "../lib/utils";
import { Linkedin, Github } from "lucide-react";

const About = () => {
  const { isDarkMode } = useTheme();

  // Mentors data
  const mentors = [
    {
      name: "Mihai Criveti",
      role: "Project Mentor",
      bio: "IBM mentor providing guidance on AI agentic architecture and implementation strategies.",
      image: "/images/team/mihai.jpeg",
      linkedin: "https://www.linkedin.com/in/crivetimihai/",
    },
    {
      name: "Pan Pan Lin",
      role: "Project Mentor",
      bio: "IBM mentor specializing in music composition, full stack development and AI agentic systems.",
      image: "/images/team/panpan.png",
      linkedin: "https://www.linkedin.com/in/linpanpan/",
    }
  ];

  // Team members data (simplified for this example)
  const teamMembers = [
    {
      name: "Isobel Radford-Dodd",
      role: "Product Owner",
      bio: "Leading product strategy and ensuring alignment with stakeholder needs.",
      image: "/images/team/isobel.jpg",
      linkedin: "https://www.linkedin.com/in/isobel-radford-dodd-90b801263/",
    },
    {
      name: "Surya Prasath Sathish",
      role: "Technical Manager & AI Analysis Lead",
      bio: "Overseeing full stack development with a focus on API design and frontend development. Leading the AI analysis team.",
      image: "/images/team/surya.jpg",
      linkedin: "https://www.linkedin.com/in/surya-prasath-s-b81827202/",
    },
    {
      name: "Lev Ganzha",
      role: "DevOps & AI Composition Lead",
      bio: "Managing DevOps infrastructure and leading the AI composition team.",
      image: "/images/team/lev.jpg",
      linkedin: "https://www.linkedin.com/in/lev-ganzha-006aaa290/",
    },
    {
      name: "Alfred Folashade",
      role: "RAG & Green Computing Expert",
      bio: "Implementing retrieval-augmented generation and energy-efficient computing solutions.",
      image: "/images/team/alfie.jpg",
      linkedin: "https://www.linkedin.com/in/alfred-folashade-986b46332/",
    },
    {
      name: "Cian Laffey",
      role: "UI & Frontend Developer",
      bio: "Creating intuitive user interfaces and responsive frontend experiences.",
      image: "/images/team/cian.jpg",
      linkedin: "https://www.linkedin.com/in/cian-laffey-7b0124332/",
    },
    {
      name: "Zicheng Liang",
      role: "Agentic Workflow & Composition Developer",
      bio: "Researching and implementing agentic systems for workflow orchestration and music composition frameworks.",
      image: "/images/team/zicheng.jpg",
      linkedin: "https://www.linkedin.com/in/zicheng-liang-b6809a251/",
      github: "https://github.com/ZichengLiang",
    },
    {
      name: "Michael Moore",
      role: "Audio Input Analysis Specialist",
      bio: "Developing algorithms for audio signal processing and pattern recognition.",
      image: "/images/team/michael.jpg",
      linkedin: "https://www.linkedin.com/in/michael-moore/",
    },
    {
      name: "Niharika Anand Shanbhag",
      role: "Image Analysis Expert",
      bio: "Implementing visual recognition systems for translating images to musical elements.",
      image: "/images/team/niharika.jpg",
      linkedin: "https://www.linkedin.com/in/niharika-shanbhag-a0425115a/",
    }
  ];

  // Project milestones
  const milestones = [
    {
      date: "January 2025",
      title: "Sprint 1: Project Inception & Research",
      description: '- Team formation and task distribution. \n - Catching up with the latest research in the field of AI music generation.'
    },
    {
      date: "February 2025",
      title: "Sprint 2: Prototype Development",
      description: "- Built the first working prototype of the AI music generation system. \n - The prototype was able to generate MIDI files from user prompts."
    },
    {
      date: "March 2025",
      title: "Sprint 3: Further Development on Prototype",
      description: "- Our analysis team developed multimodal input analysis including audio, image and text. RAG integration was also implemented. \n - Our composition team started to explore the use of ABC notation and multi-agentic systems with LangGraph."
    },
    {
      date: "April 2025",
      title: "Sprint 4: Polishing & Deployment",
      description: "- Frontend polishing with modern UI/UX design. \n - Backend integration with the frontend. \n - Deployment of the final product."
    },
  ];

  return (
    <MainLayout className={cn(
      isDarkMode
        ? "bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-950"
        : "bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50"
    )}>
      <main className="flex-grow px-6 md:px-8 lg:px-12 py-10">
        {/* Hero Section */}
        <section className={cn(
          "py-16 rounded-xl mb-16",
          isDarkMode
            ? "bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900"
            : "bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"
        )}>
          <div className="max-w-5xl mx-auto text-center px-4">
            <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">About Tune Enchanter</h1>
            <p className="text-xl text-white/90">
              We're a student project team mentored by IBM, building the future of music composition with AI
            </p>
          </div>
        </section>

        {/* Mentors Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className={cn(
                "text-3xl font-bold bg-clip-text text-transparent mb-4",
                isDarkMode
                  ? "bg-gradient-to-r from-indigo-400 to-purple-400"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600"
              )}>Our Mentors</h2>
              <p className={cn(
                "text-xl max-w-3xl mx-auto",
                isDarkMode ? "text-gray-300" : "text-ibm-gray-60"
              )}>
                Guidance from IBM experts
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {mentors.map((mentor, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "flex rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 border",
                    isDarkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-purple-100"
                  )}
                >
                  <div className="w-1/3">
                    <img 
                      src={mentor.image} 
                      alt={mentor.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-2/3 p-6 flex flex-col">
                    <div>
                      <h3 className={cn(
                        "text-xl font-semibold mb-1",
                        isDarkMode ? "text-gray-100" : "text-ibm-gray-100"
                      )}>{mentor.name}</h3>
                      <p className={cn(
                        "font-medium mb-3",
                        isDarkMode ? "text-purple-400" : "text-purple-600"
                      )}>{mentor.role}</p>
                      <p className={cn(
                        "text-sm",
                        isDarkMode ? "text-gray-300" : "text-ibm-gray-60"
                      )}>{mentor.bio}</p>
                    </div>
                    {mentor.linkedin && (
                      <div className={cn(
                        "mt-3 pt-3 border-t flex justify-end", 
                        isDarkMode ? "border-gray-700" : "border-purple-100"
                      )}>
                        <a 
                          href={mentor.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={cn(
                            "p-2 rounded-full transition-colors",
                            isDarkMode 
                              ? "text-blue-400 hover:bg-gray-700" 
                              : "text-blue-600 hover:bg-purple-50"
                          )}
                        >
                          <Linkedin size={20} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className={cn(
          "py-16 rounded-3xl mx-4 my-8 relative overflow-hidden",
          isDarkMode
            ? "bg-gradient-to-br from-indigo-950 to-purple-900"
            : "bg-gradient-to-br from-indigo-50 to-purple-100"
        )}>
          {/* Decorative music elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Musical instruments and notation using emojis */}
            <div className="absolute top-10 left-1/6 text-5xl transform rotate-12 opacity-30">🎸</div>
            <div className="absolute top-1/3 right-1/5 text-6xl transform -rotate-15 opacity-25">🎹</div>
            <div className="absolute bottom-1/4 left-1/4 text-5xl transform rotate-25 opacity-20">🎺</div>
            <div className="absolute top-2/3 right-1/3 text-5xl transform -rotate-10 opacity-15">🎻</div>
            <div className="absolute bottom-1/5 right-1/6 text-6xl transform rotate-5 opacity-20">🥁</div>
            <div className="absolute top-1/2 left-1/8 text-5xl transform -rotate-20 opacity-25">🎷</div>
            <div className="absolute top-1/5 left-2/3 text-4xl transform rotate-45 opacity-20">🪕</div>
            <div className="absolute bottom-1/3 right-2/5 text-4xl transform -rotate-30 opacity-15">🎵</div>
            <div className="absolute bottom-2/5 left-1/2 text-6xl transform rotate-10 opacity-20">🎼</div>
            <div className="absolute top-3/5 right-1/3 text-5xl animate-pulse opacity-15">🎶</div>
            
            {/* Sheet music fragments using SVG */}
            <div className="absolute top-1/6 left-1/3 opacity-10 transform rotate-5">
              <svg width="120" height="80" viewBox="0 0 120 80" fill="currentColor">
                <g>
                  <line x1="0" y1="10" x2="120" y2="10" strokeWidth="1" stroke="currentColor" />
                  <line x1="0" y1="25" x2="120" y2="25" strokeWidth="1" stroke="currentColor" />
                  <line x1="0" y1="40" x2="120" y2="40" strokeWidth="1" stroke="currentColor" />
                  <line x1="0" y1="55" x2="120" y2="55" strokeWidth="1" stroke="currentColor" />
                  <line x1="0" y1="70" x2="120" y2="70" strokeWidth="1" stroke="currentColor" />
                  <circle cx="20" cy="25" r="5" />
                  <circle cx="40" cy="40" r="5" />
                  <circle cx="60" cy="10" r="5" />
                  <circle cx="80" cy="55" r="5" />
                  <circle cx="100" cy="40" r="5" />
                  <line x1="20" y1="25" x2="20" y2="70" strokeWidth="1" stroke="currentColor" />
                  <line x1="80" y1="55" x2="80" y2="10" strokeWidth="1" stroke="currentColor" />
                </g>
              </svg>
            </div>
            
            <div className="absolute bottom-1/6 right-1/4 opacity-10 transform -rotate-10">
              <svg width="100" height="60" viewBox="0 0 100 60" fill="currentColor">
                <g>
                  <line x1="0" y1="10" x2="100" y2="10" strokeWidth="1" stroke="currentColor" />
                  <line x1="0" y1="20" x2="100" y2="20" strokeWidth="1" stroke="currentColor" />
                  <line x1="0" y1="30" x2="100" y2="30" strokeWidth="1" stroke="currentColor" />
                  <line x1="0" y1="40" x2="100" y2="40" strokeWidth="1" stroke="currentColor" />
                  <line x1="0" y1="50" x2="100" y2="50" strokeWidth="1" stroke="currentColor" />
                  <path d="M10,30 Q20,10 30,30 Q40,50 50,30 Q60,10 70,30 Q80,50 90,30" fill="none" stroke="currentColor" strokeWidth="1" />
                </g>
              </svg>
            </div>
            
            <div className="absolute top-2/5 right-1/6 opacity-10 transform rotate-15">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="currentColor">
                <g>
                  <path d="M10,20 C30,10 50,30 70,20" fill="none" stroke="currentColor" strokeWidth="1" />
                  <path d="M10,40 C30,30 50,50 70,40" fill="none" stroke="currentColor" strokeWidth="1" />
                  <path d="M10,60 C30,50 50,70 70,60" fill="none" stroke="currentColor" strokeWidth="1" />
                  <circle cx="20" cy="20" r="4" />
                  <circle cx="40" cy="40" r="4" />
                  <circle cx="60" cy="60" r="4" />
                </g>
              </svg>
            </div>
            
            {/* Guitar svg */}
            <div className="absolute top-3/4 left-1/5 opacity-15 transform -rotate-45">
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                <path d="M30,10 C50,20 70,30 80,50 C90,70 80,90 60,90 C40,90 20,80 10,60 C0,40 10,20 30,10z" strokeWidth="1" />
                <line x1="30" y1="30" x2="70" y2="70" strokeWidth="1" />
                <line x1="40" y1="20" x2="80" y2="60" strokeWidth="1" />
                <circle cx="50" cy="50" r="10" fill="none" />
              </svg>
            </div>
            
            {/* Piano keys svg */}
            <div className="absolute bottom-2/3 left-2/3 opacity-15 transform rotate-20">
              <svg width="120" height="60" viewBox="0 0 120 60" fill="none" stroke="currentColor">
                <rect x="10" y="10" width="100" height="40" strokeWidth="1" />
                <line x1="25" y1="10" x2="25" y2="50" strokeWidth="1" />
                <line x1="40" y1="10" x2="40" y2="50" strokeWidth="1" />
                <line x1="55" y1="10" x2="55" y2="50" strokeWidth="1" />
                <line x1="70" y1="10" x2="70" y2="50" strokeWidth="1" />
                <line x1="85" y1="10" x2="85" y2="50" strokeWidth="1" />
                <rect x="18" y="10" width="5" height="25" fill="currentColor" />
                <rect x="33" y="10" width="5" height="25" fill="currentColor" />
                <rect x="63" y="10" width="5" height="25" fill="currentColor" />
                <rect x="78" y="10" width="5" height="25" fill="currentColor" />
                <rect x="93" y="10" width="5" height="25" fill="currentColor" />
              </svg>
            </div>
            
            {/* Violin svg */}
            <div className="absolute top-1/3 left-3/4 opacity-15 transform rotate-30">
              <svg width="80" height="140" viewBox="0 0 80 140" fill="none" stroke="currentColor">
                <path d="M40,10 C50,20 60,30 60,50 C60,70 50,90 40,100 C30,90 20,70 20,50 C20,30 30,20 40,10z" strokeWidth="1" />
                <path d="M40,100 C45,110 50,120 50,130" strokeWidth="1" />
                <path d="M40,100 C35,110 30,120 30,130" strokeWidth="1" />
                <line x1="30" y1="70" x2="50" y2="70" strokeWidth="1" />
              </svg>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <h2 className={cn(
                "text-3xl font-bold bg-clip-text text-transparent mb-4",
                isDarkMode
                  ? "bg-gradient-to-r from-purple-400 to-pink-400"
                  : "bg-gradient-to-r from-purple-600 to-pink-600"
              )}>Meet Our Team</h2>
              <p className={cn(
                "text-xl max-w-3xl mx-auto",
                isDarkMode ? "text-gray-300" : "text-ibm-gray-60"
              )}>
                The passionate students behind Tune Enchanter
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className={cn(
                    "rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 border flex flex-col",
                    isDarkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-purple-100"
                  )}
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <div className="p-6 flex-grow">
                    <h3 className={cn(
                      "text-lg font-semibold mb-1",
                      isDarkMode ? "text-gray-100" : "text-ibm-gray-100"
                    )}>{member.name}</h3>
                    <p className={cn(
                      "font-medium text-sm mb-3",
                      isDarkMode ? "text-purple-400" : "text-purple-600"
                    )}>{member.role}</p>
                    <p className={cn(
                      "text-sm",
                      isDarkMode ? "text-gray-300" : "text-ibm-gray-60"
                    )}>{member.bio}</p>
                  </div>
                  {member.linkedin && (
                    <div className={cn(
                      "px-6 py-3 border-t flex justify-end gap-2",
                      isDarkMode ? "border-gray-700" : "border-purple-100"
                    )}>
                      {member.github && (
                        <a 
                          href={member.github} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={cn(
                            "p-2 rounded-full transition-colors",
                            isDarkMode 
                              ? "text-gray-300 hover:bg-gray-700" 
                              : "text-gray-700 hover:bg-purple-50"
                          )}
                        >
                          <Github size={18} />
                        </a>
                      )}
                      <a 
                        href={member.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={cn(
                          "p-2 rounded-full transition-colors",
                          isDarkMode 
                            ? "text-blue-400 hover:bg-gray-700" 
                            : "text-blue-600 hover:bg-purple-50"
                        )}
                      >
                        <Linkedin size={18} />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline/Milestones Section */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className={cn(
                "text-3xl font-bold bg-clip-text text-transparent mb-4",
                isDarkMode
                  ? "bg-gradient-to-r from-blue-400 to-indigo-400"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600"
              )}>Our Journey</h2>
              <p className={cn(
                "text-xl max-w-3xl mx-auto",
                isDarkMode ? "text-gray-300" : "text-ibm-gray-60"
              )}>
                Key milestones in our agile development process
              </p>
            </div>

            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex flex-col md:flex-row items-start md:items-center rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg border p-6",
                    isDarkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-blue-100"
                  )}
                >
                  <div className="md:w-1/4 mb-4 md:mb-0">
                    <span className={cn(
                      "inline-block font-medium px-4 py-2 rounded-full",
                      isDarkMode
                        ? "bg-blue-900 text-blue-300"
                        : "bg-blue-100 text-blue-800"
                    )}>
                      {milestone.date}
                    </span>
                  </div>
                  <div className="md:w-3/4">
                    <h3 className={cn(
                      "text-xl font-semibold mb-1",
                      isDarkMode ? "text-gray-100" : "text-ibm-gray-100"
                    )}>
                      {milestone.title}
                    </h3>
                    <p className={cn(
                      "whitespace-pre-line",
                      isDarkMode ? "text-gray-300" : "text-ibm-gray-60"
                    )}>
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
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
            Tune Enchanter - TCD SwEng2025 Group 10
          </p>
        </div>
      </footer>
    </MainLayout>
  );
};

export default About; 