import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Brand } from '@/constants/brand';
import type { Product } from '@/data/products';
import { sendWebhookEvent } from '@/lib/webhook';

export function StockNotifyForm({ product, onCancel }: { product: Product; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSubmit() {
    if (!consent) {
      setConsentError(true);
      return;
    }
    setConsentError(false);
    setSubmitting(true);
    setFeedback(null);
    try {
      await sendWebhookEvent({
        event: 'request_stock_notification',
        name: name.trim(),
        productId: product.id,
        productName: product.name,
        email: email.trim(),
        source: 'atolyekart',
      });
      setFeedback({ type: 'success', text: 'Bildirim isteğiniz alındı, stok geldiğinde haber vereceğiz.' });
    } catch (error) {
      console.error('[StockNotifyForm] submit failed', error);
      const text = error instanceof Error ? error.message : 'Bir hata oluştu, lütfen tekrar deneyin.';
      setFeedback({ type: 'error', text });
    } finally {
      setSubmitting(false);
    }
  }

  if (feedback?.type === 'success') {
    return <Text style={styles.successMessage}>{feedback.text}</Text>;
  }

  return (
    <View style={styles.form}>
      <TextInput
        style={styles.input}
        placeholder="Ad Soyad"
        placeholderTextColor={Brand.textSecondary}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="E-posta"
        placeholderTextColor={Brand.textSecondary}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <Pressable
        style={styles.checkboxRow}
        onPress={() => {
          setConsent((current) => !current);
          setConsentError(false);
        }}
      >
        <View style={[styles.checkbox, consent && styles.checkboxChecked]}>
          {consent && <Text style={styles.checkboxMark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>
          Kişisel verilerimin işlenmesine ve{' '}
          <Text style={styles.link} onPress={() => router.push('/privacy-policy')}>
            Gizlilik Politikası
          </Text>
          'nda belirtilen amaçlarla kullanılmasına izin veriyorum.
        </Text>
      </Pressable>
      {consentError && (
        <Text style={styles.errorMessage}>Devam etmek için KVKK/gizlilik rızasını onaylamanız gerekiyor.</Text>
      )}
      {feedback?.type === 'error' && <Text style={styles.errorMessage}>{feedback.text}</Text>}
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, submitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>{submitting ? 'Gönderiliyor...' : 'Gönder'}</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.buttonSecondary, pressed && styles.buttonSecondaryPressed]}
          onPress={onCancel}
          disabled={submitting}
        >
          <Text style={styles.buttonSecondaryText}>Vazgeç</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    width: '100%',
    marginTop: 16,
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: Brand.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: Brand.accent,
    borderColor: Brand.accent,
  },
  checkboxMark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: Brand.textSecondary,
  },
  link: {
    color: Brand.accentDark,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  errorMessage: {
    fontSize: 12,
    color: '#a13f2c',
  },
  successMessage: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
    color: '#3f6b4a',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  button: {
    flexGrow: 1,
    flexBasis: 120,
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
    flexGrow: 1,
    flexBasis: 120,
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
