'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface FaqSectionProps {
  faqs?: FaqItem[];
}

const DEFAULT_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Apa syarat utama mendaftarkan usaha di platform Halal Sumut Berkah?',
    answer: 'Usaha anda sudah memiliki sertifikat halal yang masih berlaku, beserta Nomor Induk Berusaha (NIB). Data usaha, data produk, dan dokumen sertifikat halal perlu diisi lengkap saat pendaftaran.',
  },
  {
    id: 'faq-2',
    question: 'Apakah ada biaya untuk mendaftar di platform ini?',
    answer: 'Pendaftaran dan verifikasi data melalui platform ini tidak dikenakan biaya. Biaya penerbitan sertifikat halal itu sendiri mengikuti ketentuan resmi dari lembaga sertifikasi terkait, di luar platform ini.',
  },
  {
    id: 'faq-3',
    question: 'Apa peran Lembaga Pemeriksa Halal (LPH) dalam proses pendaftaran ini?',
    answer: 'LPH mitra memverifikasi keabsahan sertifikat halal yang anda unggah serta kelengkapan dan kesesuaian data usaha yang diajukan, sebelum usaha anda disetujui tampil di katalog publik.',
  },
  {
    id: 'faq-4',
    question: 'Kapan produk UMKM akan muncul di katalog publik?',
    answer: 'Produk akan otomatis tampil di katalog halal publik setelah LPH menyetujui dan memverifikasi data usaha serta sertifikat halal yang anda ajukan.',
  },
];

export function FaqSection({ faqs = DEFAULT_FAQS }: FaqSectionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="mx-auto max-w-screen-2xl px-4 py-16 sm:px-6 lg:px-10">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <div className="top-28 flex flex-col gap-3 lg:sticky">
            <div className="border-l-4 border-yellow-500 pl-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">Pusat Bantuan</span>
              <h2 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">Pertanyaan yang Sering Diajukan</h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">Rangkuman jawaban seputar pendaftaran usaha, verifikasi data, dan keterlibatan LPH di Sumatera Utara.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3.5 lg:col-span-7">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div key={faq.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                <button type="button" onClick={() => toggleFaq(faq.id)} className="flex w-full items-center justify-between gap-4 p-5 text-left text-sm font-semibold text-foreground sm:p-6 sm:text-base">
                  <span>{faq.question}</span>
                  <ChevronDown className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180 text-foreground' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div key="content" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }}>
                      <div className="border-t border-border px-5 pb-5 pt-3 text-xs leading-relaxed text-muted-foreground sm:px-6 sm:pb-6 sm:text-sm">{faq.answer}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
