import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CeramicPreview, type CeramicType } from '@/components/CeramicPreview';
import { Brand } from '@/constants/brand';
import { useCart } from '@/context/CartContext';

const CUSTOM_PRICE = 450;

const productTypes: { type: CeramicType; label: string }[] = [
  { type: 'plate', label: 'Tabak' },
  { type: 'cup', label: 'Bardak' },
  { type: 'tray', label: 'Tepsi' },
  { type: 'vase', label: 'Vazo' },
];

const colorPalette = [
  { id: 'toprak', label: 'Toprak Kırmızısı', value: '#a63d2f' },
  { id: 'terracotta', label: 'Terracotta', value: '#c56a3e' },
  { id: 'zeytin', label: 'Zeytin Yeşili', value: '#7d8c4a' },
  { id: 'adacayi', label: 'Adaçayı', value: '#8a9a7e' },
  { id: 'krem', label: 'Krem', value: '#e8dcc8' },
  { id: 'kumbeji', label: 'Kum Beji', value: '#d3bd94' },
  { id: 'turkuaz', label: 'Turkuaz', value: '#4a8b8c' },
  { id: 'petrol', label: 'Petrol Mavisi', value: '#2f6169' },
  { id: 'antrasit', label: 'Antrasit', value: '#3d2b1f' },
  { id: 'kahve', label: 'Kahve', value: '#5c4130' },
  { id: 'beyaz', label: 'Beyaz', value: '#f7f3ec' },
  { id: 'hardal', label: 'Hardal', value: '#c99a2e' },
];

const patternOptions: { id: string | null; label: string }[] = [
  { id: null, label: 'Desensiz' },
  { id: 'dots', label: 'Benekler' },
  { id: 'brush', label: 'Fırça Darbeleri' },
  { id: 'olive', label: 'Zeytin Dalı' },
  { id: 'wave', label: 'Dalgalı Çizgiler' },
  { id: 'leaves', label: 'Yaprak Serpintisi' },
];

const steps = [
  { step: 1, label: 'Ürün' },
  { step: 2, label: 'Renk' },
  { step: 3, label: 'Desen' },
  { step: 4, label: 'Yazı' },
];

