import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

// Scaffold placeholder for Step 1. The mobile approval inbox (pending list /
// approval detail / status receipt) is built in Step 9 onward (PRD §8).
export default function App() {
  return (
    <View style={styles.container}>
      <Text>AI Agent Desk — Mobile approval inbox (scaffold)</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
