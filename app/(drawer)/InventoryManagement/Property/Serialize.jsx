import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Alert,
    SafeAreaView,
    StyleSheet,
    ActivityIndicator
} from "react-native";
import * as SecureStore from 'expo-secure-store';
import { useNavigation, useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { ArrowDown01, Eye } from "lucide-react-native";
import { DrawerActions } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
/* --------------------------------- THEME COLORS --------------------------------- */
const COLORS = {
    primary: "#004d40",
    primaryLight: "#218373ff",
    secondary: "#198170ff",
    background: "#fff",
    card: "#f4fcf4",
    input: "#f0f8f0",
    border: "#c8e6c9",
    text: "#202020ff",
    placeholder: "#13773dff",
    error: "#d32f2f",
    success: "#22c55e",
    warning: "#eab308",
};

import { API_BASE_URL } from "../../../../services/api";
const API_ENDPOINT = `${API_BASE_URL}/real-estate-projects/getAllProjects`;


const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'N/A';
    const parts = dateString.split('-');
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateString;
};

/* ----------------------------- Main Component ---------------------------- */
const Serialize = () => {
    const navigation = useNavigation();
    const router = useRouter();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // Get the token from SecureStore
                const secretKey = await SecureStore.getItemAsync('auth_token');
                
                if (!secretKey) {
                    // Log the error and set a specific error message
                    console.error("Authentication Error: Missing auth_token in SecureStore.");
                    setError("Authentication failed. Please log in again.");
                    return; // Exit the function if no token
                }

                const response = await fetch(API_ENDPOINT, {
                    method: 'GET',
                    headers: { 
                        'Content-Type': 'application/json', 
                        'secret_key': secretKey 
                    } 
                });

                if (response.status === 401 || response.status === 403) {
                    setError("Session expired. Please log in again.");
                    return; 
                }

                if (!response.ok) {
                    throw new Error(`Server returned status: ${response.status}`);
                }

                const rawData = await response.json();
                const mappedProjects = rawData.map(item => ({
                    id: item.id,
                    projectName: item.projectName,

                    // Mapped keys from API response
                    builder: item.builderName,
                    startDate: formatDateForDisplay(item.projectStartDate),
                    completionDate: formatDateForDisplay(item.projectCompletionDate),
                    possessionStatus: item.possessionStatusEnum.replace(/_/g, ' '), 
                    reraApproved: item.isReraApproved,

                    // Combined Address (for potential use in PropertyDetails screen)
                    address: `${item.address1 || ''}${item.address2 ? ', ' + item.address2 : ''}, ${item.city || ''}`,

                    // Pass the original item too, just in case (optional)
                    originalData: item
                }));

                setProjects(mappedProjects);

            } catch (err) {
                console.error("API Fetch Error:", err);
                // Update error message to handle the 'Missing token' case thrown earlier
                if (err.message.includes('Missing authentication token')) {
                    setError(err.message);
                } else {
                    setError(`Could not load projects: ${err.message}`);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const handleDeleteProject = (id) => {
        Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete this project? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    // NOTE: A real delete operation would call a DELETE API using the ID
                    onPress: () => setProjects(projects.filter((p) => p.id !== id)),
                    style: "destructive",
                },
            ]
        );
    };

    // Navigate to Serialize Property Details (similar to web's SerializeLink functionality)
    const handleSerializeProperty = (project) => {
        router.push({
            pathname: "/(drawer)/InventoryManagement/Property/PropertyDetails",
            params: { 
                projectId: project.id,  
                project: JSON.stringify(project)
            },
        });
    };

    // Navigate to View Serialized Property (similar to web's ViewSerializedProperty functionality)
    const handleViewSerialized = (project) => {
        router.push({
            pathname: "/(drawer)/InventoryManagement/Property/ViewSerializedProperty",
            params: { 
                projectId: project.id,  
                project: JSON.stringify(project)
            },
        });
    };

    const renderProjectItem = ({ item }) => (
        <View style={styles.cardContainer}>
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.7}
            >
                <View style={{ flex: 1 }}>
                    <Text style={styles.projectName}>{item.projectName}</Text>
                    <Text style={styles.projectText}>Builder: {item.builder}</Text>
                    <Text style={styles.projectText}>Status:
                        <Text style={{
                            fontFamily: 'PlusSB',
                            color: item.possessionStatus.includes('READY TO MOVE') ? COLORS.secondary : COLORS.warning
                        }}>
                            {' '}{item.possessionStatus}
                        </Text>
                    </Text>
                    <Text style={styles.dateText}>Starts: {item.startDate} | Ends: {item.completionDate}</Text>

                    <View style={styles.reraContainer}>
                        <Feather
                            name={item.reraApproved ? "check-circle" : "x-circle"}
                            size={16}
                            color={item.reraApproved ? COLORS.success : COLORS.error}
                        />
                        <Text style={[styles.reraText, { color: item.reraApproved ? COLORS.success : COLORS.error }]}>
                            RERA {item.reraApproved ? "Approved" : "Not Approved"}
                        </Text>
                    </View>
                </View>

                {/* Action Buttons - Matching Web Functionality */}
                <View style={styles.actionButtons}>
                    {/* Serialize Property Button (Green) - Similar to web's ArrowDown01 button */}
                    <TouchableOpacity 
                        style={styles.serializeButton} 
                        onPress={() => handleSerializeProperty(item)}
                        activeOpacity={0.7}
                    >
                        <ArrowDown01 size={18} color={COLORS.success} />
                    </TouchableOpacity>

                    {/* View Serialized Property Button (Blue) - Similar to web's TableOfContents button */}
                    <TouchableOpacity 
                        style={styles.viewButton} 
                        onPress={() => handleViewSerialized(item)}
                        activeOpacity={0.7}
                    >
                        <Eye size={18} color="#2563eb" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </View>
    );

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.stateContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={[styles.emptyText, { color: COLORS.primary }]}>Loading projects...</Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.stateContainer}>
                    <Ionicons name="warning-outline" size={32} color={COLORS.error} />
                    <Text style={[styles.emptyText, { color: COLORS.error, textAlign: 'center' }]}>{error}</Text>
                    <TouchableOpacity
                        style={[styles.addButton, { marginTop: 15, backgroundColor: COLORS.primaryLight }]}
                        onPress={() => {
                            setProjects([]);
                            setLoading(true);
                            setError(null);
                            // Re-runs the useEffect, which calls fetchProjects
                            // In a real app, you might want to force a re-render/re-fetch differently
                            router.replace(router.pathname); 
                        }}
                    >
                        <Text style={{ color: COLORS.card, fontFamily: "PlusSB" }}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (projects.length === 0) {
            return (
                <View style={styles.stateContainer}>
                    <Ionicons name="alert-circle-outline" size={40} color={COLORS.placeholder} />
                    <Text style={styles.emptyText}>No projects available</Text>
                </View>
            );
        }

        return (
            <FlatList
                data={projects}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderProjectItem}
                contentContainerStyle={{ paddingBottom: 40 }}
            />
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                    <Ionicons name="menu" size={28} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.title}>Manage Projects</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => router.push('/path-to-add-new-project')}>
                    <Ionicons name="add" size={24} color={COLORS.card} />
                </TouchableOpacity>
            </View>

            {/* Project List / State View */}
            {renderContent()}
        </SafeAreaView>
    );
};

