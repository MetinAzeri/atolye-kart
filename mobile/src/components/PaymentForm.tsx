import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Brand } from '@/constants/brand';

function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function PaymentForm({ onConfirm, onBack }: { onConfirm: () => Promise<void>; onBack: () => void }) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu, lütfen tekrar deneyin.');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <View style={styles.form}>
      <Text style={styles.title}>Ödeme Bilgileri</Text>

      <View style={styles.cardPreview}>
        <Text style={styles.cardNumber}>{cardNumber || '•••• •••• •••• ••••'}</Text>
        <View style={styles.cardBottom}>
          <Text style={styles.cardName}>{(cardName || 'AD SOYAD').toUpperCase()}</Text>
          <Text style={styles.cardExpiry}>{expiry || 'AA/YY'}</Text>
        </View>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Kart Numarası"
        placeholderTextColor={Brand.textSecondary}
        keyboardType="number-pad"
        value={cardNumber}
        onChangeText={(text) => setCardNumber(formatCardNumber(text))}
        maxLength={19}
      />
      <TextInput
        style={styles.input}
        placeholder="Kart Üzerindeki İsim"
        placeholderTextColor={Brand.textSecondary}
        value={cardName}
        onChangeText={setCardName}
      />
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.rowInput]}
          placeholder="AA/YY"
          placeholderTextColor={Brand.textSecondary}
          keyboardType="number-pad"
          value={expiry}
          onChangeText={(text) => setExpiry(formatExpiry(text))}
          maxLength={5}
        />
        <TextInput
          style={[styles.input, styles.rowInput]}
          placeholder="CVV"
          placeholderTextColor={Brand.textSecondary}
          keyboardType="number-pad"
          value={cvv}
          onChangeText={(text) => setCvv(text.replace(/\D/g, '').slice(0, 3))}
          maxLength={3}
        />
      </View>

      <Text style={styles.hint}>Bu bir demo sitesidir, gerçek ödeme alınmamaktadır.</Text>
      {error && <Text style={styles.errorMessage}>{error}</Text>}

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, processing && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={processing}
        >
          {processing ? (
            <View style={styles.processingRow}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.buttonText}>İşleniyor...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Ödemeyi Onayla</Text>
          )}
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.buttonSecondary, pressed && styles.buttonSecondaryPressed]}
          onPress={onBack}
          disabled={processing}
        >
          <Text style={styles.buttonSecondaryText}>Geri</Text>
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Brand.textPrimary,
    marginBottom: 4,
  },
  cardPreview: {
    padding: 20,
    borderRadius: 14,
    backgroundColor: Brand.accentDark,
    gap: 28,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 2,
    color: '#fff',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 12,
  },
  cardName: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: '#fff',
    opacity: 0.9,
  },
  cardExpiry: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    opacity: 0.9,
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
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  rowInput: {
    flex: 1,
  },
  hint: {
    fontSize: 12,
    color: Brand.textSecondary,
  },
  errorMessage: {
    fontSize: 12,
    color: '#a13f2c',
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
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
