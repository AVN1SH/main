"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { User2, LogOut, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { isAuthenticated, removeCookie } from "@/utils/cookieUtils";
import { fetchUserProfile } from "@/app/(home)/api/actions/ProfileListAction";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export type NavSection =
  | "explore"
  | "sample-paper"
  | "full-syllabus"
  | "subject-test"
  | "chapter-test";

interface NavigationProps {
  activeSection?: NavSection;
  onSectionChange?: (section: NavSection) => void;
}

/* ------------------------------------------------------------------ */
/*  Navigation                                                          */
/* ------------------------------------------------------------------ */

const Navigation = ({
  activeSection = "explore",
  onSectionChange,
}: NavigationProps) => {
  const router = useRouter();
  const [auth, setAuth] = useState(false);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);

  // Auth check
  useEffect(() => {
    const loggedIn = isAuthenticated();
    setAuth(loggedIn);
    if (loggedIn) {
      fetchUserProfile().then((res) => {
        if (res?.user_details) setUserDetails(res.user_details);
      });
    }
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (
        productsRef.current &&
        !productsRef.current.contains(e.target as Node)
      ) {
        setProductsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch {}
    removeCookie();
    router.push("/");
  };

  const handlePricingClick = () => {
    const el = document.getElementById("pricing-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  };

  const PRODUCTS = [
    {
      label: "Sample Papers",
      section: "sample-paper" as NavSection,
      icon: "📄",
      desc: "Official pattern practice",
    },
    {
      label: "Full Syllabus Test",
      section: "full-syllabus" as NavSection,
      icon: "📚",
      desc: "Complete course coverage",
    },
    {
      label: "Subject Test",
      section: "subject-test" as NavSection,
      icon: "🔬",
      desc: "Single subject deep dive",
    },
    {
      label: "Chapter Test",
      section: "chapter-test" as NavSection,
      icon: "📖",
      desc: "Chapter-level precision",
    },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-between px-5 sm:px-8 transition-all duration-200 ${
        scrolled
          ? "bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm"
          : "bg-white border-b border-slate-100"
      }`}
    >
      {/* ── LEFT: Logo + Nav ── */}
      <div className="flex items-center gap-4 min-w-0">
        {/* Logo */}
        <Link
          href="/sarthaks-ai"
          className="flex items-center gap-2 shrink-0"
        >
          <Image
            src="/images/ai/ai-logo.svg"
            alt="Sarthaks AI"
            width={32}
            height={32}
            className="size-8"
          />
          <span className="font-extrabold text-slate-800 text-[15px] hidden sm:block">
            Sarthaks <span className="text-indigo-600">AI</span>
          </span>
        </Link>

        <span className="h-5 w-px bg-slate-200 hidden sm:block" />

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-1 text-[13px]">
          {/* Products dropdown */}
          <div className="relative" ref={productsRef}>
            <button
              onClick={() => setProductsOpen(!productsOpen)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                productsOpen
                  ? "text-indigo-600 bg-indigo-50"
                  : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              Products
              <ChevronDown
                size={13}
                className={`transition-transform ${productsOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {productsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/8 overflow-hidden py-2 z-50"
                >
                  {PRODUCTS.map((p) => (
                    <button
                      key={p.section}
                      onClick={() => {
                        onSectionChange?.(p.section);
                        setProductsOpen(false);
                        // Scroll to tools section
                        setTimeout(() => {
                          document
                            .getElementById("tools-section")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }, 50);
                      }}
                      className={`flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-indigo-50 transition-colors ${
                        activeSection === p.section
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-700"
                      }`}
                    >
                      <span className="text-lg">{p.icon}</span>
                      <div>
                        <p className="text-sm font-bold leading-tight">
                          {p.label}
                        </p>
                        <p className="text-[11px] text-slate-400 leading-tight">
                          {p.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pricing */}
          <button
            onClick={handlePricingClick}
            className="px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-colors"
          >
            Pricing
          </button>
        </nav>
      </div>

      {/* ── RIGHT: Auth ── */}
      <div className="flex items-center gap-3 shrink-0">
        {auth ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 rounded-full transition-colors"
            >
              {userDetails?.user_profile_pic ? (
                <Image
                  src={userDetails.user_profile_pic}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full object-cover w-8 h-8 border-2 border-indigo-200"
                />
              ) : (
                <div className="flex items-center justify-center size-9 rounded-full bg-indigo-100 text-indigo-600">
                  <User2 size={18} />
                </div>
              )}
              <ChevronDown
                size={12}
                className={`text-slate-500 transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 overflow-hidden z-50"
                >
                  {userDetails && (
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {userDetails.user_name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {userDetails.email}
                      </p>
                    </div>
                  )}
                  <div className="p-1.5">
                    <Link
                      href="/my-profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors"
                    >
                      <User2 size={16} />
                      Profile
                    </Link>
                  </div>
                  <div className="border-t border-slate-100 p-1.5">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-semibold text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <>
            <Link
              href="/login"
              className="text-[13px] font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="text-[13px] rounded-lg bg-indigo-600 px-4 py-2 font-bold text-white transition-colors hover:bg-indigo-700 shadow-sm"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Navigation;
export type { NavigationProps };
