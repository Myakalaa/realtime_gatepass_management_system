import React from "react";

export default function Button({
  text,
  onClick,
  type = "button",
  color = "blue",
}) {
  const styles = {
    blue: "from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700",
    green: "from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700",
    red: "from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700",
    yellow: "from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        px-6 py-3 
        text-white 
        font-semibold 
        rounded-xl 
        shadow-md 
        bg-gradient-to-r
        ${styles[color]}
        transition-all 
        duration-300
        active:scale-95
        hover:shadow-xl
      `}
    >
      {text}
    </button>
  );
}
