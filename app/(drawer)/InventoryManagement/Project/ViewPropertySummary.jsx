import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons, AntDesign, MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../../../../services/api";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const ViewPropertySummary = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const projectId = params?.projectId;

  const [loading, setLoading] = useState(true);
  const [propertyData, setPropertyData] = useState(null);
  const [expandedUnitTypes, setExpandedUnitTypes] = useState({});
  const [expandedTabs, setExpandedTabs] = useState({});
  const [unitCounts, setUnitCounts] = useState({});

  useEffect(() => {
    if (projectId) {
      fetchPropertySummary();
    }
  }, [projectId]);

  const fetchPropertySummary = async () => {
    try {
      setLoading(true);
      const secretKey = await SecureStore.getItemAsync("auth_token");
      console.log("Fetching property summary for project ID:", projectId);
      
      const response = await fetch(
        `${API_BASE_URL}/real-estate-properties/managePropertySummaryByProjectId/projectId/${projectId}`,
        {
          headers: {
            secret_key: secretKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Property Summary Response:", data);
      
      if (data) {
        setPropertyData(data);
        // Initialize unit counts from API data
        const initialCounts = {};
        data.propertySummary?.forEach((unitType, unitIndex) => {
          unitType.tabcontents?.forEach((tab, tabIndex) => {
            tab.content?.forEach((item, contentIndex) => {
              const key = `${unitIndex}-${tabIndex}-${contentIndex}`;
              initialCounts[key] = item.totalUnits || 0;
            });
          });
        });
        setUnitCounts(initialCounts);
      }
    } catch (error) {
      console.error("Error fetching property summary:", error);
      Alert.alert("Error", "Failed to fetch property summary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleUnitType = (index) => {
    setExpandedUnitTypes(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleTab = (unitIndex, tabIndex) => {
    const key = `${unitIndex}-${tabIndex}`;
    setExpandedTabs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleIncrement = (unitIndex, tabIndex, contentIndex) => {
    const key = `${unitIndex}-${tabIndex}-${contentIndex}`;
    setUnitCounts(prev => ({
      ...prev,
      [key]: (prev[key] || 0) + 1
    }));
  };

  const handleDecrement = (unitIndex, tabIndex, contentIndex) => {
    const key = `${unitIndex}-${tabIndex}-${contentIndex}`;
    setUnitCounts(prev => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) - 1)
    }));
  };

  const renderContentItem = (item, unitIndex, tabIndex, contentIndex) => {
    const key = `${unitIndex}-${tabIndex}-${contentIndex}`;
    const currentCount = unitCounts[key] || 0;

    return (
      <View key={contentIndex} style={styles.contentItem}>
        <View style={styles.contentDetails}>
          <View style={styles.contentRow}>
            <Text style={styles.contentLabel}>Area:</Text>
            <Text style={styles.contentValue}>
              {item.area} {item.areaUnit}
            </Text>
          </View>
          
          {item.structure && (
            <View style={styles.contentRow}>
              <Text style={styles.contentLabel}>Structure:</Text>
              <Text style={styles.contentValue}>{item.structure}</Text>
            </View>
          )}
          
          <View style={styles.contentRow}>
            <Text style={styles.contentLabel}>Type:</Text>
            <Text style={styles.contentValue}>{item.structureType}</Text>
          </View>
          
          {item.towerPropertyItem && (
            <View style={styles.contentRow}>
              <Text style={styles.contentLabel}>Tower Item:</Text>
              <Text style={styles.contentValue}>{item.towerPropertyItem.name}</Text>
            </View>
          )}
          
          <View style={styles.contentRow}>
            <Text style={styles.contentLabel}>Sub Property:</Text>
            <Text style={styles.contentValue}>{item.subPropertyType?.name}</Text>
          </View>
        </View>

        <View style={styles.unitCountSection}>
          <Text style={styles.unitCountLabel}>Total Units</Text>
          <View style={styles.counterContainer}>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => handleDecrement(unitIndex, tabIndex, contentIndex)}
            >
              <AntDesign name="minus" size={18} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.countDisplay}>
              <Text style={styles.countText}>{currentCount}</Text>
            </View>
            
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => handleIncrement(unitIndex, tabIndex, contentIndex)}
            >
              <AntDesign name="plus" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderTabContent = (tab, unitIndex, tabIndex) => {
    const tabKey = `${unitIndex}-${tabIndex}`;
    const isExpanded = expandedTabs[tabKey];

    return (
      <View key={tabIndex} style={styles.tabContainer}>
        <TouchableOpacity
          style={styles.tabHeader}
          onPress={() => toggleTab(unitIndex, tabIndex)}
        >
          <View style={styles.tabHeaderLeft}>
            <MaterialIcons name="tab" size={20} color="#2e7d32" />
            <Text style={styles.tabName}>{tab.tabName}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{tab.content?.length || 0}</Text>
            </View>
          </View>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#2e7d32"
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.tabContentContainer}>
            {tab.content?.map((item, contentIndex) =>
              renderContentItem(item, unitIndex, tabIndex, contentIndex)
            )}
          </View>
        )}
      </View>
    );
  };

  const renderUnitType = (unitType, unitIndex) => {
    const isExpanded = expandedUnitTypes[unitIndex];

    return (
      <View key={unitIndex} style={styles.unitTypeContainer}>
        <TouchableOpacity
          style={styles.unitTypeHeader}
          onPress={() => toggleUnitType(unitIndex)}
        >
          <View style={styles.unitTypeHeaderLeft}>
            <Ionicons
              name={unitType.unitType === "Residential" ? "home" : "business"}
              size={24}
              color="#fff"
            />
            <Text style={styles.unitTypeName}>{unitType.unitType}</Text>
            <View style={styles.tabCountBadge}>
              <Text style={styles.tabCountText}>
                {unitType.tabcontents?.length || 0} Types
              </Text>
            </View>
          </View>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.unitTypeContent}>
            {unitType.tabcontents?.map((tab, tabIndex) =>
              renderTabContent(tab, unitIndex, tabIndex)
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#004d40" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Property Summary</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2e7d32" />
          <Text style={styles.loadingText}>Loading property summary...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!propertyData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#004d40" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Property Summary</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No property summary available</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { project, propertySummary } = propertyData;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#004d40" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Property Summary</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Project Details Card */}
        <View style={styles.projectCard}>
          <View style={styles.projectHeader}>
            <Ionicons name="business" size={28} color="#2e7d32" />
            <Text style={styles.projectName}>{project?.projectName}</Text>
          </View>

          <View style={styles.projectDetails}>
            <View style={styles.projectRow}>
              <Ionicons name="checkmark-circle" size={18} color="#5aaf57" />
              <Text style={styles.projectLabel}>RERA Approved:</Text>
              <Text style={styles.projectValue}>
                {project?.isReraApproved ? "Yes" : "No"}
              </Text>
            </View>

            <View style={styles.projectRow}>
              <Ionicons name="calendar" size={18} color="#5aaf57" />
              <Text style={styles.projectLabel}>Start Date:</Text>
              <Text style={styles.projectValue}>{project?.projectStartDate}</Text>
            </View>

            <View style={styles.projectRow}>
              <Ionicons name="calendar-outline" size={18} color="#5aaf57" />
              <Text style={styles.projectLabel}>Completion:</Text>
              <Text style={styles.projectValue}>{project?.projectCompletionDate}</Text>
            </View>

            <View style={styles.projectRow}>
              <Ionicons name="resize" size={18} color="#5aaf57" />
              <Text style={styles.projectLabel}>Total Area:</Text>
              <Text style={styles.projectValue}>
                {project?.totalArea} {project?.areaUnitName}
              </Text>
            </View>

            <View style={styles.projectRow}>
              <Ionicons name="key" size={18} color="#5aaf57" />
              <Text style={styles.projectLabel}>Possession:</Text>
              <Text style={styles.projectValue}>{project?.possessionStatusEnum}</Text>
            </View>

            {project?.description && (
              <View style={[styles.projectRow, { flexDirection: 'column', alignItems: 'flex-start' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                  <Ionicons name="document-text" size={18} color="#5aaf57" />
                  <Text style={styles.projectLabel}>Description:</Text>
                </View>
                <Text style={styles.projectDescription}>{project?.description}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Unit Types Section */}
        <View style={styles.sectionHeader}>
          <Ionicons name="apps" size={22} color="#2e7d32" />
          <Text style={styles.sectionTitle}>Unit Types</Text>
        </View>

        {propertySummary?.map((unitType, index) => renderUnitType(unitType, index))}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? hp('5%') : 0,
    justifyContent: "space-between",
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('2%'),
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: hp('0.25%') },
    shadowOpacity: 0.1,
    shadowRadius: wp('1%'),
  },
  headerTitle: {
    fontSize: wp('5.2%'),
    fontFamily: "PlusSB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: hp('2%'),
    fontSize: wp('4%'),
    fontFamily: "PlusR",
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: wp('10%'),
  },
  emptyText: {
    marginTop: hp('2%'),
    fontSize: wp('4%'),
    fontFamily: "PlusR",
    color: "#999",
  },
  scrollView: {
    flex: 1,
  },
  projectCard: {
    backgroundColor: "#fff",
    margin: wp('4%'),
    borderRadius: wp('4%'),
    padding: wp('5%'),
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: hp('0.25%') },
    shadowOpacity: 0.1,
    shadowRadius: wp('1%'),
  },
  projectHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp('2.5%'),
    paddingBottom: hp('2%'),
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  projectName: {
    fontSize: wp('5.5%'),
    fontFamily: "PlusSB",
    color: "#2e7d32",
    marginLeft: wp('3%'),
    flex: 1,
  },
  projectDetails: {
    gap: hp('1.5%'),
  },
  projectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp('2%'),
  },
  projectLabel: {
    fontSize: wp('3.7%'),
    fontFamily: "PlusR",
    color: "#666",
  },
  projectValue: {
    fontSize: wp('3.7%'),
    fontFamily: "PlusSB",
    color: "#333",
    flex: 1,
  },
  projectDescription: {
    fontSize: wp('3.7%'),
    fontFamily: "PlusL",
    color: "#555",
    lineHeight: hp('2.5%'),
    marginLeft: wp('7%'),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('2%'),
    gap: wp('2.5%'),
  },
  sectionTitle: {
    fontSize: wp('4.5%'),
    fontFamily: "PlusSB",
    color: "#2e7d32",
  },
  unitTypeContainer: {
    marginHorizontal: wp('4%'),
    marginBottom: hp('2%'),
    borderRadius: wp('3%'),
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: hp('0.25%') },
    shadowOpacity: 0.1,
    shadowRadius: wp('1%'),
  },
  unitTypeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#2e7d32",
    padding: wp('4.5%'),
  },
  unitTypeHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: wp('3%'),
  },
  unitTypeName: {
    fontSize: wp('4.5%'),
    fontFamily: "PlusSB",
    color: "#fff",
  },
  tabCountBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: wp('2.5%'),
    paddingVertical: hp('0.5%'),
    borderRadius: wp('3%'),
  },
  tabCountText: {
    fontSize: wp('3%'),
    fontFamily: "PlusR",
    color: "#fff",
  },
  unitTypeContent: {
    backgroundColor: "#fff",
  },
  tabContainer: {
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  tabHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: wp('4%'),
    backgroundColor: "#f9f9f9",
  },
  tabHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: wp('2.5%'),
  },
  tabName: {
    fontSize: wp('4%'),
    fontFamily: "PlusSB",
    color: "#2e7d32",
  },
  badge: {
    backgroundColor: "#e8f5e9",
    borderRadius: wp('2.5%'),
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.5%'),
  },
  badgeText: {
    fontSize: wp('3%'),
    fontFamily: "PlusR",
    color: "#2e7d32",
  },
  tabContentContainer: {
    padding: wp('4%'),
    gap: hp('2%'),
  },
  contentItem: {
    backgroundColor: "#f5f5f5",
    borderRadius: wp('2.5%'),
    padding: wp('4%'),
    borderLeftWidth: 4,
    borderLeftColor: "#5aaf57",
  },
  contentDetails: {
    gap: hp('1.2%'),
    marginBottom: hp('2%'),
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp('2%'),
  },
  contentLabel: {
    fontSize: wp('3.2%'),
    fontFamily: "PlusR",
    color: "#666",
    minWidth: wp('25%'),
  },
  contentValue: {
    fontSize: wp('3.2%'),
    fontFamily: "PlusSB",
    color: "#333",
    flex: 1,
  },
  unitCountSection: {
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: hp('2%'),
  },
  unitCountLabel: {
    fontSize: wp('3.7%'),
    fontFamily: "PlusSB",
    color: "#2e7d32",
    marginBottom: hp('1.2%'),
    textAlign: "center",
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: wp('4%'),
  },
  counterButton: {
    backgroundColor: "#2e7d32",
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: hp('0.12%') },
    shadowOpacity: 0.2,
    shadowRadius: wp('0.5%'),
  },
  countDisplay: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#2e7d32",
    borderRadius: wp('2%'),
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('1.2%'),
    minWidth: wp('18%'),
    alignItems: "center",
  },
  countText: {
    fontSize: wp('4.5%'),
    fontFamily: "PlusSB",
    color: "#2e7d32",
  },
});

export default ViewPropertySummary;
