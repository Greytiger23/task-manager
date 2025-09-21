// components/ui/Navbar.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  return (
    <nav className="fixed w-full top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo and App Title */}
        <Link href="/">
          <div className="flex items-center space-x-2 cursor-pointer">
            <Image
              src="/logo.svg" // Path to your logo in the public directory
              alt="Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-2xl font-bold text-gray-800">Task Manager</span>
          </div>
        </Link>

        {/* Buttons */}
        <div className="flex items-center space-x-4">
          <Link href="/auth/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/auth/signup">
            <Button>Get Started</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}