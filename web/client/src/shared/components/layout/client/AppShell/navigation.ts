import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  HelpCircle,
  LayoutDashboard,
  PlayCircle,
  Settings,
} from "lucide-react";
import type { Route } from "next";

export interface NavigationItem {
  label: string;
  href?: Route;
  icon: LucideIcon;
  comingSoon?: boolean;
}

export const mainNavigation: NavigationItem[] = [
  {
    label: "ダッシュボード",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "教材一覧",
    href: "/materials",
    icon: BookOpen,
  },
  {
    label: "学習する",
    icon: PlayCircle,
    comingSoon: true,
  },
  {
    label: "学習分析",
    icon: BarChart3,
    comingSoon: true,
  },
];

export const secondaryNavigation: NavigationItem[] = [
  {
    label: "ヘルプセンター",
    icon: HelpCircle,
    comingSoon: true,
  },
  {
    label: "設定",
    icon: Settings,
    comingSoon: true,
  },
];
