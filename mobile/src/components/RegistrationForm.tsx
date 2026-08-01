import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Brand } from '@/constants/brand';
import type { Workshop } from '@/data/workshops';
import { sendWebhookEvent } from '@/lib/webhook';

function formatPhoneDisplay(digits: string) {
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 8), digits.slice(8, 10)].filter(Boolean).join(' ');
}

export function RegistrationForm({ workshop, onCancel }: { workshop: Workshop; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState(false);
  const [email, setEmail] = useState('');
  const [participantCount, setParticipantCount] = useState('');
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSubmit() {
    if (phone.length !== 10 || phone[0] !== '5') {
      setPhoneError(true);
      return;
    }
    setPhoneError(false);

    if (!consent) {
      setConsentError(true);
      return;
    }
    setConsentError(false);

    setSubmitting(true);
    setFeedback(null);
    try {
      await sendWebhookEvent({
        event: 'workshop_registration',
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        participantCount: Number(participantCount),
        workshopDate: workshop.date,
        workshopType: workshop.label,
        source: 'atolyekart',
      });
      setFeedback({ type: 'success', text: 'Kaydınız alındı, teşekkürler!' });
    } catch (error) {
      console.error('[RegistrationForm] submit failed', error);
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
        placeholder="5XX XXX XX XX"
        placeholderTextColor={Brand.textSecondary}
        keyboardType="number-pad"
        maxLength={13}
        value={formatPhoneDisplay(phone)}
        onChangeText={(text) => {
          setPhone(text.replace(/\D/g, '').slice(0, 10));
          setPhoneError(false);
        }}
      />
      {phoneError && (
        <Text style={styles.errorMessage}>Telefon numarası 5 ile başlayan 10 haneli olmalı.</Text>
      )}
      <TextInput
        style={styles.input}
        placeholder="E-posta"
        placeholderTextColor={Brand.textSecondary}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Katılımcı Sayısı"
        placeholderTextColor={Brand.textSecondary}
        keyboardType="number-pad"
        value={participantCount}
        onChangeText={setParticipantCount}
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
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
    color: '#3f6b4a',
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
