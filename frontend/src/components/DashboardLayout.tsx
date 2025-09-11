'use client';

import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { FaCompass, FaPlusCircle, FaBook } from 'react-icons/fa';

type Props = {
  children: ReactNode;
};

const navLinks = [
  { href: '/', label: 'New Trip', icon: <FaPlusCircle className="mr-2" /> },
  { href: '/library', label: 'My Library', icon: <FaBook className="mr-2" /> },
  { href: '/discover', label: 'Discover', icon: <FaCompass className="mr-2" /> },
];

export default function DashboardLayout({ children }: Props) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
      <aside className="w-72 bg-gradient-to-b from-blue-900 via-slate-900 to-slate-950 border-r border-slate-800 flex flex-col py-8 px-6 shadow-xl">
        <div className="mb-12 flex items-center gap-3 justify-center">
          <span className="inline-block bg-gradient-to-r from-blue-400 to-purple-500 rounded-full p-2">
            <FaCompass className="text-white text-2xl" />
          </span>
          <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 tracking-tight">
            Auryvia
          </span>
        </div>
        <nav className="flex flex-col gap-3">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="w-full">
              <Button
                variant={pathname === link.href ? 'default' : 'ghost'}
                className={`w-full flex items-center justify-start text-lg px-5 py-3 rounded-lg shadow-md transition-all ${pathname === link.href ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
                style={{ fontWeight: pathname === link.href ? 700 : 500 }}
              >
                {link.icon}
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-10 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Auryvia
        </div>
      </aside>
      <main className="flex-1 flex items-center justify-center p-0 sm:p-0 md:p-0 overflow-y-auto bg-gradient-to-br from-blue-900 via-slate-900 to-purple-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full h-full flex items-center justify-center"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}