import { useMemo, useState } from "react";
import { SectionList, ActivityIndicator } from "react-native";
import { YStack, Text, XStack } from "tamagui";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { Header } from "@/components/layout/Header";
import { RegistroCard } from "@/components/registro/RegistroCard";
import { Chip } from "@/components/ui/Chip";
import { FAB } from "@/components/ui/FAB";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { useAuth } from "@/hooks/useAuth";
import { useRegistros } from "@/hooks/useRegistros";
import { CATEGORY_CONFIG } from "@/lib/constants";
import {
  getCategoryColor,
  todayISO,
  formatDate,
  formatDayHeader,
} from "@/lib/utils";
import type { Category, Registro } from "@/types";

const allCategories = Object.entries(CATEGORY_CONFIG) as [
  Category,
  (typeof CATEGORY_CONFIG)[Category],
][];

function groupByDay(registros: Registro[]) {
  const map = new Map<string, Registro[]>();
  for (const r of registros) {
    const day = new Date(r.event_date).toISOString().split("T")[0];
    if (!map.has(day)) map.set(day, []);
    map.get(day)!.push(r);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([day, data]) => ({ title: day, data }));
}

export function HomeScreen() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<string | undefined>();
  const { registros, loading, hasMore, loadMore } = useRegistros({
    category: filter,
  });
  const router = useRouter();

  const sections = useMemo(() => groupByDay(registros), [registros]);

  return (
    <ScreenContainer>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <YStack marginBottom="$3">
            <Header name={user?.name ?? "Usuário"} />
            <Text color="$textSecondary" fontSize="$2" marginBottom="$3">
              {formatDate(todayISO())}
            </Text>
            <XStack gap="$2" flexWrap="wrap">
              <Chip
                label="Todos"
                color="#666"
                selected={!filter}
                onPress={() => setFilter(undefined)}
              />
              {allCategories.map(([key, cfg]) => (
                <Chip
                  key={key}
                  label={cfg.label}
                  icon={
                    <cfg.icon
                      size={14}
                      color={filter === key ? "#fff" : "rgba(245,240,232,0.6)"}
                    />
                  }
                  color={getCategoryColor(key)}
                  selected={filter === key}
                  onPress={() => setFilter(filter === key ? undefined : key)}
                />
              ))}
            </XStack>
          </YStack>
        }
        renderSectionHeader={({ section: { title } }) => (
          <Text
            color="$accent"
            fontSize="$3"
            fontWeight="700"
            marginTop="$4"
            marginBottom="$2"
          >
            {formatDayHeader(title)}
          </Text>
        )}
        renderItem={({ item }) => <RegistroCard registro={item} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loading && registros.length > 0 ? (
            <YStack padding="$4" alignItems="center">
              <ActivityIndicator color="#E08A38" />
            </YStack>
          ) : !hasMore && registros.length > 0 ? (
            <Text
              color="$textMuted"
              fontSize="$2"
              textAlign="center"
              padding="$4"
            >
              Todos os registros carregados
            </Text>
          ) : null
        }
        ListEmptyComponent={
          loading ? (
            <LoadingOverlay />
          ) : (
            <YStack
              flex={1}
              justifyContent="center"
              alignItems="center"
              padding="$6"
            >
              <Text color="$textSecondary" fontSize="$4">
                Nenhum registro ainda 📝
              </Text>
              <Text color="$textMuted" fontSize="$2" marginTop="$2">
                Toque em + para criar seu primeiro registro
              </Text>
            </YStack>
          )
        }
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      <FAB onPress={() => router.push("/(tabs)/new")} />
    </ScreenContainer>
  );
}
