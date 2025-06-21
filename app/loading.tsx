import { Music } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-pink-500/20 blur-xl rounded-full animate-pulse"></div>
          <Music className="relative w-24 h-24 mx-auto text-pink-500 animate-bounce" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">Loading...</h2>
        
        <p className="text-gray-400 text-lg max-w-md mx-auto">
          Getting the party ready for you!
        </p>
      </div>
    </div>
  );
}
