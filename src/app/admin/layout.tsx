import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | Love Facts Stickers",
  description: "Admin dashboard for managing Love Facts stickers and viewing download analytics",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
