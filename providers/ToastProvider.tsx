import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react-native';
import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const COLORS = {
  success: '#22C55E',
  error: '#EF4444',
  info: '#3B82F6',
  warning: '#F59E0B',
};

let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{
    id: number;
    type: ToastType;
    title: string;
    message?: string;
  } | null>(null);

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-80)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -80, duration: 200, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }, [opacity, translateY]);

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      const id = ++toastId;
      setToast({ id, type, title, message });

      opacity.setValue(0);
      translateY.setValue(-80);

      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();

      timerRef.current = setTimeout(hide, 3000);
    },
    [hide, opacity, translateY]
  );

  const Icon = toast ? ICONS[toast.type] : null;
  const accentColor = toast ? COLORS[toast.type] : null;

  return (
    <ToastContext.Provider value={{ showToast }}>
      <View style={{ flex: 1, position: 'relative' }}>
        {children}
        {toast && Icon && accentColor && (
          <Animated.View
            style={[styles.toast, { opacity, transform: [{ translateY }] }]}
          >
            <Pressable onPress={hide} style={styles.pressable}>
              <View style={[styles.accent, { backgroundColor: accentColor }]} />
              <Icon size={20} color={accentColor} />
              <View style={styles.textContainer}>
                <Text style={styles.title}>{toast.title}</Text>
                {toast.message && <Text style={styles.message}>{toast.message}</Text>}
              </View>
              <X size={16} color="#9CA3AF" />
            </Pressable>
          </Animated.View>
        )}
      </View>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    overflow: 'hidden',
  },
  pressable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  message: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
});
