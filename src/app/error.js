"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminError({ error, reset }) {
  useEffect(() => {
    console.error("Admin runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center mb-6 text-rose-600 dark:text-rose-400">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h1 className="text-2xl font-bold font-serif text-gray-900 dark:text-white mb-2">
        Something Went Wrong
      </h1>
      <p className="text-sm text-gray-500 max-w-sm mb-6">
        An unexpected error occurred while loading this administrative view.
      </p>
      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition shadow-sm"
      >
        <RefreshCw className="w-4 h-4" /> Try Again
      </button>
    </div>
  );
}

