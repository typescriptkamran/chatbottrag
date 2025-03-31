"use client";

import Link from "next/link";

interface HeaderProps {
  activePage: "chat" | "upload";
}

export default function Header({ activePage }: HeaderProps) {
  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-800">
            Car Rental Assistant
          </Link>
          <div className="flex space-x-4">
            <Link
              href="/chat"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activePage === "chat"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Chat
            </Link>
            <Link
              href="/upload"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activePage === "upload"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Upload
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
} 