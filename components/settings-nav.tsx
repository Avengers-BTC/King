"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  CreditCard, 
  SlidersHorizontal
} from "lucide-react";

interface SettingsNavProps extends React.HTMLAttributes<HTMLElement> {}

export function SettingsNav({ className, ...props }: SettingsNavProps) {
  const pathname = usePathname();

  const items = [
    {
      title: "Profile",
      href: "/settings/profile",
      icon: User,
    },
    {
      title: "Security",
      href: "/settings/security",
      icon: Lock,
    },
    {
      title: "Notifications",
      href: "/settings/notifications",
      icon: Bell,
    },
    {
      title: "Privacy",
      href: "/settings/privacy",
      icon: Shield,
    },
    {
      title: "Billing",
      href: "/settings/billing",
      icon: CreditCard,
    },
    {
      title: "Preferences",
      href: "/settings/preferences",
      icon: SlidersHorizontal,
    },
  ];

  return (
    <nav
      className={cn("flex flex-col space-y-1", className)}
      {...props}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              pathname === item.href
                ? "bg-muted hover:bg-muted"
                : "hover:bg-transparent hover:underline",
              "justify-start"
            )}
          >
            <Icon className="mr-2 h-4 w-4" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
