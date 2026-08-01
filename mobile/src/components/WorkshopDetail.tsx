import { useEffect, useState } from 'react';
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand } from '@/constants/brand';
import type { Workshop } from '@/data/workshops';
import { RegistrationForm } from './RegistrationForm';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 800;

function formatDisplayDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' });
}

export function WorkshopDetail({ workshop, onClose }: { workshop: Workshop | null; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const [showForm, setShowForm] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    if (workshop) {
      translateY.value = SCREEN_HEIGHT;
      translateY.value = withTiming(0, { duration: 260 });
      setShowForm(false);
    }
  }, [workshop?.date, translateY]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  function close() {
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 220 }, (finished) => {
      if (finished) runOnJS(onClose)();
    });
  }

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > DISMISS_DISTANCE || e.velocityY > DISMISS_VELOCITY) {
        close();
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 220 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!workshop) return null;

  const isCompact = keyboardVisible && showForm;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={close}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Kapat" />
        <Animated.View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }, sheetStyle]}>
          <GestureDetector gesture={pan}>
            <View style={styles.handleArea}>
              <View style={styles.handle} />
            </View>
          </GestureDetector>

          <Pressable style={styles.closeButton} onPress={close} hitSlop={12} accessibilityLabel="Kapat">
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>

          <KeyboardAvoidingView
            style={styles.keyboardAvoiding}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              automaticallyAdjustKeyboardInsets
            >
              <Animated.View layout={LinearTransition.duration(220)}>
                {isCompact ? (
                  <Animated.View
                    key="compact"
                    entering={FadeIn.duration(180)}
                    exiting={FadeOut.duration(120)}
                    style={styles.compactHeader}
                  >
                    <View style={[styles.compactDot, { backgroundColor: workshop.color }]} />
                    <Text style={styles.compactText} numberOfLines={1}>
                      {`${workshop.label.toUpperCase()} · ${formatDisplayDate(workshop.date)} · ${workshop.timeRange}`}
                    </Text>
                  </Animated.View>
                ) : (
                  <Animated.View key="expanded" entering={FadeIn.duration(180)} exiting={FadeOut.duration(120)}>
                    <View style={[styles.badge, { backgroundColor: workshop.color }]}>
                      <Text style={styles.badgeText}>{workshop.label}</Text>
                    </View>
                    <Text style={styles.date}>{formatDisplayDate(workshop.date)}</Text>
                    <Text style={styles.meta}>{`${workshop.timeRange} · ${workshop.capacity}`}</Text>
                    <Text style={styles.description}>{workshop.description}</Text>
                  </Animated.View>
                )}
              </Animated.View>

              {!showForm && (
                <Pressable
                  style={({ pressed }) => [styles.joinButton, pressed && styles.joinButtonPressed]}
                  onPress={() => setShowForm(true)}
                >
                  <Text style={styles.joinButtonText}>Katıl</Text>
                </Pressable>
              )}
              {showForm && <RegistrationForm workshop={workshop} onCancel={() => setShowForm(false)} />}
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(61, 43, 31, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Brand.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    maxHeight: '85%',
  },
  keyboardAvoiding: {
    flexShrink: 1,
  },
  handleArea: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Brand.border,
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.bg,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Brand.textSecondary,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: '#fff',
  },
  date: {
    fontSize: 20,
    fontWeight: '700',
    color: Brand.textPrimary,
    marginBottom: 8,
  },
  meta: {
    fontSize: 14,
    fontWeight: '600',
    color: Brand.accentDark,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: Brand.textSecondary,
    marginBottom: 24,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  compactDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  compactText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: Brand.textPrimary,
  },
  joinButton: {
    minHeight: 48,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: Brand.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonPressed: {
    backgroundColor: Brand.accentDark,
  },
  joinButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
