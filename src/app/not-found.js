import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function AdminNotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center mb-6 text-gray-500">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h1 className="text-2xl font-bold font-serif text-gray-900 dark:text-white mb-2">
        Page Not Found
      </h1>
      <p className="text-sm text-gray-500 max-w-sm mb-6">
        The administration view or resource you are seeking does not exist or has been relocated.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
    </div>
  );
}

