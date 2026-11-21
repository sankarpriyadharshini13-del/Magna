"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Logo from "@/components/ui/Logo";
import { ArrowIcon, BagIcon, CloseIcon, LogOutIcon, MenuIcon, PackageIcon, SearchIcon, StoreIcon, UserIcon } from "@/components/ui/Icons";
import { site } from "@/data/site";
import { useCart } from "@/context/CartContext";
import { useUI, type Panel } from "@/context/UIContext";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const pathname = usePathname();
  const { open, close, panel } = useUI();
  const { count, hydrated, announcement } = useCart();
  const { user, signOut, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [hash, setHash] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const accountBtnRef = useRef<HTMLButtonElement>(null);
  const menuOpen = panel === "menu";

  /** Any panel opening dismisses the signed-in account dropdown first. */
  const openPanel = (p: Exclude<Panel, null>) => {
    setAccountOpen(false);
    open(p);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    const onHash = () => setHash(window.location.hash);
    onScroll();
    onHash();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("hashchange", onHash);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("hashchange", onHash);
    };
  }, []);
  useEffect(() => { if (menuOpen) close(); /* close menu on navigation */ // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // The account dropdown closes on navigation and after signing out.
  useEffect(() => { setAccountOpen(false); }, [pathname, user?.id]);

  // Outside click and Escape close the signed-in account dropdown (Escape returns focus to the icon).
  useEffect(() => {
    if (!accountOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!accountRef.current?.contains(e.target as Node)) setAccountOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAccountOpen(false);
        accountBtnRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [accountOpen]);

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return pathname === "/" && hash === href.slice(1);
    if (href === "/") return pathname === "/" && hash === "";
    return pathname.startsWith(href);
  };

  const navLink = (l: { href: string; label: string }, mobile = false) => (
    <Link
      key={l.href}
      href={l.href}
      aria-current={isActive(l.href) ? "page" : undefined}
      onClick={() => mobile && close()}
      className={`focus-ring whitespace-nowrap rounded-full transition-colors ${mobile ? "block px-4 py-3.5 font-display text-2xl" : "px-3 py-2 text-[15px] font-medium"} ${
        isActive(l.href) ? "bg-forest text-white" : "text-ink/75 hover:text-forest hover:bg-sand/70"
      }`}
    >
      {l.label}
    </Link>
  );

  const menuItemClass = "focus-ring flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-forest transition-colors hover:bg-sand";

  return (
    <header className={`sticky top-0 z-50 border-b transition-all duration-300 ${scrolled || menuOpen ? "border-leaf/10 bg-cream/90 shadow-soft backdrop-blur-xl" : "border-transparent bg-cream/70 backdrop-blur"}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-[70] focus:rounded-full focus:bg-forest focus:px-4 focus:py-2 focus:text-cream">
        Skip to content
      </a>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3.5 sm:gap-4 sm:px-6 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-3 lg:px-8">
        <div className="flex lg:justify-self-start">
          <Logo priority />
        </div>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-0.5 lg:flex lg:justify-self-center xl:gap-1"
        >
          {site.nav.map((l) => navLink(l))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2 lg:justify-self-end [&_.icon-btn]:h-10 [&_.icon-btn]:w-10 sm:[&_.icon-btn]:h-11 sm:[&_.icon-btn]:w-11">
          <button type="button" className="icon-btn" aria-label="Search products" onClick={() => openPanel("search")}>
            <SearchIcon />
          </button>
          <div ref={accountRef} className="relative">
            <button
              ref={accountBtnRef}
              type="button"
              className="icon-btn relative"
              aria-label={user ? `Account menu: ${user.name}` : "Sign in or create account"}
              aria-expanded={user ? accountOpen : undefined}
              aria-controls={user ? "account-menu" : undefined}
              onClick={() => {
                if (!user) return openPanel("account");
                if (panel) close(); // e.g. the mobile menu is open
                setAccountOpen((o) => !o);
              }}
            >
              <UserIcon />
              {user && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-clay" aria-hidden="true" />}
            </button>
            {user && accountOpen && (
              <div id="account-menu" className="absolute right-0 top-full z-20 mt-2 w-60 animate-fade-in rounded-2xl border border-leaf/10 bg-white p-1.5 text-left shadow-lift">
                <div className="px-3 pb-2 pt-2">
                  <p className="truncate font-display text-lg leading-tight text-forest">{user.name}</p>
                  <p className="mt-0.5 truncate text-xs text-ink/60">{user.email}</p>
                </div>
                <div className="mx-1 mb-1 h-px bg-leaf/10" aria-hidden="true" />
                {isAdmin && (
                  <Link href="/admin" onClick={() => setAccountOpen(false)} className={menuItemClass}>
                    <StoreIcon width={18} height={18} /> Admin panel
                  </Link>
                )}
                <Link href="/orders" onClick={() => setAccountOpen(false)} className={menuItemClass}>
                  <PackageIcon width={18} height={18} /> My orders
                </Link>
                <Link href="/account" onClick={() => setAccountOpen(false)} className={menuItemClass}>
                  <UserIcon width={18} height={18} /> Manage account
                </Link>
                <button
                  type="button"
                  className={menuItemClass}
                  onClick={async () => { setAccountOpen(false); await signOut(); }}
                >
                  <LogOutIcon width={18} height={18} /> Sign out
                </button>
              </div>
            )}
          </div>
          <button type="button" className="icon-btn relative" aria-label={`Open cart, ${hydrated ? count : 0} ${count === 1 ? "item" : "items"}`} onClick={() => openPanel("cart")}>
            <BagIcon />
            {hydrated && count > 0 && (
              <span data-testid="cart-count" className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-clay px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </button>
          <Link href="/shop" className="focus-ring ml-1 hidden items-center gap-2 whitespace-nowrap rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-forest-deep xl:inline-flex">
            Shop Now <ArrowIcon width={16} height={16} />
          </Link>
          <button type="button" className="icon-btn lg:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => (menuOpen ? close() : openPanel("menu"))}>
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-menu" aria-label="Mobile" className="border-t border-leaf/10 bg-cream px-4 pb-8 pt-4 lg:hidden">
          {site.nav.map((l) => navLink(l, true))}
          <Link href="/shop" onClick={close} className="btn-primary mt-6 w-full">Shop Now <ArrowIcon /></Link>
        </nav>
      )}
      <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
    </header>
  );
}
