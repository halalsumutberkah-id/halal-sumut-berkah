import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { FOOTER_MENU_LINKS } from '@/lib/public-nav-links';
import { siteConfig } from '@/lib/site-config';

const SOCIAL_LINKS = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/dinas-koperasi-usaha-kecil-dan-menengah-provinsi-sumatera-utara/',
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/diskopukmsu/',
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/diskopukmprovsu',
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@diskopukmsumut',
  },
];

// Person In Charge - kontak resmi yang bisa dihubungi langsung dari
// halaman publik buat pertanyaan seputar layanan
const PIC_CONTACTS = [
  { name: 'Fattah', phone: '0822-7774-75' },
  { name: 'Miftah', phone: '0831-5376-7253' },
  { name: 'Irsyad', phone: '0813-2133-6371' },
  { name: 'Lupe', phone: '0896-6338-9282' },
];

function toWhatsappHref(phone: string) {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/62${digits.replace(/^0/, '')}`;
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-screen-2xl px-4 py-14 sm:px-6 md:py-16 lg:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Kolom Kiri: Branding & Links (7 Kolom) */}
          <div className="flex flex-col gap-8 lg:col-span-7">
            {/* Logo & Deskripsi */}
            <div className="flex flex-col gap-3 sm:max-w-lg">
              <div className="flex items-center gap-3">
                <Image src="/images/logo_sumutprov.png" alt="Logo Pemerintah Provinsi Sumatera Utara" width={44} height={44} />
                <span className="flex flex-col leading-tight">
                  <span className="text-base font-bold tracking-wide text-foreground">HALAL SUMUT</span>
                  <span className="text-base font-bold tracking-wide text-primary">BERKAH</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{siteConfig.description}</p>
            </div>

            {/* Menu, Sosial Media, Kontak, dan PIC */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-foreground">Menu</h3>
                <nav className="flex flex-col gap-2">
                  {FOOTER_MENU_LINKS.map((link) => (
                    <Link key={link.href} href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-foreground">Sosial Media</h3>
                <div className="flex flex-col gap-2">
                  {SOCIAL_LINKS.map((social) => (
                    <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                      {social.label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-foreground">Kontak</h3>
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <a href="mailto:info@halalsumutberkah.id" className="flex items-center gap-2 transition-colors hover:text-primary">
                    <Mail className="size-4 shrink-0" />
                    info@halalsumutberkah.id
                  </a>
                  <a href="tel:+62617654321" className="flex items-center gap-2 transition-colors hover:text-primary">
                    <Phone className="size-4 shrink-0" />
                    (061) 765-4321
                  </a>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-foreground">PIC Layanan</h3>
                <div className="flex flex-col gap-2">
                  {PIC_CONTACTS.map((pic) => (
                    <a key={pic.name} href={toWhatsappHref(pic.phone)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
                      <MessageCircle className="size-4 shrink-0" />
                      <span>
                        {pic.name} - {pic.phone}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Google Maps Iframe (5 Kolom) */}
          <div className="flex flex-col gap-3 lg:col-span-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <MapPin className="size-4 text-primary" />
              Lokasi Kantor
            </h3>
            <div className="h-56 w-full overflow-hidden rounded-xl border border-border shadow-sm sm:h-64 lg:h-full lg:min-h-55">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3981.9830679767456!2d98.634206!3d3.591357699999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30312e462fc1c2af%3A0x5b50e50e3194710!2sDINAS%20KOPERASI%20DAN%20UKM%20PROVSU!5e0!3m2!1sid!2sid!4v1787677674917!5m2!1sid!2sid"
                className="h-full w-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Peta Lokasi Dinas Koperasi dan UKM Provinsi Sumatera Utara"
              />
            </div>
          </div>
        </div>

        {/* Baris Bawah */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {year} Halal Sumut Berkah.</p>
          <p className="text-center">Dinas Koperasi Usaha Kecil dan Menengah Sumatera Utara. All rights reserved</p>
          <div className="flex items-center gap-4">
            <Link href="/syarat-ketentuan" className="hover:text-primary">
              Syarat & Ketentuan
            </Link>
            <Link href="/kebijakan-privasi" className="hover:text-primary">
              Kebijakan Privasi
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
