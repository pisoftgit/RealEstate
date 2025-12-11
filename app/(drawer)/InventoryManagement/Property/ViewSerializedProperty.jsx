import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { API_BASE_URL } from "../../../../services/api";

const COLORS = {
  primary: "#004d40",
  primaryLight: "#218373ff",
  secondary: "#198170ff",
  success: "#22c55e",
  background: "#fff",
  card: "#f4fcf4",
  input: "#f0f8f0",
  border: "#c8e6c9",
  text: "#202020ff",
  placeholder: "#13773dff",
  error: "#d32f2f",
  warning: "#FF9800",
};

const PropertyStatus = ({ status }) => {
  let statusStyle = styles.statusBadge;
  let statusColor = COLORS.placeholder;

  switch (status?.toLowerCase()) {
    case "available":
      statusColor = COLORS.success;
      break;
    case "sold":
      statusColor = COLORS.error;
      break;
    case "booked":
      statusColor = COLORS.warning;
      break;
    default:
      statusColor = COLORS.placeholder;
  }

  return (
    <View style={[statusStyle, { backgroundColor: statusColor + "20" }]}>
      <Text style={[styles.statusText, { color: statusColor }]}>
        {status || "Unknown"}
      </Text>
    </View>
  );
};

const ViewSerializedProperty = () => {
  const { projectId } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [propertyData, setPropertyData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedTowerId, setSelectedTowerId] = useState(null);

  useEffect(() => {
    fetchSerializedProperty();
  }, [projectId]);

  const fetchSerializedProperty = async () => {
    if (!projectId) {
      setError("No project ID provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const secretKey = await SecureStore.getItemAsync("auth_token");

      const response = await axios.get(
        `${API_BASE_URL}/real-estate-properties/getSerializedPropertyByProjectId/${projectId}`,
        {
          headers: { secret_key: secretKey },
        }
      );

      setPropertyData(response.data);

      // Auto-select first tower if exists
      if (response.data?.towers?.length > 0) {
        setSelectedTowerId(response.data.towers[0].id);
      }
    } catch (err) {
      console.error("Fetch Serialized Property Error:", err);
      setError("Failed to load serialized property data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (type, id) => {
    Alert.alert(
      "Delete Confirmation",
      `Are you sure you want to delete this ${type}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert("Info", `Delete action for ${type} #${id} not implemented`);
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading serialized property...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={50} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchSerializedProperty}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const towers = propertyData?.towers || [];
  const plots = propertyData?.plots || [];
  const houseVillas = propertyData?.houseVillas || [];
  const commercialUnits = propertyData?.commercialUnits || [];

  const selectedTower = towers.find((t) => t.id === selectedTowerId);
  const towerFlats = selectedTower?.flats || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Serialized Property Details</Text>
        </View>

        {/* Towers Section */}
        {towers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Towers/Blocks</Text>

            {/* Tower Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
              {towers.map((tower) => (
                <TouchableOpacity
                  key={tower.id}
                  onPress={() => setSelectedTowerId(tower.id)}
                  style={[
                    styles.tab,
                    selectedTowerId === tower.id && styles.activeTab,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      selectedTowerId === tower.id && styles.activeTabText,
                    ]}
                  >
                    {tower.blockHouseName} ({tower.flats?.length || 0})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Tower Units Table */}
            {towerFlats.length > 0 ? (
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { flex: 0.5 }]}>S/N</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1 }]}>Unit No.</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1 }]}>Area</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1 }]}>Config</Text>
                  <Text style={[styles.tableHeaderText, { flex: 0.8 }]}>Floor</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1 }]}>Status</Text>
                </View>

                <ScrollView style={styles.tableBody}>
                  {towerFlats.map((flat, index) => (
                    <View key={flat.id} style={styles.tableRow}>
                      <Text style={[styles.tableCell, { flex: 0.5 }]}>{index + 1}</Text>
                      <Text style={[styles.tableCell, { flex: 1, fontFamily: "PlusSB" }]}>
                        {flat.flatNumber}
                      </Text>
                      <Text style={[styles.tableCell, { flex: 1 }]}>
                        {flat.area?.toFixed(2)} {flat.areaUnit || "sq.ft"}
                      </Text>
                      <Text style={[styles.tableCell, { flex: 1 }]}>
                        {flat.structure || "-"}
                      </Text>
                      <Text style={[styles.tableCell, { flex: 0.8 }]}>
                        {flat.floorNumber}
                      </Text>
                      <View style={{ flex: 1 }}>
                        <PropertyStatus status={flat.availabilityStatus} />
                      </View>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.tableFooter}>
                  <Text style={styles.tableFooterText}>
                    Total Units: <Text style={styles.tableFooterBold}>{towerFlats.length}</Text>
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={styles.emptyText}>No units found in this tower.</Text>
            )}
          </View>
        )}

        {/* Plots Section */}
        {plots.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Plots</Text>
            <View style={styles.cardGrid}>
              {plots.map((plot) => (
                <View key={plot.id} style={styles.card}>
                  <Text style={styles.cardTitle}>Plot #{plot.plotNumber || "N/A"}</Text>
                  <Text style={styles.cardText}>
                    Area: {plot.area?.toFixed(2)} {plot.areaUnit || "-"}
                  </Text>
                  <PropertyStatus status={plot.availabilityStatus} />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* House/Villas Section */}
        {houseVillas.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>House/Villas</Text>
            <View style={styles.cardGrid}>
              {houseVillas.map((house) => (
                <View key={house.id} style={styles.card}>
                  <Text style={styles.cardTitle}>
                    House #{house.blockHouseNumber || "N/A"}
                  </Text>
                  <Text style={styles.cardText}>
                    Area: {house.area?.toFixed(2)} {house.areaUnit || "-"}
                  </Text>
                  <Text style={styles.cardText}>Type: {house.structure || "-"}</Text>
                  <PropertyStatus status={house.availabilityStatus} />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Commercial Units Section */}
        {commercialUnits.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Commercial Units</Text>
            <View style={styles.cardGrid}>
              {commercialUnits.map((unit) => (
                <View key={unit.id} style={styles.card}>
                  <Text style={styles.cardTitle}>Unit #{unit.nameOrNumber || "N/A"}</Text>
                  <Text style={styles.cardText}>
                    Area: {unit.area?.toFixed(2)} {unit.areaUnit || "-"}
                  </Text>
                  <Text style={styles.cardText}>Type: {unit.typeName || "-"}</Text>
                  <PropertyStatus status={unit.availabilityStatus} />
                </View>
              ))}
            </View>
          </View>
        )}

        {towers.length === 0 &&
          plots.length === 0 &&
          houseVillas.length === 0 &&
          commercialUnits.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={60} color={COLORS.placeholder} />
              <Text style={styles.emptyText}>No serialized properties found</Text>
            </View>
          )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "PlusSB",
    color: COLORS.primary,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontFamily: "PlusM",
    color: COLORS.placeholder,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontFamily: "PlusM",
    color: COLORS.error,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.background,
    fontFamily: "PlusSB",
  },
  section: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "PlusSB",
    color: COLORS.primary,
    marginBottom: 15,
  },
  tabsContainer: {
    marginBottom: 15,
  },
  tab: {
    backgroundColor: COLORS.input,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontFamily: "PlusM",
    color: COLORS.text,
  },
  activeTabText: {
    fontFamily: "PlusSB",
    color: COLORS.background,
  },
  table: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    padding: 10,
  },
  tableHeaderText: {
    fontFamily: "PlusSB",
    color: COLORS.background,
    fontSize: 12,
  },
  tableBody: {
    maxHeight: 400,
  },
  tableRow: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: "center",
  },
  tableCell: {
    fontFamily: "PlusM",
    color: COLORS.text,
    fontSize: 12,
  },
  tableFooter: {
    backgroundColor: COLORS.input,
    padding: 10,
  },
  tableFooterText: {
    fontFamily: "PlusM",
    color: COLORS.text,
    textAlign: "right",
  },
  tableFooterBold: {
    fontFamily: "PlusSB",
    color: COLORS.primary,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 15,
    width: "48%",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "PlusSB",
    color: COLORS.primary,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 13,
    fontFamily: "PlusM",
    color: COLORS.text,
    marginBottom: 5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 11,
    fontFamily: "PlusSB",
    textTransform: "uppercase",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 15,
    fontFamily: "PlusM",
    color: COLORS.placeholder,
    textAlign: "center",
  },
});

export default ViewSerializedProperty;
