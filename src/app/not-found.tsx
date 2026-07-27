"use client";

import { Star, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="flex items-center gap-2 mb-6">
        <Star className="w-6 h-6 fill-black text-black" />
        <span className="text-xl font-bold text-black tracking-tight">Vanguard AI Platform</span>
      </div>
      <h1 className="text-5xl font-normal text-black mb-3">404 — Page Not Found</h1>
      <p className="text-gray-600 text-sm max-w-md mx-auto mb-8">
        The page you are looking for does not exist or has been moved.
      </p>
      <a
        href="/"
        className="bg-black text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </a>
    </div>
  );
}
