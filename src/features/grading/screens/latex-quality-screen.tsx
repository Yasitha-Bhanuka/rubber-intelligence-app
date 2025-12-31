import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../../../shared/styles/colors";
import { ReportService } from "../../../core/services/ReportService";
import { AnyComponent } from "react-native-reanimated/lib/typescript/createAnimatedComponent/commonTypes";

const LatexQualityStatus = () => {
  const navigation = useNavigation<any>();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sensorData, setSensorData] = useState({
    temperature: 0,
    turbidity: 0,
    pH: 0,
  });

  // Simulate sensor data (in real app, this would come from actual sensors)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());

      // Simulate sensor readings with realistic values
      setSensorData({
        temperature: Math.random() * (35 - 25) + 25, // 25-35°C
        turbidity: Math.random() * (50 - 5) + 5, // 5-50 NTU
        pH: Math.random() * (7.5 - 6.0) + 6.0, // 6.0-7.5 pH
      });
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // Quality assessment logic
  const getQualityAssessment = () => {
    const { temperature, pH, turbidity } = sensorData;

    const isTempGood = temperature >= 27 && temperature <= 32;
    const isPHGood = pH >= 6.5 && pH <= 7.2;
    const isTurbidityGood = turbidity <= 30;

    const isGoodQuality = isTempGood && isPHGood && isTurbidityGood;

    let reasons = [];
    if (!isTempGood) {
      reasons.push(
        `Temperature (${temperature.toFixed(
          1
        )}°C) is outside optimal range (27-32°C)`
      );
    }
    if (!isPHGood) {
      reasons.push(
        `pH level (${pH.toFixed(1)}) is outside optimal range (6.5-7.2)`
      );
    }
    if (!isTurbidityGood) {
      reasons.push(
        `Turbidity (${turbidity.toFixed(
          1
        )} NTU) is above acceptable limit (≤30 NTU)`
      );
    }

    return {
      isGoodQuality,
      reasons:
        reasons.length > 0 ? reasons : ["All parameters within optimal ranges"],
      details: {
        temperature: { value: temperature, isGood: isTempGood },
        pH: { value: pH, isGood: isPHGood },
        turbidity: { value: turbidity, isGood: isTurbidityGood },
      },
    };
  };

  const assessment = getQualityAssessment();

  const handleGenerateReport = async () => {
    try {
      const html = ReportService.generateLatexHTML({ assessment, sensorData });
      const filename = `Latex_${new Date().getTime()}.pdf`;
      const pdfUri = await ReportService.generatePDF(html, filename);

      if (pdfUri) {
        navigation.navigate("TestReports", {
          pdfUri,
          source: "Latex",
          result: {
            predictedClass: assessment.isGoodQuality ? "Good Quality" : "Poor Quality",
            confidence: 1.0,
            severity: assessment.isGoodQuality ? "Low" : "High",
            suggestions: assessment.reasons.join("\n")
          },
          params: {
            testDate: formatDate(currentTime),
            testTime: formatTime(currentTime as any)
          }
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to generate report.");
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const formatDate = (date: any) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const StatusCard = ({
    title,
    value,
    unit,
    icon,
    isGood,
    optimalRange,
  }: any) => (
    <View style={[styles.statusCard, !isGood && styles.statusCardWarning]}>
      <View style={styles.statusHeader}>
        <MaterialCommunityIcons
          name={icon}
          size={24}
          color={isGood ? colors.success : colors.error}
        />
        <Text style={styles.statusTitle}>{title}</Text>
        <View
          style={[
            styles.statusIndicator,
            isGood ? styles.statusGood : styles.statusBad,
          ]}
        >
          <Text style={styles.statusIndicatorText}>
            {isGood ? "✓ Good" : "✗ Poor"}
          </Text>
        </View>
      </View>
      <View style={styles.statusValueContainer}>
        <Text style={styles.statusValue}>{value}</Text>
        <Text style={styles.statusUnit}>{unit}</Text>
      </View>
      <Text style={styles.optimalRange}>Optimal Range: {optimalRange}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View>
        <LinearGradient
          colors={[colors.primary, "#1B5E20"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <MaterialCommunityIcons name="test-tube" size={24} color="white" />
            <Text style={styles.headerTitle}>Latex Quality Status</Text>
          </View>
          <View style={styles.headerPlaceholder} />
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.userInfo}>
            <MaterialCommunityIcons
              name="account-circle"
              size={40}
              color={colors.primary}
            />
            <View style={styles.userDetails}>
              <Text style={styles.userLabel}>Consumer Name</Text>
              <Text style={styles.userName}>Rubber Latex Collector</Text>
            </View>
          </View>
          <View style={styles.dateTimeContainer}>
            <View style={styles.dateTimeItem}>
              <MaterialCommunityIcons
                name="calendar"
                size={16}
                color="#6B7280"
              />
              <Text style={styles.dateTimeText}>{formatDate(currentTime)}</Text>
            </View>
            <View style={styles.dateTimeItem}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={16}
                color="#6B7280"
              />
              <Text style={styles.dateTimeText}>
                {formatTime(currentTime as any)}
              </Text>
            </View>
          </View>
        </View>

        {/* Quality Overview */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <Text style={styles.overviewTitle}>Quality Overview</Text>
            <View
              style={[
                styles.qualityBadge,
                assessment.isGoodQuality
                  ? styles.qualityGood
                  : styles.qualityPoor,
              ]}
            >
              <Text style={styles.qualityBadgeText}>
                {assessment.isGoodQuality ? "GOOD QUALITY" : "POOR QUALITY"}
              </Text>
            </View>
          </View>
          <View style={styles.overviewStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Parameters</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {
                  Object.values(assessment.details).filter((d) => d.isGood)
                    .length
                }
              </Text>
              <Text style={styles.statLabel}>Optimal</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {
                  Object.values(assessment.details).filter((d) => !d.isGood)
                    .length
                }
              </Text>
              <Text style={styles.statLabel}>Needs Attention</Text>
            </View>
          </View>
        </View>

        {/* Sensor Readings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Real-time Sensor Readings</Text>

          <StatusCard
            title="Latex Temperature"
            value={sensorData.temperature.toFixed(1)}
            unit="°C"
            icon="thermometer"
            isGood={assessment.details.temperature.isGood}
            optimalRange="27-32°C"
          />

          <StatusCard
            title="Latex Quality Level"
            value={sensorData.turbidity.toFixed(1)}
            unit="NTU"
            icon="water-opacity"
            isGood={assessment.details.turbidity.isGood}
            optimalRange="≤30 NTU"
          />

          <StatusCard
            title="Latex pH Level"
            value={sensorData.pH.toFixed(1)}
            unit="pH"
            icon="ph"
            isGood={assessment.details.pH.isGood}
            optimalRange="6.5-7.2 pH"
          />
        </View>

        {/* Quality Conclusion */}
        <View style={styles.conclusionCard}>
          <View style={styles.conclusionHeader}>
            <MaterialCommunityIcons
              name="clipboard-check"
              size={24}
              color="#1F2937"
            />
            <Text style={styles.conclusionTitle}>Quality Assessment</Text>
          </View>

          <View style={styles.predictionContainer}>
            <Text
              style={[
                styles.predictionText,
                assessment.isGoodQuality
                  ? styles.predictionGood
                  : styles.predictionPoor,
              ]}
            >
              {assessment.isGoodQuality
                ? "✓ Latex is in GOOD Quality"
                : "✗ Latex quality NEEDS ATTENTION"}
            </Text>
          </View>

          <View style={styles.reasonsContainer}>
            <Text style={styles.reasonsTitle}>Assessment Details:</Text>
            {assessment.reasons.map((reason, index) => (
              <View key={index} style={styles.reasonItem}>
                <MaterialCommunityIcons
                  name={
                    assessment.isGoodQuality ? "check-circle" : "alert-circle"
                  }
                  size={16}
                  color={assessment.isGoodQuality ? colors.success : colors.error}
                />
                <Text style={styles.reasonText}>{reason}</Text>
              </View>
            ))}
          </View>

          <View style={styles.qualityStandards}>
            <Text style={styles.standardsTitle}>
              Quality Standards Reference:
            </Text>
            <Text style={styles.standardItem}>
              • Temperature: 27-32°C (Optimal for fresh latex)
            </Text>
            <Text style={styles.standardItem}>
              • pH Level: 6.5-7.2 (Prevents premature coagulation)
            </Text>
            <Text style={styles.standardItem}>
              • Turbidity: ≤30 NTU (Indicates purity level)
            </Text>
          </View>
        </View>

        {/* Report Generation */}
        <TouchableOpacity
          style={styles.reportBtnContainer}
          onPress={handleGenerateReport}
        >
          <LinearGradient
            colors={[colors.primary, "#1B5E20"]}
            style={styles.reportBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <MaterialCommunityIcons
              name="file-document-outline"
              size={24}
              color="white"
            />
            <Text style={styles.reportButtonText}>Generate Quality Report</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Last Updated */}
        <View style={styles.lastUpdated}>
          <MaterialCommunityIcons name="update" size={16} color="#6B7280" />
          <Text style={styles.lastUpdatedText}>
            Last updated: {formatTime(currentTime as any)}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  userCard: {
    backgroundColor: "white",
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  userDetails: {
    marginLeft: 12,
  },
  userLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  dateTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateTimeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateTimeText: {
    fontSize: 14,
    color: "#6B7280",
  },
  overviewCard: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  overviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  qualityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  qualityGood: {
    backgroundColor: "#D1FAE5",
  },
  qualityPoor: {
    backgroundColor: "#FEE2E2",
  },
  qualityBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1F2937",
  },
  overviewStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  statusCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  statusCardWarning: {
    borderLeftColor: colors.error,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 8,
    flex: 1,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusGood: {
    backgroundColor: "#D1FAE5",
  },
  statusBad: {
    backgroundColor: "#FEE2E2",
  },
  statusIndicatorText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1F2937",
  },
  statusValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  statusValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
  },
  statusUnit: {
    fontSize: 16,
    color: "#6B7280",
    marginLeft: 4,
  },
  optimalRange: {
    fontSize: 12,
    color: "#6B7280",
  },
  conclusionCard: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  conclusionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  conclusionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginLeft: 8,
  },
  predictionContainer: {
    backgroundColor: "#F3F4F6",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  predictionText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  predictionGood: {
    color: colors.success,
  },
  predictionPoor: {
    color: colors.error,
  },
  reasonsContainer: {
    marginBottom: 16,
  },
  reasonsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  reasonItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  reasonText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  qualityStandards: {
    backgroundColor: "#F0F9FF",
    padding: 16,
    borderRadius: 12,
  },
  standardsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  standardItem: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  reportBtnContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  reportButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  lastUpdated: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    gap: 6,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: "#6B7280",
  },
});

export default LatexQualityStatus;
