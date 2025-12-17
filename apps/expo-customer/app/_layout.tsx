import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0a0a0f' },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
        <Stack.Screen
          name="review"
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: 'Rate Your Driver',
            headerStyle: { backgroundColor: '#12121a' },
            headerTintColor: '#f5f5f7',
          }}
        />
        <Stack.Screen
          name="chat"
          options={{
            presentation: 'card',
            headerShown: true,
            headerTitle: 'AI Assistant',
            headerStyle: { backgroundColor: '#12121a' },
            headerTintColor: '#f5f5f7',
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
