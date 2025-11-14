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
import { ArrowDown01 } from "lucide-react-native";
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

    const handleProjectClick = (project) => {
        router.push({
            pathname: "/(drawer)/InventoryManagement/Property/PropertyDetails",
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
                onPress={() => handleProjectClick(item)}
            >
                <View style={{ flex: 1 }}>
                    <Text style={styles.projectName}>{item.projectName}</Text>
                    <Text style={styles.projectText}>Builder: {item.builder}</Text>
                    <Text style={styles.projectText}>Status:
                        <Text style={{
                            fontWeight: '600',
                            color: item.possessionStatus.includes('READY TO MOVE') ? COLORS.secondary : COLORS.warning
                        }}>
                            {item.possessionStatus}
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

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.editButton} onPress={() => handleProjectClick(item)}>
                        <ArrowDown01  size={18} color="#eab308" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteProject(item.id)}>
                        <Feather name="trash-2" size={18} color={COLORS.error} />
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
                        <Text style={{ color: COLORS.card, fontWeight: 'bold' }}>Try Again</Text>
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
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color={COLORS.primary} />
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
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    elevation: 1,
};

/* -------------------------- Stylesheet (Themed) --------------------------- */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: "row", alignItems: "center", justifyContent: 'space-between', paddingHorizontal: 20,
        paddingVertical: 15, paddingTop: 40, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border, marginBottom: 5,
    },
    title: { flex: 1, fontSize: 26, fontWeight: "800", marginLeft: 15, color: COLORS.primary },
    addButton: { backgroundColor: COLORS.secondary, padding: 8, borderRadius: 50, elevation: 3 },
    cardContainer: { paddingHorizontal: 20, paddingVertical: 8 },
    card: {
        flexDirection: "row", justifyContent: 'space-between', alignItems: "center", backgroundColor: COLORS.card, padding: 18,
        borderRadius: 15, borderLeftWidth: 6, borderLeftColor: COLORS.secondary, elevation: 3, shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3,
    },
    projectName: { fontSize: 18, fontWeight: "700", color: COLORS.text, marginBottom: 5 },
    projectText: { fontSize: 14, color: COLORS.text, marginTop: 2, opacity: 0.8 },
    dateText: { fontSize: 12, color: COLORS.placeholder, marginTop: 5, fontStyle: 'italic' },
    reraContainer: { flexDirection: "row", alignItems: "center", marginTop: 10, paddingTop: 5, borderTopWidth: 1, borderTopColor: COLORS.border },
    reraText: { marginLeft: 8, fontSize: 14, fontWeight: '600' },
    actionButtons: { flexDirection: "column", marginLeft: 15, gap: 10 },
    editButton: { ...actionButtonBase, backgroundColor: "#fff3cd", borderWidth: 1, borderColor: COLORS.warning },
    deleteButton: { ...actionButtonBase, backgroundColor: "#fbe8e8", borderWidth: 1, borderColor: COLORS.error },
    stateContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, gap: 10 },
    emptyText: { fontSize: 18, color: COLORS.placeholder, fontWeight: '500' },
});

export default Serialize;