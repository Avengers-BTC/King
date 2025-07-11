"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function TestComponent() {
  const pathname = usePathname();
  
  return (
    <div className={cn("flex", "flex-col")}>
      <Link
        href="/test"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "justify-start"
        )}
      >
        Test Link
      </Link>
    </div>
  );
}
