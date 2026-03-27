import { Card, CardContent } from "@/components/ui/card";
import {
  ImageIcon,
  Search,
  Download,
  FolderOpen,
  Eye,
  Zap,
  ScanFace,
} from "lucide-react";
import type { DashboardStats } from "@/actions/stats";

// ─── Stat Card ───────────────────────────────────────────────────

const iconMap: Record<string, React.ReactNode> = {
  albums: <FolderOpen className="h-5 w-5 text-primary" />,
  images: <ImageIcon className="h-5 w-5 text-primary" />,
  searches: <Search className="h-5 w-5 text-primary" />,
  downloads: <Download className="h-5 w-5 text-primary" />,
};

export function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <Card className="border-border bg-card overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            {iconMap[icon] ?? <Zap className="h-5 w-5 text-primary" />}
          </div>
          <div>
            <p className="text-2xl font-bold font-serif tabular-nums">
              {value.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground font-sans">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Recent Activity List ────────────────────────────────────────

const actionLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  album_viewed: {
    label: "Album viewed",
    icon: <Eye className="h-4 w-4 text-muted-foreground" />,
  },
  search_started: {
    label: "Search started",
    icon: <ScanFace className="h-4 w-4 text-muted-foreground" />,
  },
  match_found: {
    label: "Match found",
    icon: <Zap className="h-4 w-4 text-muted-foreground" />,
  },
  image_downloaded: {
    label: "Image downloaded",
    icon: <Download className="h-4 w-4 text-muted-foreground" />,
  },
};

function getRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(date).toLocaleDateString();
}

export function RecentActivityList({
  activities,
}: {
  activities: DashboardStats["recentActivity"];
}) {
  if (activities.length === 0) {
    return (
      <p className="text-sm text-muted-foreground/60 text-center py-8 font-sans">
        No activity yet.
      </p>
    );
  }

  return (
    <ul className="space-y-1">
      {activities.map((activity, index) => {
        const info = actionLabels[activity.action] ?? {
          label: activity.action,
          icon: <Zap className="h-4 w-4 text-muted-foreground" />,
        };

        return (
          <li
            key={`${activity.action}-${index}`}
            className="flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted/10"
            style={{
              animation: "fade-up 0.4s ease-out forwards",
              animationDelay: `${index * 0.03}s`,
              opacity: 0,
            }}
          >
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted/15">
              {info.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-sans leading-tight">
                {info.label}
              </p>
              <p className="text-xs text-muted-foreground/70 truncate font-sans">
                {activity.albumTitle}
              </p>
            </div>
            <span className="text-xs text-muted-foreground/50 whitespace-nowrap font-sans">
              {getRelativeDate(activity.createdAt)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
