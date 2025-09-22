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
          <div className="flex items-center space-x-3 cursor-pointer">
            <Image
              src="flower-green-svgrepo-com.svg"
              alt="Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-2xl font-bold text-gray-800">Task</span>
          </div>
        </Link>

        {/* Buttons */}
        <div className="flex items-center space-x-5">
          <Link href="/auth/login">
            <Button className="text-gray-800 hover:bg-gray-100">Login</Button>
          </Link>
          <div>
            <Link href="/profile">
                <Button className="text-gray-800 hover:bg-gray-100">
                    Profile
                </Button>
            </Link>
            <Link href="/logout">
                <Button className="text-gray-800 hover:bg-gray-100">Logout</Button>
            </Link>
            <Link href="/dashboard">
                <Button>Get Started</Button>
            </Link>
            </div>
        </div>
      </div>
    </nav>
  );
}