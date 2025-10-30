import React, { useState } from "react";
import { 
  View, 
  SafeAreaView,
  Text, 
  StyleSheet, 
  Alert, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
  Platform,
  RefreshControl,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker, { DateTimePickerEvent, DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { createReservation, getSpotDetail } from "../../src/api/api";

const { width } = Dimensions.get('window');

const SpotDetailScreen = ({ route, navigation }: any) => {
  const { spot } = route.params;
  // keep spot in state so we can refresh it from server
  const [spotData, setSpotData] = useState<any>(spot);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // New state for start/end pickers
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date(new Date().getTime() + 60 * 60 * 1000));

  // For iOS we can use single datetime picker; on Android split into date + time
  const [showStartPicker, setShowStartPicker] = useState(false); // date or datetime depending on platform
  const [showStartTimePicker, setShowStartTimePicker] = useState(false); // android only time picker
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const pricePerHour = Number(spotData.price_per_hour) || 0;
  const availableCount = typeof spotData.available_count === 'number' ? Number(spotData.available_count) : (spotData.is_available ? 1 : 0);
  const capacity = typeof spotData.capacity === 'number' ? Number(spotData.capacity) : undefined;

  // extra bottom inset for Android to avoid soft navigation overlap
  const bottomInset = Platform.OS === 'android' ? 18 : 0;

  const durationHours = Math.max(0, (endDate.getTime() - startDate.getTime()) / (60 * 60 * 1000));
  const totalPrice = (durationHours * pricePerHour);

  const isDismissed = (event: DateTimePickerEvent) => {
    // android returns { type: 'dismissed' } on cancel; iOS behavior differs
    return (event as any)?.type === 'dismissed';
  };

  const onChangeStart = (event: DateTimePickerEvent, selected?: Date | undefined) => {
    if (isDismissed(event)) {
      // hide all start pickers for android
      if (Platform.OS === 'android') {
        setShowStartPicker(false);
        setShowStartTimePicker(false);
      } else {
        setShowStartPicker(false);
      }
      return;
    }

    if (Platform.OS === 'android') {
      // If currently showing date picker for start, next show time picker
      if (showStartPicker && !showStartTimePicker) {
        // selected contains the chosen date part
        if (selected) {
          const pickedDate = selected;
          const newStart = new Date(startDate);
          newStart.setFullYear(pickedDate.getFullYear(), pickedDate.getMonth(), pickedDate.getDate());
          // keep old time for now, then show time picker
          setStartDate(newStart);
          setShowStartPicker(false);
          setShowStartTimePicker(true);
        } else {
          setShowStartPicker(false);
        }
        return;
      }

      // time picker result
      if (showStartTimePicker) {
        if (selected) {
          const pickedTime = selected;
          const newStart = new Date(startDate);
          newStart.setHours(pickedTime.getHours(), pickedTime.getMinutes(), 0, 0);
          setStartDate(newStart);
          // if end is before or equal, bump end by 1 hour
          if (newStart >= endDate) {
            const bumpedEnd = new Date(newStart.getTime() + 60 * 60 * 1000);
            setEndDate(bumpedEnd);
          }
        }
        setShowStartTimePicker(false);
        return;
      }
    } else {
      // iOS: single datetime picker
      if (selected) {
        const newStart = selected;
        setStartDate(newStart);
        if (newStart >= endDate) {
          const bumpedEnd = new Date(newStart.getTime() + 60 * 60 * 1000);
          setEndDate(bumpedEnd);
        }
      }
      // keep picker visible for iOS until user closes (handled by UI)
    }
  };

  const onChangeEnd = (event: DateTimePickerEvent, selected?: Date | undefined) => {
    if (isDismissed(event)) {
      if (Platform.OS === 'android') {
        setShowEndPicker(false);
        setShowEndTimePicker(false);
      } else {
        setShowEndPicker(false);
      }
      return;
    }

    if (Platform.OS === 'android') {
      if (showEndPicker && !showEndTimePicker) {
        // date part selected for end
        if (selected) {
          const pickedDate = selected;
          const newEnd = new Date(endDate);
          newEnd.setFullYear(pickedDate.getFullYear(), pickedDate.getMonth(), pickedDate.getDate());
          setEndDate(newEnd);
          setShowEndPicker(false);
          setShowEndTimePicker(true);
        } else {
          setShowEndPicker(false);
        }
        return;
      }

      // time picker result for end
      if (showEndTimePicker) {
        if (selected) {
          const pickedTime = selected;
          const newEnd = new Date(endDate);
          newEnd.setHours(pickedTime.getHours(), pickedTime.getMinutes(), 0, 0);
          setEndDate(newEnd);
        }
        setShowEndTimePicker(false);
        return;
      }
    } else {
      // iOS single datetime
      if (selected) {
        setEndDate(selected);
      }
    }
  };

  const handleReserve = async () => {
    if (endDate <= startDate) {
      Alert.alert("Invalid time", "End time must be after start time.");
      return;
    }
    if (durationHours <= 0) {
      Alert.alert("Invalid duration", "Please select a valid duration.");
      return;
    }

    setLoading(true);
    try {
      await createReservation({
        spot_id: spotData.id,
        // send local ISO with timezone offset so backend receives the correct local time
        start_at: formatLocalISOWithOffset(startDate),
        end_at: formatLocalISOWithOffset(endDate),
        // optionally send calculated amount to backend if API supports it:
        // amount: totalPrice
      });
      Alert.alert(
        "Success!",
        `Reserved for ${durationHours.toFixed(2)} hour(s). Total: Rs. ${totalPrice.toFixed(2)}`,
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err) {
      Alert.alert("Error", "Could not create reservation. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const formatDateTime = (d: Date) => {
    return d.toLocaleString();
  };

  // pull-to-refresh handler: re-fetch latest spot details from server
  const onRefresh = async () => {
    if (!spotData?.id) return;
    setRefreshing(true);
    try {
      const res = await getSpotDetail(Number(spotData.id));
      // axios returns data in res.data
      if (res && (res as any).data) setSpotData((res as any).data);
    } catch (err) {
      console.warn('Failed to refresh spot details', err);
      Alert.alert('Refresh failed', 'Could not fetch latest spot details.');
    } finally {
      setRefreshing(false);
    }
  };

  // format a Date as local ISO 8601 including timezone offset (e.g. 2025-10-28T14:30:00+05:30)
  const formatLocalISOWithOffset = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    const tzOffsetMin = -d.getTimezoneOffset(); // minutes ahead of UTC
    const sign = tzOffsetMin >= 0 ? '+' : '-';
    const absOffset = Math.abs(tzOffsetMin);
    const tzHH = pad(Math.floor(absOffset / 60));
    const tzMM = pad(absOffset % 60);
    return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}${sign}${tzHH}:${tzMM}`;
  };
  
  // helper to use Android native picker (avoids dialog dismiss crash)
  const openAndroidPicker = async (
    which: 'start' | 'end',
    mode: 'date' | 'time',
  ) => {
    try {
      DateTimePickerAndroid.open({
        value: which === 'start' ? startDate : endDate,
        onChange: (event, selected) => {
          // handle dismiss
          if ((event as any)?.type === 'dismissed') {
            return;
          }
          if (!selected) return;

          if (mode === 'date') {
            const pickedDate = selected;
            const base = new Date(which === 'start' ? startDate : endDate);
            base.setFullYear(pickedDate.getFullYear(), pickedDate.getMonth(), pickedDate.getDate());
            if (which === 'start') {
              setStartDate(base);
              // after picking date, open time picker
              openAndroidPicker('start', 'time');
            } else {
              setEndDate(base);
              openAndroidPicker('end', 'time');
            }
          } else {
            // time
            const pickedTime = selected;
            const base = new Date(which === 'start' ? startDate : endDate);
            base.setHours(pickedTime.getHours(), pickedTime.getMinutes(), 0, 0);
            if (which === 'start') {
              setStartDate(base);
              if (base >= endDate) {
                setEndDate(new Date(base.getTime() + 60 * 60 * 1000));
              }
            } else {
              setEndDate(base);
            }
          }
        },
        mode,
        is24Hour: false,
        minimumDate: mode === 'date' ? new Date() : undefined,
      });
    } catch (e) {
      // fallback: nothing, avoid crashing the UI
      console.warn('Android picker error', e);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#10b981', '#059669']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Spot Details</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Spot Image Placeholder */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/parking.jpg')}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        {/* Main Content Card */}
        <View style={styles.card}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{spotData?.title}</Text>
            <View style={styles.availableBadge}>
              <MaterialCommunityIcons name={availableCount > 0 ? "check-circle" : "close-circle"} size={16} color={availableCount > 0 ? "#10b981" : "#dc2626"} />
              <Text style={styles.availableText}>{availableCount > 0 ? `Available (${availableCount}${capacity ? ` / ${capacity}` : ''})` : 'Full'}</Text>
            </View>
          </View>

          {/* Description */}
          {spotData?.description && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="information" size={20} color="#10b981" />
                <Text style={styles.sectionTitle}>Description</Text>
              </View>
              <Text style={styles.description}>{spotData?.description}</Text>
            </View>
          )}

          {/* Time Selection */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="clock-outline" size={20} color="#10b981" />
              <Text style={styles.sectionTitle}>Select Time</Text>
            </View>

            <TouchableOpacity
              style={styles.timePickerButton}
              onPress={() => {
                if (Platform.OS === 'android') {
                  // use native Android flow (date -> time) to avoid internal dismiss crash
                  openAndroidPicker('start', 'date');
                } else {
                  setShowStartPicker(true); // iOS datetime
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.timePickerLabel}>Start</Text>
              <Text style={styles.timePickerValue}>{formatDateTime(startDate)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.timePickerButton, { marginTop: 12 }]}
              onPress={() => {
                if (Platform.OS === 'android') {
                  openAndroidPicker('end', 'date');
                } else {
                  setShowEndPicker(true);
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.timePickerLabel}>End</Text>
              <Text style={styles.timePickerValue}>{formatDateTime(endDate)}</Text>
            </TouchableOpacity>

            {/* Pickers (iOS only rendered inline) */}
            {Platform.OS === 'ios' && showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="datetime"
                display="default"
                onChange={onChangeStart}
                minimumDate={new Date()}
              />
            )}
            {Platform.OS === 'ios' && showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="datetime"
                display="default"
                onChange={onChangeEnd}
                minimumDate={new Date(startDate.getTime() + 5 * 60 * 1000)}
              />
            )}
          </View>

          {/* Price Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="cash" size={20} color="#10b981" />
              <Text style={styles.sectionTitle}>Pricing</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Rate</Text>
              <View style={styles.priceBox}>
                <Text style={styles.currency}>Rs.</Text>
                <Text style={styles.price}>{spotData?.price_per_hour}</Text>
                <Text style={styles.priceUnit}>/hour</Text>
              </View>

              <View style={{ marginTop: 12 }}>
                <Text style={[styles.priceLabel, { marginBottom: 6 }]}>Selected Duration</Text>
                <Text style={styles.infoText}>{durationHours.toFixed(2)} hour(s)</Text>
                <Text style={[styles.priceLabel, { marginTop: 8 }]}>Total</Text>
                <Text style={[styles.price, { fontSize: 22 }]}>Rs. {totalPrice.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Features (Optional) */}
          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <MaterialCommunityIcons name="shield-check" size={20} color="#10b981" />
              <Text style={styles.featureText}>Secure</Text>
            </View>
            <View style={styles.feature}>
              <MaterialCommunityIcons name="cctv" size={20} color="#10b981" />
              <Text style={styles.featureText}>Monitored</Text>
            </View>
            <View style={styles.feature}>
              <MaterialCommunityIcons name="car-side" size={20} color="#10b981" />
              <Text style={styles.featureText}>Easy Access</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Reserve Button */}
  <SafeAreaView style={[styles.bottomContainer, { paddingBottom: 35 + bottomInset }]}> 
        <View style={styles.bottomContent}>
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total ({durationHours.toFixed(2)} hr)</Text>
            <Text style={styles.totalPrice}>Rs. {totalPrice.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            onPress={handleReserve}
            style={[styles.reserveButton, (loading || endDate <= startDate || availableCount <= 0) && styles.reserveButtonDisabled]}
            disabled={loading || endDate <= startDate || availableCount <= 0}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <MaterialCommunityIcons name="check-circle" size={20} color="#ffffff" />
              <Text style={styles.reserveButtonText}>
                {loading ? "Reserving..." : "Reserve Now"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default SpotDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: width,
    height: 200,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  card: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    padding: 20,
    minHeight: 400,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1f2937',
    flex: 1,
    marginRight: 12,
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  availableText: {
    color: '#047857',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginLeft: 8,
  },
  description: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
  },
  priceContainer: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  priceLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  priceBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    fontSize: 20,
    fontWeight: '600',
    color: '#10b981',
    marginRight: 4,
  },
  price: {
    fontSize: 32,
    fontWeight: '800',
    color: '#10b981',
  },
  priceUnit: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1fae5',
    marginBottom: 20,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 13,
    color: '#6b7280',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  feature: {
    alignItems: 'center',
  },
  featureText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 6,
    fontWeight: '500',
  },
  bottomContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  bottomContent: {
    gap: 12,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1f2937',
  },
  reserveButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  reserveButtonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  reserveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  /* new styles for time picker rows */
  timePickerButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timePickerLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  timePickerValue: {
    fontSize: 13,
    color: '#6b7280',
  },
});