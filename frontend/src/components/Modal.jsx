import React from "react";

export default function Modal({ show, title, children, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-[420px] relative animate-slideUp">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-xl transition"
        >
          ✕
        </button>

        {/* Title */}
        <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
          {title}
        </h3>

        {/* Content passed from parent */}
        <div className="text-gray-700">{children}</div>

      </div>
    </div>
  );
}
