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
    <div className="flex min-h-screen bg-slate-950">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col py-8 px-4">
        <div className="mb-10 text-center">
          <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            WanderAI
          </span>
        </div>
        <nav className="flex flex-col gap-2">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href}>
              <Button
                variant={pathname === link.href ? 'default' : 'ghost'}
                className="w-full flex items-center justify-start text-lg"
              >
                {link.icon}
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-0 sm:p-8 md:p-12 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}