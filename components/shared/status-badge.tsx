import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: {
    label: 'Menunggu Verifikasi',
    className: 'bg-warning/15 text-warning border-warning/30',
  },
  approved: {
    label: 'Disetujui',
    className: 'bg-success/15 text-success border-success/30',
  },
  rejected: {
    label: 'Ditolak',
    className: 'bg-destructive/15 text-destructive border-destructive/30',
  },
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: '' };

  return (
    <Badge variant="outline" className={cn('font-medium', config.className)}>
      {config.label}
    </Badge>
  );
}
