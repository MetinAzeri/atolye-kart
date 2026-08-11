import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Brand } from '@/constants/brand';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { sendWebhookEvent } from '@/lib/webhook';
import { PaymentForm } from './PaymentForm';

export function CheckoutForm({ onClose }: { onClose: () => void }) {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState<'contact' | 'payment' | 'success'>(user ? 'payment' : 'contact');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState(false);
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);

  function handleContactSubmit() {
    if (phone.length < 10 || phone.length > 11) {
      setPhoneError(true);
      return;
    }
    setPhoneError(false);

    if (!consent) {
      setConsentError(true);
      return;
    }
    setConsentError(false);

    setStep('payment');
  }

  async function handleConfirmPayment() {
    const orderId = crypto.randomUUID();
    await Promise.all(
      items.map((item) =>
        sendWebhookEvent({
          event: 'place_order',
          orderId,
          name: user ? user.username : name.trim(),
          productId: item.productId,
          productName: item.name,
          ...(phone.trim() ? { phone: phone.trim() } : {}),
          ...(email.trim() ? { email: email.trim() } : {}),
          quantity: item.quantity,
          source: 'atolyekart',
        })
      )
    );
    clearCart();
    setStep('success');
  }

  if (step === 'success') {
    return (
      <View style={styles.form}>
        <Text style={styles.successMessage}>Ödemeniz alındı, siparişiniz oluşturuldu!</Text>
        <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={onClose}>
          <Text style={styles.buttonText}>Kapat</Text>
        </Pressable>
      </View>
    );
  }

  if (step === 'payment') {
    return <PaymentForm onConfirm={handleConfirmPayment} onBack={user ? onClose : () => setStep('contact')} />;
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
        placeholder="Telefon (5XX XXX XX XX)"
        placeholderTextColor={Brand.textSecondary}
        keyboardType="number-pad"
        value={phone}
        onChangeText={(text) => {
          setPhone(text.replace(/\D/g, '').slice(0, 11));
          setPhoneError(false);
        }}
      />
      {phoneError && <Text style={styles.errorMessage}>Telefon numarası 10-11 haneli rakamlardan oluşmalı.</Text>}
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
      {consentError && <Text style={styles.errorMessage}>Devam etmek için KVKK/gizlilik rızasını onaylamanız gerekiyor.</Text>}
      <View style={styles.actions}>
        <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={handleContactSubmit}>
          <Text style={styles.buttonText}>Devam</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.buttonSecondary, pressed && styles.buttonSecondaryPressed]}
          onPress={onClose}
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
