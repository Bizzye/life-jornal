import { EntryCard } from '@/components/entry/EntryCard';
import { Header } from '@/components/layout/Header';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { FAB } from '@/components/ui/FAB';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { useAuth } from '@/hooks/useAuth';
import { useEntries } from '@/hooks/useEntries';
import { formatDate, formatDayHeader, todayISO } from '@/lib/utils';
import { useCategoryStore } from '@/stores/category.store';
import type { Registro } from '@/types';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  SectionList,
  StyleSheet,
  View,
} from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

function groupByDay(registros: Registro[]) {
  const map = new Map<string, Registro[]>();
  for (const r of registros) {
    const day = new Date(r.event_date).toISOString().split('T')[0];
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
  const { entries, loading, hasMore, loadMore } = useEntries({
    category_id: filter,
  });
  const router = useRouter();
  const storeCategories = useCategoryStore((s) => s.categories);

  const sections = useMemo(() => groupByDay(entries), [entries]);

  return (
    <ScreenContainer>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <YStack marginBottom="$3">
            <Header name={user?.name ?? 'Usuário'} />
            <Text color="$textSecondary" fontSize="$2" marginBottom="$3">
              {formatDate(todayISO())}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={chipStyles.scroll}
            >
              <Pressable
                onPress={() => setFilter(undefined)}
                style={[chipStyles.chip, !filter && chipStyles.chipAllSelected]}
              >
                <Text
                  color={!filter ? '#fff' : 'rgba(245,240,232,0.6)'}
                  fontSize={13}
                  fontWeight="600"
                >
                  Todos
                </Text>
              </Pressable>
              {storeCategories.map((cat) => {
                const isSelected = filter === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => setFilter(isSelected ? undefined : cat.id)}
                    style={[
                      chipStyles.chip,
                      isSelected && { backgroundColor: cat.color, borderColor: cat.color },
                    ]}
                  >
                    <View
                      style={[chipStyles.dot, { backgroundColor: isSelected ? '#fff' : cat.color }]}
                    />
                    <Text
                      color={isSelected ? '#fff' : 'rgba(245,240,232,0.6)'}
                      fontSize={13}
                      fontWeight={isSelected ? '600' : '500'}
                    >
                      {cat.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </YStack>
        }
        renderSectionHeader={({ section: { title, data } }) => (
          <XStack alignItems="center" gap="$2" marginTop="$5" marginBottom="$3" paddingBottom="$2">
            <View style={daySeparator.badge}>
              <Text color="#fff" fontSize={13} fontWeight="700">
                {formatDayHeader(title)}
              </Text>
            </View>
            <Text color="$textMuted" fontSize={12}>
              {data.length} {data.length === 1 ? 'registro' : 'registros'}
            </Text>
            <View style={daySeparator.line} />
          </XStack>
        )}
        renderItem={({ item }) => (
          <EntryCard registro={item} onPress={() => router.push(`/registro/${item.id}` as any)} />
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loading && entries.length > 0 ? (
            <YStack padding="$4" alignItems="center">
              <ActivityIndicator color="#E08A38" />
            </YStack>
          ) : !hasMore && entries.length > 0 ? (
            <Text color="$textMuted" fontSize="$2" textAlign="center" padding="$4">
              Todos os registros carregados
            </Text>
          ) : null
        }
        ListEmptyComponent={
          loading ? (
            <LoadingOverlay />
          ) : (
            <YStack flex={1} justifyContent="center" alignItems="center" padding="$6">
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

      <FAB onPress={() => router.push('/(tabs)/new')} />
    </ScreenContainer>
  );
}

const chipStyles = StyleSheet.create({
  scroll: {
    gap: 8,
    paddingRight: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chipAllSelected: {
    backgroundColor: 'rgba(245,240,232,0.15)',
    borderColor: 'rgba(245,240,232,0.25)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

const daySeparator = StyleSheet.create({
  badge: {
    backgroundColor: 'rgba(224,138,56,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
});
