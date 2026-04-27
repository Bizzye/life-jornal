import { useCallback, useEffect, useRef, useState } from "react";
import { useRegistroStore } from "@/stores/registro.store";
import { useAuthStore } from "@/stores/auth.store";
import { registroService } from "@/services/registro.service";
import type { RegistroInput } from "@/schemas/registro.schema";

const PAGE_SIZE = 5;

export function useRegistros(filters?: { category?: string }) {
  const {
    registros,
    loading,
    setRegistros,
    addRegistro,
    removeRegistro,
    setLoading,
  } = useRegistroStore();
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
      setRegistros([]);
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
        const data = await registroService.list(userId, {
          category: filters?.category,
          offset: offsetRef.current,
          limit: PAGE_SIZE,
        });
        if (reset || offsetRef.current === 0) {
          setRegistros(data);
        } else {
          setRegistros([...registros, ...data]);
        }
        offsetRef.current += data.length;
        if (data.length < PAGE_SIZE) setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [userId, filters?.category, registros],
  );

  // Initial load + reload on filter change
  useEffect(() => {
    offsetRef.current = 0;
    setHasMore(true);
    if (userId) {
      setLoading(true);
      registroService
        .list(userId, {
          category: filters?.category,
          offset: 0,
          limit: PAGE_SIZE,
        })
        .then((data) => {
          setRegistros(data);
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

  const create = async (input: RegistroInput) => {
    if (!userId) return;
    const registro = await registroService.create(userId, input);
    addRegistro(registro);
    return registro;
  };

  const remove = async (id: string) => {
    await registroService.remove(id);
    removeRegistro(id);
  };

  const refetch = useCallback(() => fetchPage(true), [fetchPage]);

  return { registros, loading, hasMore, create, remove, refetch, loadMore };
}
