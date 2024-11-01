// src/app/notification/page.tsx
"use client";

import React from "react";

export default function Notification() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-lg shadow-lg text-center max-w-md">
        <h1 className="text-3xl font-bold text-gray-700 mb-4">Notifications</h1>
        <p className="text-gray-500 text-lg">
          Stay tuned! This feature is coming soon.
        </p>
        <div className="mt-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-16 h-16 text-blue-500 mx-auto"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m9 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <button
          className="mt-8 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          onClick={() => alert("Notifications coming soon!")}
        >
          Learn More
        </button>
      </div>
    </div>
  );
}
