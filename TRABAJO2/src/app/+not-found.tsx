import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function NotFoundScreen() {
  return (
    <ThemedView>
      <ThemedText type="title">Página no encontrada</ThemedText>
    </ThemedView>
  );
}