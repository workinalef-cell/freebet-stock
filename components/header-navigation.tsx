"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  TicketIcon,
  CalculatorIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  name: string;
  href: string;
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
}

const navigation: NavItem[] = [
  { name: "Freebets", href: "/", icon: TicketIcon },
  { name: "Calculadora", href: "/calculadora", icon: CalculatorIcon },
  { name: "Estatísticas", href: "/estatisticas", icon: ChartBarIcon },
  { name: "Configurações", href: "/configuracoes", icon: Cog6ToothIcon },
];

export function HeaderNavigation() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { signOut, user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Header Bar */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-30 transition-all duration-200",
          isScrolled
            ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm"
            : "bg-white dark:bg-gray-900"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-fedora-blue to-fedora-accent flex items-center justify-center">
                  <span className="text-white font-bold text-lg">F</span>
                </div>
                <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-fedora-blue to-fedora-accent">
                  FreeBet
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "px-3 py-2 rounded-full flex items-center space-x-1 transition-all duration-200",
                      isActive
                        ? "bg-fedora-blue text-white"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right side items */}
            <div className="flex items-center space-x-2">
              {/* User info and logout - Desktop */}
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {user?.email}
                </span>
                <button
                  onClick={signOut}
                  className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
                  title="Sair"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                </button>
              </div>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-white dark:bg-gray-900 shadow-lg z-20">
          <div className="px-4 py-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "block px-3 py-3 rounded-lg flex items-center space-x-3",
                    isActive
                      ? "bg-fedora-blue/10 text-fedora-blue dark:text-fedora-accent"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5",
                      isActive ? "text-fedora-blue dark:text-fedora-accent" : ""
                    )}
                  />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
            
            {/* Mobile logout */}
            <button
              onClick={signOut}
              className="w-full px-3 py-3 rounded-lg flex items-center space-x-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      )}

      {/* Backdrop for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 z-10"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}