const actionButtonBase = {
    padding: hp('1.2%'),
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    width: wp('10%'),
    height: wp('10%'),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: hp('0.12%') },
    shadowOpacity: 0.2,
    shadowRadius: wp('0.5%'),
};

/* -------------------------- Stylesheet (Themed) --------------------------- */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: 'space-between',
        paddingHorizontal: wp('5%'),
        paddingVertical: hp('2%'),
        paddingTop: hp('5%'),
        backgroundColor: COLORS.card,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        marginBottom: hp('0.6%'),
    },
    title: {
        flex: 1,
        fontSize: wp('6.8%'),
        fontFamily: "PlusSB",
        marginLeft: wp('3.5%'),
        color: COLORS.primary
    },
    addButton: { backgroundColor: COLORS.secondary, padding: wp('2%'), borderRadius: 50, elevation: 3 },
    cardContainer: { paddingHorizontal: wp('5%'), paddingVertical: hp('1.2%') },
    card: {
        flexDirection: "row",
        justifyContent: 'space-between',
        alignItems: "center",
        backgroundColor: COLORS.card,
        padding: wp('4.5%'),
        borderRadius: wp('4%'),
        borderLeftWidth: wp('1.5%'),
        borderLeftColor: COLORS.secondary,
        elevation: 3,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: hp('0.25%') },
        shadowOpacity: 0.15,
        shadowRadius: wp('0.8%'),
    },
    projectName: { fontSize: wp('4.8%'), fontFamily: "PlusSB", color: COLORS.text, marginBottom: hp('0.6%') },
    projectText: { fontSize: wp('3.5%'), fontFamily: "PlusM", color: COLORS.text, marginTop: hp('0.3%'), opacity: 0.8 },
    dateText: { fontSize: wp('3%'), fontFamily: "PlusL", color: COLORS.placeholder, marginTop: hp('0.6%'), fontStyle: 'italic' },
    reraContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: hp('1.2%'),
        paddingTop: hp('0.6%'),
        borderTopWidth: 1,
        borderTopColor: COLORS.border
    },
    reraText: { marginLeft: wp('2%'), fontSize: wp('3.5%'), fontFamily: "PlusM" },
    actionButtons: { flexDirection: "column", marginLeft: wp('3.5%'), gap: hp('1.2%') },
    serializeButton: { ...actionButtonBase, backgroundColor: "#dcfce7", borderWidth: 1, borderColor: COLORS.success },
    viewButton: { ...actionButtonBase, backgroundColor: "#dbeafe", borderWidth: 1, borderColor: "#2563eb" },
    stateContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: wp('5%'), gap: hp('1.2%') },
    emptyText: { fontSize: wp('4.8%'), fontFamily: "PlusM", color: COLORS.placeholder },
});

export default Serialize;