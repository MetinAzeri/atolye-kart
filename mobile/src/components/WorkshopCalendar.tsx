import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/brand';
import type { Workshop } from '@/data/workshops';

const monthNames = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function WorkshopCalendar({
  month,
  workshops,
  selectedDate,
  onSelectDate,
  onMonthChange,
}: {
  month: Date;
  workshops: Workshop[];
  selectedDate: string | null;
  onSelectDate: (workshop: Workshop) => void;
  onMonthChange: (date: Date) => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatDate(today);

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const workshopByDate: Record<string, Workshop> = {};
  workshops.forEach((w) => {
    workshopByDate[w.date] = w;
  });

  const cells = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, monthIndex, day);
    const dateStr = formatDate(date);
    cells.push({
      day,
      dateStr,
      workshop: workshopByDate[dateStr] || null,
      isPast: dateStr < todayStr,
      isToday: dateStr === todayStr,
    });
  }

  const isCurrentMonth = year === today.getFullYear() && monthIndex === today.getMonth();

  function goPrevMonth() {
    onMonthChange(new Date(year, monthIndex - 1, 1));
  }

  function goNextMonth() {
    onMonthChange(new Date(year, monthIndex + 1, 1));
  }

  return (
    <View style={styles.calendar}>
      <View style={styles.header}>
        <Pressable
          style={[styles.navButton, isCurrentMonth && styles.navButtonDisabled]}
          disabled={isCurrentMonth}
          onPress={goPrevMonth}
        >
          <Text style={styles.navButtonText}>←</Text>
        </Pressable>
        <Text style={styles.title}>{`${monthNames[monthIndex]} ${year}`}</Text>
        <Pressable style={styles.navButton} onPress={goNextMonth}>
          <Text style={styles.navButtonText}>→</Text>
        </Pressable>
      </View>

      <View style={styles.grid}>
        {cells.map((cell) => {
          const disabled = cell.isPast || !cell.workshop;
          return (
            <Pressable
              key={cell.dateStr}
              disabled={disabled}
              onPress={() => cell.workshop && onSelectDate(cell.workshop)}
              style={({ pressed }) => [
                styles.day,
                cell.isPast && styles.dayPast,
                cell.isToday && styles.dayToday,
                cell.dateStr === selectedDate && styles.daySelected,
                pressed && !disabled && styles.dayPressed,
              ]}
            >
              <Text style={styles.dayNumber}>{cell.day}</Text>
              {cell.workshop && (
                <View style={styles.event}>
                  <View style={[styles.dot, { backgroundColor: cell.workshop.color }]} />
                  <Text style={styles.eventLabel}>{cell.workshop.label}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  calendar: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  navButton: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 10,
    backgroundColor: Brand.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    fontSize: 16,
    color: Brand.accentDark,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Brand.textPrimary,
  },
  grid: {
    gap: 8,
  },
  day: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 12,
    backgroundColor: Brand.cardBg,
  },
  dayPast: {
    opacity: 0.4,
  },
  dayToday: {
    borderColor: Brand.accent,
  },
  daySelected: {
    borderColor: Brand.accent,
    backgroundColor: '#fdf1e6',
  },
  dayPressed: {
    borderColor: Brand.accent,
  },
  dayNumber: {
    width: 20,
    fontSize: 13,
    fontWeight: '600',
    color: Brand.textPrimary,
  },
  event: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  eventLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Brand.textPrimary,
  },
});
