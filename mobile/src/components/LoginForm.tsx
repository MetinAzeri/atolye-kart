import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Brand } from '@/constants/brand';
import { useAuth } from '@/context/AuthContext';

const ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'E-posta veya şifre hatalı',
  'User already registered': 'Bu e-posta zaten kayıtlı',
};

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await signup(email.trim(), password, username.trim());
      }
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bir hata oluştu, lütfen tekrar deneyin.';
      setError(ERROR_MESSAGES[message] ?? message);
    } finally {
      setSubmitting(false);
    }
  }

  function toggleMode() {
    setMode((current) => (current === 'login' ? 'signup' : 'login'));
    setError(null);
  }

  return (
    <View style={styles.form}>
      <TextInput
        style={styles.input}
        placeholder="E-posta"
        placeholderTextColor={Brand.textSecondary}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      {mode === 'signup' && (
        <TextInput
          style={styles.input}
          placeholder="Kullanıcı Adı"
          placeholderTextColor={Brand.textSecondary}
          value={username}
          onChangeText={setUsername}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        placeholderTextColor={Brand.textSecondary}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error && <Text style={styles.errorMessage}>{error}</Text>}
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, submitting && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>
          {submitting
            ? mode === 'login'
              ? 'Giriş yapılıyor...'
              : 'Kayıt olunuyor...'
            : mode === 'login'
              ? 'Giriş Yap'
              : 'Kayıt Ol'}
        </Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.buttonSecondary, pressed && styles.buttonSecondaryPressed]}
        onPress={toggleMode}
        disabled={submitting}
      >
        <Text style={styles.buttonSecondaryText}>
          {mode === 'login' ? 'Hesabın yok mu? Kayıt Ol' : 'Zaten hesabın var mı? Giriş Yap'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    width: '100%',
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Brand.textPrimary,
    backgroundColor: Brand.cardBg,
  },
  errorMessage: {
    fontSize: 12,
    color: '#a13f2c',
  },
  button: {
    minHeight: 48,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Brand.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: Brand.accentDark,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  buttonSecondary: {
    minHeight: 48,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Brand.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondaryPressed: {
    backgroundColor: Brand.bg,
  },
  buttonSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: Brand.textPrimary,
  },
});
