"use client";
//src\hooks\usePermissions.ts
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export type PermissionItem = {
  dmcnSlug: string;
  listPermission?: { psName: string; allowed: boolean }[];
};

export default function usePermissions() { 
  const { status } = useSession();
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/permissions", { credentials: "include" });
      const data = await res.json();  
      if (data?.ok) setPermissions(data.permissions || []);
    } finally {
      setLoading(false);
    }
  }
 
  
  useEffect(() => { 
    if (status === "authenticated") { 
      load();                    
    }
  }, [status]);

  return { permissions, loading, reloadPermissions: load };
}
