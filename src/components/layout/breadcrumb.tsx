"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { Fragment } from "react";

export function Breadcrumb() {
  const pathname = usePathname();
  
  const generateBreadcrumbs = () => {
    const asPathWithoutQuery = pathname.split("?")[0];
    const asPathNestedRoutes = asPathWithoutQuery.split("/").filter(v => v.length > 0);
    
    const crumblist = asPathNestedRoutes.map((subpath, idx) => {
      const href = "/" + asPathNestedRoutes.slice(0, idx + 1).join("/");
      const title = subpath.charAt(0).toUpperCase() + subpath.slice(1).replace(/-/g, " ");
      return { href, title };
    });

    return crumblist;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 mb-6">
      <Link 
        href="/" 
        className="flex items-center hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {breadcrumbs.map((crumb, index) => (
        <Fragment key={crumb.href}>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          {index === breadcrumbs.length - 1 ? (
            <span className="text-gray-900 dark:text-white font-medium">
              {crumb.title}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              {crumb.title}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  );
}