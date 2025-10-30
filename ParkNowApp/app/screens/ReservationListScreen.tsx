import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { getMyReservations, cancelReservation, getSpots } from "../../src/api/api";
import { formatDate } from "../../src/utils/helpers";
import { useAuth } from "../../src/context/AuthContext";

const { width } = Dimensions.get('window');

const ReservationListScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [reservations, setReservations] = useState<any[]>([]);
  const [spotsMap, setSpotsMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingIds, setCancellingIds] = useState<any[]>([]);

  const fetchReservations = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      // fetch reservations and spots in parallel so we can show spot titles
      const [res, spotsRes] = await Promise.all([getMyReservations(), getSpots()]);
      const reservationsData = res.data || [];
      // If we have a logged in non-admin user, only show that user's reservations
      if (user && String(user.role).toLowerCase() !== "admin") {
        const uid = Number(user.id ?? user.user_id ?? user.userId);
        const filtered = Array.isArray(reservationsData)
          ? reservationsData.filter((r: any) => Number(r.user_id) === uid)
          : [];
        setReservations(filtered);
      } else {
        setReservations(reservationsData);
      }
      const spotsData = spotsRes.data || [];

      // build a simple map of spot_id -> title for quick lookup in render
      const map: Record<number, string> = {};
      if (Array.isArray(spotsData)) {
        spotsData.forEach((s: any) => {
          if (s && typeof s.id !== 'undefined') map[Number(s.id)] = s.title || "";
        });
      }
  setSpotsMap(map);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  }, [user]);

  // initial load
  useEffect(() => {
    fetchReservations(false);
  }, [fetchReservations]);

  // refresh when the screen gets focus (useful after navigation updates)
  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', () => {
      fetchReservations(false);
    });
    return unsubscribe;
  }, [navigation, fetchReservations]);

  const handleCancel = (id: any) => {
    Alert.alert(
      "Cancel Reservation",
      "Are you sure you want to cancel this reservation?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              setCancellingIds((prev) => [...prev, id]);
              await cancelReservation(id);
              // update local state: mark as cancelled
              setReservations((prev) =>
                prev.map((r) => (r.id === id ? { ...r, status: "cancelled" } : r))
              );
            } catch (error) {
              console.error("Error cancelling reservation:", error);
            } finally {
              setCancellingIds((prev) => prev.filter((x) => x !== id));
            }
          },
        },
      ]
    );
  };

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return {
          bgColor: '#d1fae5',
          textColor: '#047857',
          icon: 'check-circle',
          iconColor: '#10b981',
        };
      case 'completed':
        return {
          bgColor: '#e0e7ff',
          textColor: '#4338ca',
          icon: 'clock-check',
          iconColor: '#6366f1',
        };
      case 'cancelled':
        return {
          bgColor: '#fee2e2',
          textColor: '#991b1b',
          icon: 'close-circle',
          iconColor: '#ef4444',
        };
      default:
        return {
          bgColor: '#f3f4f6',
          textColor: '#374151',
          icon: 'information',
          iconColor: '#6b7280',
        };
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const statusConfig = getStatusConfig(item.status);
    const isCancelling = cancellingIds.includes(item.id);
    const isAlreadyCancelled = (item.status || '').toLowerCase() === 'cancelled';
    
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => {
          navigation?.navigate?.("ReservationDetail", { id: item.id });
        }}
      >
        <LinearGradient
          colors={['#ffffff', '#f9fafb']}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          {/* Header Row */}
          <View style={styles.cardHeader}>
            <View style={styles.spotInfo}>
              <MaterialCommunityIcons 
                name="parking" 
                size={24} 
                color="#10b981" 
              />
              <Text style={styles.spotNumber}>
                {`${spotsMap[item.spot_id]}` }
              </Text>
            </View>
            <View
              style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}
            >
              <MaterialCommunityIcons 
                name={statusConfig.icon as any} 
                size={14} 
                color={statusConfig.iconColor} 
              />
              <Text style={[styles.statusText, { color: statusConfig.textColor }]}>
                {(item.status || "Unknown").toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Time Information */}
          <View style={styles.timeSection}>
            {/* Start Time */}
            <View style={styles.timeBlock}>
              <View style={styles.timeHeader}>
                <MaterialCommunityIcons 
                  name="calendar-start" 
                  size={18} 
                  color="#10b981" 
                />
                <Text style={styles.timeLabel}>Start Time</Text>
              </View>
              <Text style={styles.timeValue}>{formatDate(item.start_at)}</Text>
            </View>

            {/* Arrow */}
            <View style={styles.arrowContainer}>
              <MaterialCommunityIcons 
                name="arrow-right" 
                size={24} 
                color="#d1d5db" 
              />
            </View>

            {/* End Time */}
            <View style={styles.timeBlock}>
              <View style={styles.timeHeader}>
                <MaterialCommunityIcons 
                  name="calendar-end" 
                  size={18} 
                  color="#10b981" 
                />
                <Text style={styles.timeLabel}>End Time</Text>
              </View>
              <Text style={styles.timeValue}>{formatDate(item.end_at)}</Text>
            </View>
          </View>

          {/* Footer with cancel button */}
          <View style={styles.cardFooter}>
            <View />
            <TouchableOpacity
              style={[
                styles.cancelButton,
                isAlreadyCancelled && styles.cancelButtonDisabled,
              ]}
              activeOpacity={0.8}
              disabled={isCancelling || isAlreadyCancelled}
              onPress={() => handleCancel(item.id)}
            >
              {isCancelling ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.cancelButtonText}>
                  {isAlreadyCancelled ? "Cancelled" : "Cancel Reservation"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header (matches admin screen style) */}
        <LinearGradient
          colors={['#10b981', '#059669']}
          style={[styles.header, { paddingTop: Math.max(16, insets.top + 12) }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.headerContent}>
            <MaterialCommunityIcons name="ticket-confirmation" size={32} color="#ffffff" />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Reservations</Text>
              <Text style={styles.headerSubtitle}>Your parking reservations</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Summary Card */}
          {!loading && reservations.length > 0 && (
            <View style={styles.summaryCard}>
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.summaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <MaterialCommunityIcons 
                  name="ticket-confirmation" 
                  size={32} 
                  color="#ffffff" 
                />
                <View style={styles.summaryContent}>
                  <Text style={styles.summaryLabel}>Total Reservations</Text>
                  <Text style={styles.summaryValue}>{reservations.length}</Text>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* List */}
          <FlatList
            data={reservations}
            keyExtractor={(item) => (item.id ?? Math.random()).toString()}
            renderItem={renderItem}
            refreshing={refreshing}
            onRefresh={() => fetchReservations(true)}
            // ensure the list has enough bottom padding so items are not hidden
            // behind the bottom navigation. Use safe-area inset + extra space.
            contentContainerStyle={[
              reservations.length === 0 ? styles.emptyContainer : styles.listContainer,
              { paddingBottom: insets.bottom + 100 },
            ]}
            // keep scroll indicator visible above nav
            scrollIndicatorInsets={{ bottom: insets.bottom + 100 }}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <MaterialCommunityIcons 
                  name="calendar-blank" 
                  size={80} 
                  color="#d1d5db" 
                />
                <Text style={styles.emptyTitle}>No Reservations Yet</Text>
                <Text style={styles.emptyText}>
                  Your parking reservations will appear here
                </Text>
              </View>
            }
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ReservationListScreen;

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: "#f9fafb" 
  },
  container: { 
    flex: 1, 
    backgroundColor: "#f9fafb" 
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    fontWeight: '500',
  },
  content: { 
    flex: 1, 
    padding: 16 
  },
  summaryCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  summaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 4,
    opacity: 0.9,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardGradient: {
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  spotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  spotNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginBottom: 16,
  },
  timeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  timeBlock: {
    flex: 1,
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  timeLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  timeValue: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  arrowContainer: {
    paddingHorizontal: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  separator: { 
    height: 16 
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyBox: { 
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: { 
    color: '#9ca3af', 
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },

  /* New button styles */
  cancelButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
});