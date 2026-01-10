import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../../../shared/styles/colors";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 72) / 2; // Adjusted for two cards per row

// --- Data for Latex Quality Home Screen ---
const latexMetrics = [
  {
    label: "Current Temp",
    value: "28.5°C",
    icon: "thermometer",
    color: colors.success,
  },
  {
    label: "pH Level",
    value: "6.8",
    icon: "ph",
    color: colors.primary,
  },
  {
    label: "Turbidity",
    value: "15 NTU",
    icon: "water-opacity",
    color: colors.secondary,
  },
  {
    label: "Quality Score",
    value: "92%",
    icon: "star-outline",
    color: colors.success,
  },
];

const quickActions = [
  {
    title: "Start Test",
    icon: "flask-outline",
    color: colors.primary,
    screen: "LatexTest",
  },
  {
    title: "View History",
    icon: "history",
    color: colors.success,
    screen: "LatexHistory",
  },
  {
    title: "Sensor Status",
    icon: "gauge",
    color: colors.secondary,
    screen: "SensorStatus",
  },
  {
    title: "Reports",
    icon: "file-document-outline",
    color: colors.primary,
    screen: "LatexReports",
  },
];

const recentTests = [
  {
    id: "TEST-2026-001",
    result: "Pass",
    quality: "High",
    statusColor: "#10B981",
  },
  {
    id: "TEST-2026-002",
    result: "Warning",
    quality: "Medium",
    statusColor: "#F59E0B",
  },
  {
    id: "TEST-2026-003",
    result: "Fail",
    quality: "Low",
    statusColor: "#EF4444",
  },
];

const alerts = [
  {
    message: "Temperature approaching upper limit",
    urgency: "Medium",
    color: "#F59E0B",
  },
  {
    message: "pH sensor calibration due",
    urgency: "Low",
    color: "#3498DB",
  },
];

export default function LatexQualityHomeScreen() {
  const navigation = useNavigation<any>();
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <Animated.View entering={FadeInDown.duration(400)}>
        <LinearGradient
          colors={[colors.primary, "#1B5E20"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <View style={styles.headerTitleWrap}>
            <MaterialCommunityIcons name="test-tube" size={28} color="rgba(255,255,255,0.9)" />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.headerTitle}>Latex Quality Dashboard</Text>
              <Text style={styles.headerSubtitle}>Real-time monitoring & testing</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* KEY METRICS GRID */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(500)}
        style={styles.section}
      >
        <Text style={styles.sectionTitle}>Key Metrics</Text>
        <View style={styles.metricsGrid}>
          {latexMetrics.map((metric, index) => (
            <LinearGradient
              key={index}
              colors={['#FFFFFF', '#FFFFFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.metricCard}
            >
              <View style={[styles.metricIconBox, { backgroundColor: `${metric.color}20` }]}>
                <MaterialCommunityIcons
                  name={metric.icon as any}
                  size={28}
                  color={metric.color}
                />
              </View>
              <Text style={[styles.metricValue, { color: metric.color }]}>{metric.value}</Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
            </LinearGradient>
          ))}
        </View>
      </Animated.View>

      {/* HORIZONTAL RULE */}
      <View style={styles.horizontalRule} />

      {/* QUICK ACTIONS */}
      <Animated.View
        entering={FadeInDown.delay(300).duration(500)}
        style={styles.section}
      >
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.screen)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={action.icon as any}
                size={30}
                color={action.color}
              />
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* HORIZONTAL RULE */}
      <View style={styles.horizontalRule} />

      {/* RECENT TESTS */}
      <Animated.View
        entering={FadeInDown.delay(500).duration(500)}
        style={styles.section}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Tests</Text>
          <TouchableOpacity onPress={() => navigation.navigate("LatexHistory")}>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.cardListContainer}>
          {recentTests.map((test, i) => (
            <View
              key={i}
              style={[
                styles.listRow,
                i === recentTests.length - 1 && { borderBottomWidth: 0 },
                { borderLeftColor: test.statusColor, borderLeftWidth: 4 },
              ]}
            >
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <MaterialIcons
                  name="done"
                  size={20}
                  color={test.statusColor}
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.listRowPrimary}>Test ID: {test.id}</Text>
                  <Text style={styles.listRowSecondary}>Quality: {test.quality}</Text>
                </View>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${test.statusColor}15` },
                ]}
              >
                <Text style={[styles.statusText, { color: test.statusColor }]}>
                  {test.result}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* ALERTS */}
      <Animated.View
        entering={FadeInDown.delay(700).duration(500)}
        style={styles.section}
      >
        <Text style={[styles.sectionTitle, { color: "#EF4444" }]}>Active Alerts</Text>
        <View style={styles.cardListContainer}>
          {alerts.map((alert, i) => (
            <View
              key={i}
              style={[
                styles.listRow,
                i === alerts.length - 1 && { borderBottomWidth: 0 },
                { borderLeftColor: alert.color, borderLeftWidth: 4 },
              ]}
            >
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={20}
                  color={alert.color}
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.listRowPrimary}>{alert.message}</Text>
                </View>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${alert.color}15` },
                ]}
              >
                <Text style={[styles.statusText, { color: alert.color }]}>
                  {alert.urgency}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Animated.View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    justifyContent: "center",
  },
  headerTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
    marginTop: 1,
    fontWeight: "500",
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  horizontalRule: {
    borderBottomColor: "#E5E7EB",
    borderBottomWidth: 1,
    marginHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 15,
  },
  metricCard: {
    width: CARD_WIDTH,
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  metricIconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: "800",
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
    opacity: 0.9,
    marginTop: 4,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 15,
  },
  actionCard: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 18,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 12,
    textAlign: "center",
  },
  cardListContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 15,
  },
  listRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  listRowPrimary: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  listRowSecondary: {
    fontSize: 13,
    fontWeight: "400",
    color: "#6B7280",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
});