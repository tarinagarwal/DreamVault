import React from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft, Search, AlertTriangle } from "lucide-react";

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative">
            <div className="text-8xl sm:text-9xl font-bold text-primary-200 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full flex items-center justify-center shadow-lg animate-bounce-soft">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="card">
          <div className="card-body">
            <h1 className="text-3xl font-bold text-secondary-900 mb-4">
              Page Not Found
            </h1>
            <p className="text-secondary-600 mb-8 text-lg">
              Oops! The page you're looking for doesn't exist. It might have
              been moved, deleted, or you entered the wrong URL.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="btn-primary inline-flex items-center justify-center group"
              >
                <Home className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
