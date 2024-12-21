import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 py-12 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-8 md:mb-0"></div>
        <div className="space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <Link
            href="/privacy"
            prefetch={false}
            className="hover:text-gray-800 dark:hover:text-gray-200"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            prefetch={false}
            className="hover:text-gray-800 dark:hover:text-gray-200"
          >
            Terms of Service
          </Link>
          <Link
            href="/contact"
            prefetch={false}
            className="hover:text-gray-800 dark:hover:text-gray-200"
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
