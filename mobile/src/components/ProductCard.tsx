import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/brand';
import { categories } from '@/data/categories';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/data/products';
import { ProductImage } from './ProductImage';
import { StockNotifyForm } from './StockNotifyForm';

const stockLabels: Record<Product['stockStatus'], string> = {
  in_stock: 'Stokta',
  low_stock: 'Stokta Az',
  out_of_stock: 'Tükendi',
};

const stockStyles: Record<Product['stockStatus'], { bg: string; color: string }> = {
  in_stock: { bg: '#e3ede4', color: '#3f6b4a' },
  low_stock: { bg: '#f2dcb8', color: '#8a4a12' },
  out_of_stock: { bg: '#f2ded9', color: '#a13f2c' },
};

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const [showStockForm, setShowStockForm] = useState(false);
  const category = categories.find((item) => item.id === product.categoryId);
  const isOutOfStock = product.stockStatus === 'out_of_stock';

  useEffect(() => {
    if (!justAdded) return;
    const timer = setTimeout(() => setJustAdded(false), 1500);
    return () => clearTimeout(timer);
  }, [justAdded]);

  return (
    <View style={[styles.card, isOutOfStock && styles.cardOutOfStock]}>
      <ProductImage images={product.images} />
      {category && (
        <View style={[styles.category, { backgroundColor: category.color }]}>
          <Text style={styles.categoryText}>{category.label}</Text>
        </View>
      )}
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>{product.price}₺</Text>
      <Text style={styles.description}>{product.description}</Text>
      <View style={[styles.stock, { backgroundColor: stockStyles[product.stockStatus].bg }]}>
        <Text style={[styles.stockText, { color: stockStyles[product.stockStatus].color }]}>
          {stockLabels[product.stockStatus]}
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            isOutOfStock && styles.buttonDisabled,
            pressed && !isOutOfStock && styles.buttonPressed,
          ]}
          disabled={isOutOfStock}
          onPress={() => {
            addItem(product);
            setJustAdded(true);
          }}
        >
          <Text style={styles.buttonText}>{justAdded ? 'Eklendi ✓' : 'Sipariş Ver'}</Text>
        </Pressable>
        {isOutOfStock && (
          <Pressable
            style={({ pressed }) => [styles.buttonSecondary, pressed && styles.buttonSecondaryPressed]}
            onPress={() => setShowStockForm((current) => !current)}
          >
            <Text style={styles.buttonSecondaryText}>Stok Bildirimi İste</Text>
          </Pressable>
        )}
      </View>
      {isOutOfStock && <Text style={styles.hint}>Bu ürün stokta yok, stok bildirimi talep edebilirsiniz.</Text>}
      {isOutOfStock && showStockForm && (
        <StockNotifyForm product={product} onCancel={() => setShowStockForm(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Brand.cardBg,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  cardOutOfStock: {
    opacity: 0.6,
  },
  category: {
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: '#fff',
  },
  name: {
    fontSize: 19,
    fontWeight: '600',
    color: Brand.textPrimary,
    textAlign: 'center',
  },
  price: {
    marginTop: 6,
    marginBottom: 16,
    fontSize: 26,
    fontWeight: '700',
    color: Brand.accentDark,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: Brand.textSecondary,
    textAlign: 'center',
  },
  stock: {
    marginTop: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'column',
    gap: 8,
    width: '100%',
    marginTop: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: Brand.accent,
    alignItems: 'center',
  },
  buttonPressed: {
    backgroundColor: Brand.accentDark,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  buttonSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Brand.border,
    alignItems: 'center',
  },
  buttonSecondaryPressed: {
    backgroundColor: Brand.bg,
  },
  buttonSecondaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: Brand.textPrimary,
  },
  hint: {
    marginTop: 10,
    fontSize: 12,
    color: Brand.textSecondary,
    textAlign: 'center',
  },
});
