import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">MusicFlow</h1>
        </div>
      </header>
      
      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>
      
      <nav className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-around">
            <Link
              to="/"
              className={`flex-1 text-center py-3 px-4 ${
                location.pathname === '/'
                  ? 'text-blue-600 border-t-2 border-blue-600'
                  : 'text-gray-500'
              }`}
            >
              홈
            </Link>
            <Link
              to="/library"
              className={`flex-1 text-center py-3 px-4 ${
                location.pathname === '/library'
                  ? 'text-blue-600 border-t-2 border-blue-600'
                  : 'text-gray-500'
              }`}
            >
              라이브러리
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}