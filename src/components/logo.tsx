import { cn } from "@/lib/utils";

export function Logo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(className)}
      {...props}
    >
      <path d="M12 2a4.5 4.5 0 0 0-4.5 4.5c0 1.94 1.25 3.59 3 4.24" />
      <path d="M12 2a4.5 4.5 0 0 1 4.5 4.5c0 1.94-1.25 3.59-3 4.24" />
      <path d="M10.5 10.74a6.5 6.5 0 0 0-8.25 5.76" />
      <path d="M13.5 10.74a6.5 6.5 0 0 1 8.25 5.76" />
      <path d="M12 22v-6" />
      <path d="m9 12-2 3" />
      <path d="m15 12 2 3" />
    </svg>
  );
}
