import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { HeaderBackButton } from '@/components/HeaderBackButton';
import { HeaderProfileButton } from '@/components/HeaderProfileButton';
import { Toast } from '@/components/Toast';
import { Brand } from '@/constants/brand';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider, useCart } from '@/context/CartContext';

function TabsNavigator() {
  const { totalCount } = useCart();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Brand.accent,
        tabBarInactiveTintColor: Brand.textSecondary,
        headerStyle: { backgroundColor: Brand.cardBg },
        headerTintColor: Brand.textPrimary,
        headerRight: () => <HeaderProfileButton />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="urunler"
        options={{
          title: 'Ürünler',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'pricetags' : 'pricetags-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="kendin-tasarla"
        options={{
          title: 'Tasarla',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'color-palette' : 'color-palette-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="atolyeler"
        options={{
          title: 'Atölyeler',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sepet"
        options={{
          title: 'Sepet',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'cart' : 'cart-outline'} size={size} color={color} />
          ),
          tabBarBadge: totalCount > 0 ? totalCount : undefined,
        }}
      />
      <Tabs.Screen
        name="hesabim"
        options={{
          title: 'Hesabım',
          href: null,
          headerLeft: () => <HeaderBackButton />,
          headerRight: () => null,
        }}
      />
      <Tabs.Screen
        name="biz-kimiz"
        options={{
          title: 'Biz Kimiz',
          href: null,
          headerLeft: () => <HeaderBackButton />,
        }}
      />
      <Tabs.Screen
        name="privacy-policy"
        options={{
          title: 'Gizlilik Politikası',
          href: null,
          headerLeft: () => <HeaderBackButton />,
          headerRight: () => null,
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <CartProvider>
          <View style={{ flex: 1 }}>
            <TabsNavigator />
            <Toast />
          </View>
        </CartProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
