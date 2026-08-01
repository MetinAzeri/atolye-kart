import { useState } from 'react';
import { Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CeramicPreview } from '@/components/CeramicPreview';
import { CheckoutForm } from '@/components/CheckoutForm';
import { Brand } from '@/constants/brand';
import { useCart } from '@/context/CartContext';
import { products } from '@/data/products';
import { assetUrl } from '@/lib/assets';

export default function CartScreen() {
  const { items, incrementItem, decrementItem, totalPrice } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const checkoutModal = (
    <Modal
      visible={checkoutOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setCheckoutOpen(false)}
    >
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <Pressable style={styles.modalClose} onPress={() => setCheckoutOpen(false)} hitSlop={12}>
          <Text style={styles.modalCloseText}>✕</Text>
        </Pressable>
        <KeyboardAvoidingView style={styles.safeArea} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets
          >
            <CheckoutForm onClose={() => setCheckoutOpen(false)} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.subtitle}>Sepetiniz boş.</Text>
        </View>
        {checkoutModal}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        {items.map((item) => {
          const product = products.find((p) => p.id === item.productId);
          return (
            <View key={item.productId} style={styles.row}>
              {product && <Image source={{ uri: assetUrl(product.images[0]) }} style={styles.image} />}
              {!product && item.custom && (
                <View style={styles.image}>
                  <CeramicPreview
                    type={item.custom.type as 'plate' | 'cup' | 'tray' | 'vase'}
                    color={item.custom.color}
                    pattern={item.custom.pattern}
                    text={item.custom.text}
                    size={40}
                  />
                </View>
              )}
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <View style={styles.qtyControls}>
                  <Pressable style={styles.qtyButton} onPress={() => decrementItem(item.productId)}>
                    <Text style={styles.qtyButtonText}>−</Text>
                  </Pressable>
                  <Text style={styles.qtyValue}>{item.quantity}</Text>
                  <Pressable style={styles.qtyButton} onPress={() => incrementItem(item.productId)}>
                    <Text style={styles.qtyButtonText}>+</Text>
                  </Pressable>
                </View>
              </View>
              <Text style={styles.total}>{item.price * item.quantity}₺</Text>
            </View>
          );
        })}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Genel Toplam</Text>
          <Text style={styles.totalAmount}>{totalPrice}₺</Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.checkoutButton, pressed && styles.checkoutButtonPressed]}
          onPress={() => setCheckoutOpen(true)}
        >
          <Text style={styles.checkoutButtonText}>Siparişi Tamamla</Text>
        </Pressable>
      </ScrollView>
      {checkoutModal}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Brand.bg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  subtitle: {
    fontSize: 14,
    color: Brand.textSecondary,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Brand.cardBg,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  info: {
    flex: 1,
    gap: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: Brand.textPrimary,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Brand.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Brand.textPrimary,
  },
  qtyValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Brand.textPrimary,
    minWidth: 16,
    textAlign: 'center',
  },
  total: {
    fontSize: 15,
    fontWeight: '700',
    color: Brand.accentDark,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Brand.border,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Brand.textPrimary,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: Brand.accentDark,
  },
  checkoutButton: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: Brand.accent,
    alignItems: 'center',
  },
  checkoutButtonPressed: {
    backgroundColor: Brand.accentDark,
  },
  checkoutButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  modalClose: {
    alignSelf: 'flex-end',
    width: 32,
    height: 32,
    marginTop: 12,
    marginRight: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.cardBg,
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: '600',
    color: Brand.textSecondary,
  },
  modalContent: {
    padding: 20,
    paddingBottom: 40,
  },
});
