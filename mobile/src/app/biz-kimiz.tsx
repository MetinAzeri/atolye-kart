import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand } from '@/constants/brand';
import { assetUrl } from '@/lib/assets';

const ABOUT_TEXT =
  'Her şey bir avuç toprak ve sabırla başladı. Kilhane Atölye, elleriyle üretmenin değerine inanan birkaç ustanın bir araya gelmesiyle doğdu. Burada her kase, her vazo, saatlerce çamurun tekerlek üzerinde şekillenmesiyle, sırının özenle sürülmesiyle, fırının ateşiyle hayat buluyor. Bize göre bir seramik parçası sadece bir eşya değil — o günün ruh haliyle şekillenen, kusurları bile güzel olan bir emek hikâyesi. Seri üretimin aksine, burada aynı iki parça birbirinin tıpatıp aynısı olmaz; her biri kendine has bir karaktere sahiptir. Mutfağınıza, sofranıza koyduğunuz her parçayla, aslında bir zanaatkârın elinden geçmiş bir hikâyeyi de eve taşımış olursunuz.';

const FAMILY_TEXT =
  'Bu atölye bizim için sadece bir iş değil, birlikte geçirdiğimiz zamanın, öğrendiğimiz sabrın ve yarattığımız hikayelerin adı. Kilhane Atölye, ailecek büyüttüğümüz küçük bir dünya.';

const members = [
  {
    name: 'Metin',
    quote:
      'Bu atölyeyi kurarken aslında ellerimle bir şeyler yaratmanın verdiği huzuru arıyordum. Her parçada bir sabır dersi, her başarısız denemede yeni bir başlangıç var.',
  },
  {
    name: 'Seda',
    quote:
      'Toprağın elimde şekil almasını izlemek, günün telaşından uzaklaşabildiğim tek an. Kusurlu bile olsa, kendi ellerimizin izini taşıyan bir şey yaratmak çok değerli.',
  },
  {
    name: 'Atlas',
    quote:
      'Çamurla oynamayı çok seviyorum! Annem ve babamla birlikte küçük kaseler yapıyoruz, bazen şekli bozuluyor ama gülüyoruz, tekrar deniyoruz.',
  },
];

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Biz Kimiz</Text>
        <Text style={styles.text}>{ABOUT_TEXT}</Text>
        <View style={styles.gallery}>
          <Image source={{ uri: assetUrl('assets/about/biz-kimiz-1.jpg') }} style={styles.galleryImage} />
          <Image source={{ uri: assetUrl('assets/about/biz-kimiz-2.jpg') }} style={styles.galleryImage} />
          <Image source={{ uri: assetUrl('assets/about/biz-kimiz-3.jpg') }} style={styles.galleryImage} />
        </View>

        <Text style={[styles.title, styles.familyTitle]}>Aile</Text>
        <View style={styles.memberList}>
          {members.map((member) => (
            <View key={member.name} style={styles.memberCard}>
              <View style={styles.memberIcon}>
                <Text style={styles.memberIconText}>{member.name.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberQuote}>{member.quote}</Text>
            </View>
          ))}
        </View>
        <Image source={{ uri: assetUrl('assets/family/aile-hep-birlikte.jpg') }} style={styles.familyPhoto} />
        <Text style={styles.text}>{FAMILY_TEXT}</Text>
        <Pressable
          style={({ pressed }) => [styles.privacyLink, pressed && styles.privacyLinkPressed]}
          onPress={() => router.push('/privacy-policy')}
        >
          <Text style={styles.privacyLinkText}>Gizlilik Politikası</Text>
        </Pressable>
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
  text: {
    fontSize: 14,
    lineHeight: 22,
    color: Brand.textSecondary,
  },
  gallery: {
    marginTop: 20,
    gap: 12,
  },
  galleryImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  familyTitle: {
    marginTop: 40,
  },
  memberList: {
    gap: 16,
    marginBottom: 24,
  },
  memberCard: {
    backgroundColor: Brand.cardBg,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  memberIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Brand.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  memberIconText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  memberName: {
    fontSize: 15,
    fontWeight: '700',
    color: Brand.textPrimary,
    marginBottom: 8,
  },
  memberQuote: {
    fontSize: 13,
    lineHeight: 20,
    color: Brand.textSecondary,
    textAlign: 'center',
  },
  familyPhoto: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    marginBottom: 20,
  },
  privacyLink: {
    minHeight: 48,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyLinkPressed: {
    opacity: 0.6,
  },
  privacyLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: Brand.textSecondary,
    textDecorationLine: 'underline',
  },
});
