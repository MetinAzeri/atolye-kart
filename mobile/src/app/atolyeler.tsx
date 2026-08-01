import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WorkshopCalendar } from '@/components/WorkshopCalendar';
import { WorkshopDetail } from '@/components/WorkshopDetail';
import { Brand } from '@/constants/brand';
import { workshops, type Workshop } from '@/data/workshops';

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export default function WorkshopsScreen() {
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Atölyeler</Text>
        <Text style={styles.intro}>
          Büyükler, Baba-Çocuk ve Anne-Çocuk atölyelerimize takvimden uygun bir gün seçip katılabilirsiniz.
        </Text>
        <WorkshopCalendar
          month={month}
          workshops={workshops}
          selectedDate={selectedWorkshop ? selectedWorkshop.date : null}
          onSelectDate={setSelectedWorkshop}
          onMonthChange={setMonth}
        />
        <WorkshopDetail workshop={selectedWorkshop} onClose={() => setSelectedWorkshop(null)} />
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
    fontSize: 22,
    fontWeight: '700',
    color: Brand.textPrimary,
    marginBottom: 8,
  },
  intro: {
    fontSize: 14,
    lineHeight: 21,
    color: Brand.textSecondary,
    marginBottom: 24,
  },
});
