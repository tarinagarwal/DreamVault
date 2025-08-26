import React from "react";
import { Github, ExternalLink, Heart } from "lucide-react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-white border-t border-neutral-600 mt-5">
      <div className="theme-container py-12">
        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2 text-neutral-400 text-sm">
            <span>Made by</span>
            <a
              href="https://tarinagarwal.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 hover:text-brand-300 transition-colors duration-200 inline-flex items-center space-x-1"
            >
              <span>Tarin Agarwal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="text-neutral-400 text-sm">
            © {currentYear} Dream Vault. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
