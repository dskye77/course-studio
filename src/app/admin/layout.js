"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { isAdmin } from "@/lib/firebaseAdmin";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAdminUser, setIsAdminUser] = React.useState(false);
  const [checking, setChecking] = React.useState(true);

  useEffect(() => {
    async function checkAdmin() {
      if (!loading && !user) {
        router.push("/login");
        return;
      }

      if (user) {
        const adminStatus = await isAdmin();
        setIsAdminUser(adminStatus);
        if (!adminStatus) {
          router.push("/");
        }
      }
      setChecking(false);
    }

    checkAdmin();
  }, [user, loading, router]);

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-96 w-full max-w-4xl" />
      </div>
    );
  }

  if (!isAdminUser) return null;

  return <div className="min-h-screen">{children}</div>;
}