export default function DesignScreen() {
  const { addItem } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [type, setType] = useState<CeramicType | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [pattern, setPattern] = useState<string | null>(null);
  const [text, setText] = useState('');

  function handleSelectType(nextType: CeramicType) {
    setType(nextType);
    setColor(colorPalette[0].value);
    setPattern(null);
  }

  function goNext() {
    setCurrentStep((step) => Math.min(step + 1, 4));
  }

  function goBack() {
    setCurrentStep((step) => Math.max(step - 1, 1));
  }

  function handleAddToCart() {
    if (!type) return;
    const typeLabel = productTypes.find((item) => item.type === type)!.label;
    addItem({
      id: `custom-${Date.now()}`,
      name: `Özel Tasarım — ${typeLabel}`,
      price: CUSTOM_PRICE,
      custom: { type, color: color as string, pattern, text: text.trim() },
    });
    setCurrentStep(1);
    setType(null);
    setColor(null);
    setPattern(null);
    setText('');
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.preview}>
          {type ? (
            <CeramicPreview type={type} color={color} pattern={pattern} text={text.trim()} size={200} />
          ) : (
            <Text style={styles.previewHint}>Bir ürün tipi seçin</Text>
          )}
        </View>

        <View style={styles.stepper}>
          {steps.map((item) => (
            <View key={item.step} style={styles.stepperItem}>
              <View
                style={[
                  styles.stepBadge,
                  item.step === currentStep && styles.stepBadgeActive,
                  item.step < currentStep && styles.stepBadgeDone,
                ]}
              >
                <Text
                  style={[
                    styles.stepBadgeText,
                    (item.step === currentStep || item.step < currentStep) && styles.stepBadgeTextActive,
                  ]}
                >
                  {item.step < currentStep ? '✓' : item.step}
                </Text>
              </View>
              <Text style={styles.stepLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.panel}>
          {currentStep === 1 && (
            <View style={styles.typeGrid}>
              {productTypes.map((item) => (
                <Pressable
                  key={item.type}
                  style={({ pressed }) => [
                    styles.typeButton,
                    item.type === type && styles.selected,
                    pressed && styles.typeButtonPressed,
                  ]}
                  onPress={() => handleSelectType(item.type)}
                >
                  <CeramicPreview type={item.type} size={64} />
                  <Text style={styles.typeButtonLabel}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {currentStep === 2 && (
            <View style={styles.colorGrid}>
              {colorPalette.map((item) => (
                <Pressable
                  key={item.id}
                  accessibilityLabel={item.label}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: item.value },
                    item.value === color && styles.selected,
                  ]}
                  onPress={() => setColor(item.value)}
                />
              ))}
            </View>
          )}

          {currentStep === 3 && type && (
            <View style={styles.patternGrid}>
              {patternOptions.map((item) => (
                <Pressable
                  key={item.id ?? 'none'}
                  style={({ pressed }) => [
                    styles.patternButton,
                    item.id === pattern && styles.selected,
                    pressed && styles.patternButtonPressed,
                  ]}
                  onPress={() => setPattern(item.id)}
                >
                  <CeramicPreview type={type} color={color} pattern={item.id} size={80} />
                  <Text style={styles.patternButtonLabel}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {currentStep === 4 && (
            <View style={styles.textStep}>
              <TextInput
                style={styles.textInput}
                maxLength={12}
                placeholder="Örn. Sevgiler (opsiyonel)"
                value={text}
                onChangeText={setText}
              />
              <Text style={styles.textCount}>{text.length}/12</Text>
            </View>
          )}

          <View style={styles.actions}>
            {currentStep > 1 && (
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.actionButtonSecondary,
                  pressed && styles.actionButtonSecondaryPressed,
                ]}
                onPress={goBack}
              >
                <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>Geri</Text>
              </Pressable>
            )}
            {currentStep < 4 && (
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  currentStep === 1 && !type && styles.actionButtonDisabled,
                  pressed && !(currentStep === 1 && !type) && styles.actionButtonPressed,
                ]}
                disabled={currentStep === 1 && !type}
                onPress={goNext}
              >
                <Text style={styles.actionButtonText}>Devam</Text>
              </Pressable>
            )}
            {currentStep === 4 && (
              <Pressable
                style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
                onPress={handleAddToCart}
              >
                <Text style={styles.actionButtonText}>Sepete Ekle — {CUSTOM_PRICE}₺</Text>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Brand.bg },
  content: { padding: 20, paddingBottom: 40 },
  preview: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
    marginBottom: 20,
  },
  previewHint: { fontSize: 14, color: Brand.textSecondary },
  stepper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  stepperItem: { alignItems: 'center', gap: 6, flex: 1 },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Brand.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.cardBg,
  },
  stepBadgeActive: { backgroundColor: Brand.accent, borderColor: Brand.accent },
  stepBadgeDone: { backgroundColor: Brand.accentDark, borderColor: Brand.accentDark },
  stepBadgeText: { fontSize: 13, fontWeight: '600', color: Brand.textSecondary },
  stepBadgeTextActive: { color: '#fff' },
  stepLabel: { fontSize: 11, color: Brand.textSecondary },
  panel: {
    backgroundColor: Brand.cardBg,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 16,
    padding: 16,
  },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  typeButton: {
    width: '45%',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonPressed: { borderColor: Brand.accent },
  typeButtonLabel: { fontSize: 13, fontWeight: '600', color: Brand.textPrimary },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  patternGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  patternButton: {
    width: '30%',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  patternButtonPressed: { borderColor: Brand.accent },
  patternButtonLabel: { fontSize: 11, fontWeight: '600', color: Brand.textPrimary, textAlign: 'center' },
  selected: { borderColor: Brand.accent, backgroundColor: '#f2e3d4' },
  textStep: { alignItems: 'center', gap: 8, paddingVertical: 12 },
  textInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: Brand.textPrimary,
    backgroundColor: '#fff',
  },
  textCount: { fontSize: 12, color: Brand.textSecondary },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Brand.accent,
    alignItems: 'center',
  },
  actionButtonPressed: { backgroundColor: Brand.accentDark },
  actionButtonSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Brand.border },
  actionButtonSecondaryPressed: { backgroundColor: Brand.bg },
  actionButtonDisabled: { opacity: 0.5 },
  actionButtonText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  actionButtonTextSecondary: { color: Brand.textPrimary },
});
