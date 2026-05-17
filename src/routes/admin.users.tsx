import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});

function UsersPage() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(0);
  const limit = 10;

  // debounce
  useState(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  });

  // simpler: useEffect
  useDebouncedReset(query, setDebounced, setPage);

  const isSearching = debounced.trim().length > 0;
  const skip = page * limit;

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["admin", "users", { debounced, skip, limit }],
    queryFn: () => {
      if (isSearching) {
        const params = new URLSearchParams({ query: debounced, limit: String(limit), skip: String(skip) });
        return apiFetch<any>(`/admin/users/search?${params}`);
      }
      const params = new URLSearchParams({ limit: String(limit), skip: String(skip) });
      return apiFetch<any>(`/admin/users?${params}`);
    },
  });

  const root = data?.data ?? data ?? {};
  const users: any[] = root.users ?? root.results ?? root.items ?? (Array.isArray(root) ? root : []);
  const totalCount: number | undefined = root.totalCount ?? root.total;
  const hasMore: boolean = root.hasMore ?? users.length === limit;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Waitlist Directory Management</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Search, paginate, and manage subscriber status.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 h-10 bg-card"
        />
      </div>

      <div className="rounded-xl border bg-card shadow-elegant overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium w-24">Position</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium w-48 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
                    Loading subscribers…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-destructive">
                    {(error as Error).message}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                    No subscribers found.
                  </td>
                </tr>
              ) : (
                users.map((u, i) => (
                  <UserRow key={u.id ?? u.email} user={u} position={u.position ?? skip + i + 1} />
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20 text-sm">
          <div className="text-muted-foreground">
            {totalCount != null ? (
              <>
                Showing <span className="font-medium text-foreground">{skip + 1}</span>–
                <span className="font-medium text-foreground">{skip + users.length}</span> of{" "}
                <span className="font-medium text-foreground">{totalCount}</span>
              </>
            ) : (
              <>Page {page + 1}</>
            )}
            {isFetching && <Loader2 className="h-3 w-3 animate-spin inline ml-2" />}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0 || isFetching}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasMore || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserRow({ user, position }: { user: any; position: number }) {
  const qc = useQueryClient();
  const status: string = user.status ?? "SUBSCRIBED";
  const mutation = useMutation({
    mutationFn: (newStatus: string) =>
      apiFetch("/admin/users/status", {
        method: "PATCH",
        body: JSON.stringify({ email: user.email, status: newStatus }),
      }),
    onSuccess: (_d, newStatus) => {
      toast.success(`Status updated to ${newStatus}`);
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({ queryKey: ["admin", "metrics"] });
    },
    onError: (e: any) => toast.error(e.message || "Update failed"),
  });

  const created = user.createdAt ? new Date(user.createdAt) : null;

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3 font-mono text-xs text-muted-foreground tabular-nums">#{position}</td>
      <td className="px-4 py-3 font-medium">{user.email}</td>
      <td className="px-4 py-3 text-muted-foreground tabular-nums">
        {created ? created.toLocaleString() : "—"}
      </td>
      <td className="px-4 py-3 text-right">
        <Select
          value={status}
          onValueChange={(v) => mutation.mutate(v)}
          disabled={mutation.isPending}
        >
          <SelectTrigger className="w-40 ml-auto h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SUBSCRIBED">SUBSCRIBED</SelectItem>
            <SelectItem value="UNSUBSCRIBED">UNSUBSCRIBED</SelectItem>
          </SelectContent>
        </Select>
      </td>
    </tr>
  );
}

import { useEffect } from "react";
function useDebouncedReset(
  value: string,
  setDebounced: (v: string) => void,
  setPage: (n: number) => void,
) {
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(value);
      setPage(0);
    }, 300);
    return () => clearTimeout(t);
  }, [value, setDebounced, setPage]);
}
