'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Root layout crashed:', error);
  }, [error]);

  return (
    <html lang="id">
      <body>
        <div
          style={{
            display: 'flex',
            minHeight: '100vh',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            padding: '16px',
            textAlign: 'center',
            fontFamily: 'Arial, Helvetica, sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              width: '80px',
              height: '80px',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '9999px',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
            }}
          >
            <AlertTriangle size={40} />
          </div>

          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 600, margin: '0 0 8px' }}>Terjadi Kesalahan Serius</h1>
            <p style={{ maxWidth: '384px', fontSize: '14px', color: '#6B7280', margin: 0 }}>Maaf, halaman ini gagal dimuat sama sekali. Silakan coba muat ulang.</p>
          </div>

          <button
            onClick={reset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '9999px',
              border: '1px solid #D1D5DB',
              background: '#FFFFFF',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            <RotateCcw size={16} />
            Muat Ulang
          </button>
        </div>
      </body>
    </html>
  );
}
