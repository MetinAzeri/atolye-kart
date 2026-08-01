import { View } from 'react-native';

import type { Product } from '@/data/products';
import { ProductCard } from './ProductCard';

export function ProductList({ products }: { products: Product[] }) {
  return (
    <View style={{ gap: 24 }}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </View>
  );
}
