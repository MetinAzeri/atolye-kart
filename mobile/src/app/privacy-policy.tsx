import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand } from '@/constants/brand';

const SECTIONS = [
  {
    title: 'Hangi Kişisel Veriler Toplanıyor',
    text: 'Sipariş, atölye kaydı ve stok bildirimi formlarını doldurduğunuzda Ad Soyad, Telefon ve E-posta bilgilerinizi topluyoruz. Bu bilgiler yalnızca ilgili formu gönderdiğinizde, sizin girdiğiniz şekliyle alınır.',
  },
  {
    title: 'Bu Veriler Ne Amaçla Kullanılıyor',
    text: 'Topladığımız veriler; siparişinizin işleme alınması, atölye kaydınızın onaylanması ve stoğa giren ürünler için size bildirim gönderilmesi amacıyla kullanılır. Verileriniz bu amaçlar dışında kullanılmaz.',
  },
  {
    title: 'Üçüncü Taraf Paylaşımı',
    text: 'Form gönderimleri n8n webhook altyapısı üzerinden işlenir; hesap ve oturum bilgileriniz Supabase üzerinde saklanır. Verileriniz, sipariş/kayıt sürecinin işletilmesi dışında üçüncü taraflarla paylaşılmaz veya pazarlama amacıyla kullanılmaz.',
  },
  {
    title: 'Veri Saklama Süresi',
    text: 'Kişisel verileriniz, ilgili hesap veya sipariş kaydı silinene kadar saklanır. Hesabınızın veya kaydınızın silinmesini talep etmek için bizimle iletişime geçebilirsiniz.',
  },
  {
    title: 'İletişim',
    text: 'Kişisel verilerinizle ilgili sorularınız için info@kilhaneatolye.com adresinden bize ulaşabilirsiniz.',
  },
];

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Gizlilik Politikası</Text>
        <Text style={styles.intro}>
          Bu sayfa, Kilhane Atölye üzerinden gönderdiğiniz formlarda hangi kişisel verilerin toplandığını ve bu
          verilerin nasıl kullanıldığını açıklar.
        </Text>
        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionText}>{section.text}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Brand.bg,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Brand.textPrimary,
    marginBottom: 14,
  },
  intro: {
    fontSize: 14,
    lineHeight: 22,
    color: Brand.textSecondary,
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Brand.textPrimary,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 21,
    color: Brand.textSecondary,
  },
});
