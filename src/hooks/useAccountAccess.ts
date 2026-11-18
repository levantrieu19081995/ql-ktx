"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

import { fetchOrganizationsByAccount } from "@/services/organizations/OrganizationsService";
import type { OrganizationNode, OrganizationRole } from "@/types/type-organizations";

type UseAccountAccessResult = {
  organizations: OrganizationNode[];
  roles: OrganizationRole[];
  isAdmin: boolean;
  loading: boolean;
};

export default function useAccountAccess(): UseAccountAccessResult {
  const { data: session, status } = useSession();
  const [organizations, setOrganizations] = useState<OrganizationNode[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const accountId = Number(session?.user?.id ?? 0);

    if (status !== "authenticated" || !accountId) {
      setOrganizations([]);
      setLoading(false);
      return;
    }

    const loadOrganizations = async () => {
      try {
        setLoading(true);
        const response = await fetchOrganizationsByAccount({
          acocuntId: accountId,
          fetchOrganizationRole: true,
        });

        setOrganizations(Array.isArray(response?.payload) ? response.payload : []);
      } catch (error) {
        console.error("Loi lay to chuc va vai tro tai khoan:", error);
        setOrganizations([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrganizations();
  }, [session?.user?.id, status]);

  const roles = useMemo(
    () =>
      organizations.flatMap((organization) =>
        Array.isArray(organization.roles) ? organization.roles : [],
      ),
    [organizations],
  );

  const isAdmin = useMemo(
    () =>
      roles.some(
        (role) => Number(role.roleId) === 1 || role.roleName === "SuperAdmin",
      ),
    [roles],
  );

  return {
    organizations,
    roles,
    isAdmin,
    loading,
  };
}
