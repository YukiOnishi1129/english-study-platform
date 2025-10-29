"use client";

import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";

import type { UnitStudyBreadcrumbItem } from "../UnitStudyContent/useUnitStudyContent";

interface UnitStudyBreadcrumbProps {
  items: UnitStudyBreadcrumbItem[];
}

export function UnitStudyBreadcrumb({ items }: UnitStudyBreadcrumbProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <BreadcrumbItem key={item.id}>
              {item.href && !isLast ? (
                <BreadcrumbLink asChild>
                  <Link href={{ pathname: item.href }}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
              {!isLast ? <BreadcrumbSeparator /> : null}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
