import Link from "next/link";
import { Facebook, Twitter, Instagram } from "lucide-react";

/* ── Data ── */

const PRODUCT_LINKS = [
  { label: "For Photographers", href: "#photographers" },
  { label: "For Guests", href: "#for-guests" },
  { label: "Showcase", href: "#" },
] as const;

const COMPANY_LINKS = [
  { label: "About", href: "#" },
  { label: "Careers", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Contact", href: "#" },
] as const;

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Cookie Policy", href: "#" },
  { label: "Security", href: "#" },
] as const;

const SOCIALS = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
] as const;

/* ── Sub-components ── */

interface FooterLinkGroupProps {
  title: string;
  links: ReadonlyArray<{ label: string; href: string }>;
}

function FooterLinkGroup({ title, links }: FooterLinkGroupProps) {
  return (
    <div>
      <h4 className="font-bold text-black uppercase tracking-widest text-xs mb-6 pb-2 border-b border-black inline-block">
        {title}
      </h4>
      <ul className="space-y-4 text-xs text-gray-600 uppercase list-none p-0">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="hover:text-black hover:underline transition-colors no-underline text-gray-600"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Footer ── */

export function LandingFooter() {
  return (
    <footer className="bg-white py-16 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
        {/* Brand */}
        <div className="col-span-2 md:col-span-2">
          <Link
            href="/"
            className="flex flex-col items-start text-2xl tracking-widest uppercase text-black no-underline mb-6"
          >
            SPOTME
          </Link>
          <p className="text-gray-600 text-xs uppercase leading-relaxed max-w-sm mb-8">
            The fastest, most secure way to distribute event photos. Find
            yourself in seconds, not hours.
          </p>
          <div className="flex gap-4">
            {SOCIALS.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 border border-black bg-white flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors"
                >
                  <Icon size={16} strokeWidth={1.5} aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </div>

        <FooterLinkGroup title="Product" links={PRODUCT_LINKS} />
        <FooterLinkGroup title="Company" links={COMPANY_LINKS} />
        <FooterLinkGroup title="Legal" links={LEGAL_LINKS} />
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto pt-8 border-t-2 border-black flex flex-col md:flex-row justify-between items-center gap-4 mt-16">
        <p className="text-xs text-gray-500 uppercase tracking-widest">
          © 2026 SpotMe Technologies. All rights reserved.
        </p>
        <p className="text-xs text-gray-500 uppercase tracking-widest">
          Built with ❤️ by Novera
        </p>
      </div>
    </footer>
  );
}
