// components/admin/dashboard/stat-card.tsx

import { type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  className?: string;
}

export function StatCard({ label, value, icon: Icon, className }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className={cn('flex size-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary', className)}>
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-2xl font-semibold text-foreground text-center">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
