import type { EntryInput } from "@/schemas/entry.schema";
import { entryService } from "@/services/entry.service";
import { useAuthStore } from "@/stores/auth.store";
import { useEntryStore } from "@/stores/entry.store";
import { useCallback, useEffect, useRef, useState } from "react";

const PAGE_SIZE = 5;

export function useEntries(filters?: { category?: string }) {
  const { entries, loading, setEntries, addEntry, removeEntry, setLoading } =
    useEntryStore();
  const userId = useAuthStore((s) => s.user?.id);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);
  const filterRef = useRef(filters?.category);

  // Reset when filter changes
  useEffect(() => {
    if (filterRef.current !== filters?.category) {
      filterRef.current = filters?.category;
      offsetRef.current = 0;
      setHasMore(true);
      setEntries([]);
    }
  }, [filters?.category]);

  const fetchPage = useCallback(
    async (reset = false) => {
      if (!userId) return;
      if (reset) {
        offsetRef.current = 0;
        setHasMore(true);
      }
      setLoading(true);
      try {
        const data = await entryService.list(userId, {
          category: filters?.category,
          offset: offsetRef.current,
          limit: PAGE_SIZE,
        });
        if (reset || offsetRef.current === 0) {
          setEntries(data);
        } else {
          setEntries([...entries, ...data]);
        }
        offsetRef.current += data.length;
        if (data.length < PAGE_SIZE) setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [userId, filters?.category, entries],
  );

  // Initial load + reload on filter change
  useEffect(() => {
    offsetRef.current = 0;
    setHasMore(true);
    if (userId) {
      setLoading(true);
      entryService
        .list(userId, {
          category: filters?.category,
          offset: 0,
          limit: PAGE_SIZE,
        })
        .then((data) => {
          setEntries(data);
          offsetRef.current = data.length;
          if (data.length < PAGE_SIZE) setHasMore(false);
        })
        .finally(() => setLoading(false));
    }
  }, [userId, filters?.category]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPage(false);
    }
  }, [loading, hasMore, fetchPage]);

  const create = async (input: EntryInput) => {
    if (!userId) return;
    const entry = await entryService.create(userId, input);
    addEntry(entry);
    return entry;
  };

  const remove = async (id: string) => {
    await entryService.remove(id);
    removeEntry(id);
  };

  const refetch = useCallback(() => fetchPage(true), [fetchPage]);

  return { entries, loading, hasMore, create, remove, refetch, loadMore };
}
