import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Image,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../services/api";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const TABS = [
  { key: "basic", label: "Basic Details", icon: "info" },
  { key: "other", label: "Other Details", icon: "file-text" },
  { key: "amenities", label: "Amenities", icon: "star" },
  { key: "facilities", label: "Facilities", icon: "map-pin" },
  { key: "media", label: "Media Files", icon: "image" },
];

const PropertyDetailView = ({ visible, onClose, item, propertyType }) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [propertyData, setPropertyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaData, setMediaData] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [currentViewingImage, setCurrentViewingImage] = useState(null);

  // Reset tab when modal opens
  useEffect(() => {
    if (visible) {
      setActiveTab("basic");
      setMediaData([]);
      setSelectedImage(null);
      fetchPropertyDetails();
    }
  }, [visible, item]);

  // Fetch media when media tab is selected
  useEffect(() => {
    if (activeTab === "media" && visible) {
      fetchMediaDetails();
    }
  }, [activeTab, visible]);

  const fetchPropertyDetails = async () => {
    if (!item) return;
    
    try {
      setLoading(true);
      const secretKey = await SecureStore.getItemAsync("auth_token");
      
      const projectId = item.projectId;
      const propertyId = item.propertyId || item.unitId || item.id;
      const propertyItem = propertyType || "GROUP_BLOCK";
      
      const url = `${API_BASE_URL}/real-estate-properties?projectId=${projectId}&propertyItem=${propertyItem}&propertyId=${propertyId}&needMedia=true&needAmenitiesAndFacilities=true`;
      
      console.log("Fetching property view details:", url);
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          secret_key: secretKey,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch property details");
      }
      
      const result = await response.json();
      const data = result.content && result.content.length > 0 ? result.content[0] : item;
      
      console.log("Property view data received");
      setPropertyData(data);
    } catch (error) {
      console.error("Error fetching property details:", error);
      setPropertyData(item);
    } finally {
      setLoading(false);
    }
  };

  const fetchMediaDetails = async () => {
    if (!item || mediaData.length > 0) return;
    
    try {
      setMediaLoading(true);
      const secretKey = await SecureStore.getItemAsync("auth_token");
      
      const projectId = item.projectId;
      const propertyId = item.propertyId || item.unitId || item.id;
      const propertyItem = propertyType || "GROUP_BLOCK";
      
      const url = `${API_BASE_URL}/real-estate-properties?projectId=${projectId}&propertyItem=${propertyItem}&propertyId=${propertyId}&needMedia=true`;
      
      console.log("Fetching media details:", url);
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          secret_key: secretKey,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch media details");
      }
      
      const result = await response.json();
      const data = result.content && result.content.length > 0 ? result.content[0] : null;
      
      if (data?.propertyMediaList && data.propertyMediaList.length > 0) {
        // Fetch actual image data for each media item
        const mediaWithImages = await Promise.all(
          data.propertyMediaList.map(async (media) => {
            if (media.id) {
              try {
                const mediaUrl = `${API_BASE_URL}/property-media/by-id?id=${media.id}`;
                const imgResponse = await fetch(mediaUrl, {
                  method: 'GET',
                  headers: {
                    'secret_key': secretKey,
                    'Accept': '*/*',
                  },
                });
                
                if (imgResponse.ok) {
                  const blob = await imgResponse.blob();
                  const base64Data = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                  });
                  return { ...media, base64Data };
                }
              } catch (err) {
                console.error("Error fetching media thumbnail:", err);
              }
            }
            return media;
          })
        );
        setMediaData(mediaWithImages);
        console.log("Media data with images received:", mediaWithImages.length, "items");
      } else {
        setMediaData([]);
      }
    } catch (error) {
      console.error("Error fetching media details:", error);
    } finally {
      setMediaLoading(false);
    }
  };

  const data = propertyData || item;

  // Get structure display text
  const getStructureText = () => {
    if (!data) return "Property Details";
    
    const structure = data?.flatHouseStructure?.structure || data?.structure || "";
    const area = data?.area || data?.carpetArea || "";
    const unit = data?.areaUnit?.unitName || "sq ft";
    
    if (structure && area) {
      return `${structure} - ${area} ${unit}`;
    } else if (structure) {
      return structure;
    } else if (area) {
      return `${area} ${unit}`;
    }
    return "Property Details";
  };

  // Helper function for ordinal suffix
  const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  };

  // Render Basic Details Tab
  const renderBasicDetails = () => (
    <View style={styles.tabContent}>
      <DetailRow label="Block Name" value={data?.towerName || data?.blockName} />
      <DetailRow 
        label="Floor No" 
        value={data?.floorNumber ? `${data.floorNumber}${getOrdinalSuffix(data.floorNumber)} Floor` : null} 
      />
      <DetailRow label="Flat No" value={data?.unitNumber || data?.flatNumber} />
      <DetailRow 
        label="Flat Structure" 
        value={data?.flatHouseStructure?.structure || data?.structure} 
      />
      <DetailRow 
        label="Furnishing Status" 
        value={data?.furnishingStatus?.status || data?.furnishingStatus} 
      />
      <DetailRow 
        label="Availability" 
        value={data?.availabilityStatus === "AVAILABLE" ? "Available" : data?.availabilityStatus} 
        valueStyle={data?.availabilityStatus === "AVAILABLE" ? styles.availableText : styles.unavailableText}
        showDot={data?.availabilityStatus === "AVAILABLE"}
      />
    </View>
  );

  // Render Other Details Tab
  const renderOtherDetails = () => (
    <View style={styles.tabContent}>
      <DetailRow 
        label="Carpet Area" 
        value={data?.area || data?.carpetArea} 
        suffix={` ${data?.areaUnit?.unitName || "sq ft"}`} 
      />
      <DetailRow 
        label="Loading %" 
        value={data?.loadingPercent || data?.loading} 
        suffix="%" 
      />
      <DetailRow 
        label="Super Area" 
        value={data?.superArea || data?.superBuiltUpArea} 
        suffix={` ${data?.areaUnit?.unitName || "sq ft"}`}
      />
      <DetailRow 
        label="Basic Cost" 
        value={data?.basicAmount || data?.basicCost} 
        prefix="₹ " 
      />
      <DetailRow 
        label="Total Cost" 
        value={data?.totalAmount || data?.totalCost} 
        prefix="₹ " 
      />
      <DetailRow 
        label="Facing" 
        value={data?.faceDirection?.faceDirection || data?.facing} 
      />
      <DetailRow 
        label="Kitchens" 
        value={data?.totalNoOfKitchen || data?.kitchens} 
      />
      <DetailRow 
        label="Description" 
        value={data?.description} 
      />
    </View>
  );

  // Render Amenities Tab
  const renderAmenities = () => {
    const amenities = data?.amenities || [];
    
    if (amenities.length === 0) {
      return (
        <View style={styles.tabContent}>
          <Text style={styles.emptyText}>No amenities available</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.tabContent}>
        {amenities.map((amenity, index) => (
          <View key={amenity.id || index} style={styles.listItem}>
            <Feather name="check-circle" size={18} color="#5aaf57" />
            <Text style={styles.listItemText}>
              {amenity.amenityName || amenity.name}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  // Render Facilities Tab
  const renderFacilities = () => {
    const facilities = data?.facilities || [];
    
    if (facilities.length === 0) {
      return (
        <View style={styles.tabContent}>
          <Text style={styles.emptyText}>No facilities available</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.tabContent}>
        {facilities.map((facility, index) => (
          <View key={facility.id || index} style={styles.listItem}>
            <Feather name="check-circle" size={18} color="#5aaf57" />
            <Text style={styles.listItemText}>
              {facility.facilityName || facility.name}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  // Get image URL from media object (for thumbnail display)
  const getMediaUrl = (media) => {
    // If we have a base64 cached image, use it
    if (media.base64Data) {
      return media.base64Data;
    }
    if (media.filePath) {
      return `${API_BASE_URL.replace('/api/v1', '')}${media.filePath}`;
    }
    if (media.mediaUrl) {
      return media.mediaUrl;
    }
    if (media.uri) {
      return media.uri;
    }
    return null;
  };

  // Handle image click to show preview - fetch with auth like ManageProjects
  const handleImagePress = async (media) => {
    setSelectedImage(media);
    setImagePreviewVisible(true);
    
    // If we already have base64 data cached, use it directly
    if (media.base64Data) {
      setCurrentViewingImage(media.base64Data);
      setImageLoading(false);
      return;
    }
    
    // If media has an id, fetch it from server with auth headers
    if (media.id) {
      try {
        setImageLoading(true);
        
        const secretKey = await SecureStore.getItemAsync("auth_token");
        if (!secretKey) {
          console.error("Authentication token not found");
          setImageLoading(false);
          return;
        }

        const mediaUrl = `${API_BASE_URL}/property-media/by-id?id=${media.id}`;
        console.log('Fetching media file:', mediaUrl);
        
        const response = await fetch(mediaUrl, {
          method: 'GET',
          headers: {
            'secret_key': secretKey,
            'Accept': '*/*',
          },
        });

        if (!response.ok) {
          console.error(`HTTP error! status: ${response.status}`);
          throw new Error(`Failed to load image. Status: ${response.status}`);
        }

        // Get the blob and convert to base64
        const blob = await response.blob();
        
        // Convert blob to base64 using FileReader API
        const base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        
        setCurrentViewingImage(base64Data);
        setImageLoading(false);
        
      } catch (err) {
        console.error("Failed to load media file:", err);
        setImageLoading(false);
        setCurrentViewingImage(null);
      }
    } else if (media.uri) {
      // If it's a local file with uri, display it directly
      setCurrentViewingImage(media.uri);
      setImageLoading(false);
    } else if (media.filePath) {
      // Use filePath as fallback
      setCurrentViewingImage(`${API_BASE_URL.replace('/api/v1', '')}${media.filePath}`);
      setImageLoading(false);
    } else {
      setImageLoading(false);
    }
  };

  // Render Media Files Tab
  const renderMediaFiles = () => {
    if (mediaLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#217a3b" />
          <Text style={styles.loadingText}>Loading media...</Text>
        </View>
      );
    }

    const mediaList = mediaData.length > 0 ? mediaData : (data?.propertyMediaList || data?.media || []);
    
    if (mediaList.length === 0) {
      return (
        <View style={styles.tabContent}>
          <Text style={styles.emptyText}>No images available</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.mediaContainer}>
        <View style={styles.mediaGrid}>
          {mediaList.map((media, index) => (
            <TouchableOpacity 
              key={media.id || index} 
              style={styles.mediaItem}
              onPress={() => handleImagePress(media)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: getMediaUrl(media) }}
                style={styles.mediaImage}
                resizeMode="cover"
              />
              <Text style={styles.mediaLabel} numberOfLines={1}>
                {media.mediaLabel || media.label || "Image"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Render active tab content
  const renderTabContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#217a3b" />
          <Text style={styles.loadingText}>Loading details...</Text>
        </View>
      );
    }

    switch (activeTab) {
      case "basic":
        return renderBasicDetails();
      case "other":
        return renderOtherDetails();
      case "amenities":
        return renderAmenities();
      case "facilities":
        return renderFacilities();
      case "media":
        return renderMediaFiles();
      default:
        return renderBasicDetails();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouchable} onPress={onClose} />
        <View style={styles.modalContainer}>
          {/* Header with structure info */}
          <View style={styles.header}>
            <Text style={styles.headerText}>{getStructureText()}</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.tabsContainer}
            contentContainerStyle={styles.tabsContent}
          >
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tab,
                  activeTab === tab.key && styles.activeTab,
                ]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Feather 
                  name={tab.icon} 
                  size={16} 
                  color={activeTab === tab.key ? "#217a3b" : "#666"} 
                />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab.key && styles.activeTabText,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Tab Content */}
          <ScrollView 
            style={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {renderTabContent()}
          </ScrollView>

          {/* Pagination Dots */}
          <View style={styles.dotsContainer}>
            {TABS.map((tab) => (
              <View
                key={tab.key}
                style={[
                  styles.dot,
                  activeTab === tab.key && styles.activeDot,
                ]}
              />
            ))}
          </View>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Image Preview Modal */}
      <Modal
        visible={imagePreviewVisible}
        animationType="fade"
        transparent
        onRequestClose={() => {
          setImagePreviewVisible(false);
          setCurrentViewingImage(null);
        }}
      >
        <View style={styles.imagePreviewOverlay}>
          {/* Close Button at top right */}
          <TouchableOpacity 
            style={styles.closePreviewButton}
            onPress={() => {
              setImagePreviewVisible(false);
              setCurrentViewingImage(null);
            }}
          >
            <Feather name="x" size={28} color="#fff" />
          </TouchableOpacity>
          
          {/* Image Container */}
          <View style={styles.imagePreviewContent}>
            {imageLoading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : currentViewingImage ? (
              <>
                <Image
                  source={{ uri: currentViewingImage }}
                  style={styles.fullPreviewImage}
                  resizeMode="contain"
                />
                <Text style={styles.previewImageLabel}>
                  {selectedImage?.mediaLabel || selectedImage?.label || "Image"}
                </Text>
              </>
            ) : (
              <Text style={styles.noImageText}>No image to display</Text>
            )}
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

// Helper component for detail rows
const DetailRow = ({ label, value, suffix = "", prefix = "", valueStyle, showDot }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}:</Text>
    <View style={styles.detailValueContainer}>
      {showDot && <View style={styles.statusDot} />}
      <Text style={[styles.detailValue, valueStyle]}>
        {value !== null && value !== undefined && value !== "" 
          ? `${prefix}${value}${suffix}` 
          : "N/A"}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  overlayTouchable: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: screenHeight * 0.9,
    minHeight: screenHeight * 0.7,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  headerText: {
    fontSize: 18,
    fontFamily: "PlusSB",
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 16,
  },
  tabsContainer: {
    maxHeight: 60,
  },
  tabsContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  activeTab: {
    backgroundColor: "#e8f5e9",
    borderWidth: 1,
    borderColor: "#217a3b",
  },
  tabText: {
    marginLeft: 6,
    fontSize: 12,
    color: "#666",
    fontFamily: "PlusR",
  },
  activeTabText: {
    color: "#217a3b",
    fontFamily: "PlusSB",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tabContent: {
    paddingVertical: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: "PlusSB",
    color: "#333",
    flex: 1,
  },
  detailValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  detailValue: {
    fontSize: 14,
    fontFamily: "PlusR",
    color: "#666",
    textAlign: "right",
  },
  availableText: {
    color: "#4CAF50",
    fontFamily: "PlusSB",
  },
  unavailableText: {
    color: "#f44336",
    fontFamily: "PlusSB",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginRight: 8,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  listItemText: {
    fontSize: 14,
    fontFamily: "PlusR",
    color: "#333",
    marginLeft: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    fontFamily: "PlusSB",
    textAlign: "center",
    paddingVertical: 20,
  },
  mediaContainer: {
    paddingVertical: 16,
  },
  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  mediaItem: {
    width: (screenWidth - 48) / 2,
    marginBottom: 12,
  },
  mediaImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  mediaLabel: {
    fontSize: 12,
    fontFamily: "PlusL",
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: "PlusR",
    color: "#666",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#217a3b",
  },
  closeButton: {
    backgroundColor: "#217a3b",
    paddingVertical: 16,
    alignItems: "center",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "PlusSB",
  },
  // Image Preview Modal Styles
  imagePreviewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  closePreviewButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePreviewContent: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 80,
    paddingBottom: 40,
  },
  fullPreviewImage: {
    width: screenWidth - 32,
    height: screenHeight * 0.7,
    borderRadius: 8,
  },
  previewImageLabel: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "PlusSB",
    marginTop: 16,
    textAlign: "center",
  },
  noImageText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "PlusR",
    textAlign: "center",
  },
});

export default PropertyDetailView;
