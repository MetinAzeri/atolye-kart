import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoginForm } from '@/components/LoginForm';
import { Brand } from '@/constants/brand';
import { useAuth } from '@/context/AuthContext';

export default function AccountScreen() {
  const { user, logout, loading } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView style={styles.safeArea} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          {loading ? null : user ? (
            <View style={styles.accountCard}>
              <Text style={styles.greeting}>{`Merhaba, ${user.username}`}</Text>
              <Pressable
                style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
                onPress={logout}
              >
                <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
              </Pressable>
            </View>
          ) : (
            <LoginForm onSuccess={() => {}} />
          )}
          <Pressable
            style={({ pressed }) => [styles.privacyLink, pressed && styles.privacyLinkPressed]}
            onPress={() => router.push('/privacy-policy')}
          >
            <Text style={styles.privacyLinkText}>Gizlilik Politikası</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Brand.bg,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  accountCard: {
    gap: 12,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
    color: Brand.textPrimary,
  },
  logoutButton: {
    minHeight: 48,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Brand.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonPressed: {
    backgroundColor: Brand.cardBg,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Brand.textPrimary,
  },
  privacyLink: {
    minHeight: 48,
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyLinkPressed: {
    opacity: 0.6,
  },
  privacyLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: Brand.textSecondary,
    textDecorationLine: 'underline',
  },
});
