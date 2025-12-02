import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../../../../services/api';

const ProjectListItem = ({ project, index, onSerialize, onView }) => (
    <View style={filterStyles.projectRow}>
        <Text style={filterStyles.serialNumber}>{index + 1}</Text>
        <View style={filterStyles.projectInfo}>
            <Text style={filterStyles.projectName}>{project.projectName}</Text>
            <Text style={filterStyles.builderName}>{project.builderName}</Text>
            <View style={filterStyles.statusBadge}>
                <Text style={filterStyles.statusText}>{project.possessionStatusEnum}</Text>
            </View>
        </View>
        <View style={filterStyles.actionButtons}>
            <TouchableOpacity 
                style={[filterStyles.actionButton, { backgroundColor: '#10b98150' }]}
                onPress={() => onSerialize(project)}
            >
                <MaterialCommunityIcons name="arrow-down-bold" size={20} color="#10b981" />
            </TouchableOpacity>
            <TouchableOpacity 
                style={[filterStyles.actionButton, { backgroundColor: '#3b82f650' }]}
                onPress={() => onView(project)}
            >
                <Ionicons name="list" size={20} color="#3b82f6" />
            </TouchableOpacity>
        </View>
    </View>
);

export default function ManageSerializeScreen() {
    const router = useRouter();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            setError(null);
            const secretKey = await SecureStore.getItemAsync("auth_token");

            const response = await axios.get(
                `${API_BASE_URL}/real-estate-projects/getAllProjects`,
                {
                    headers: { secret_key: secretKey },
                }
            );

            const data = response.data?.data || response.data || [];
            setProjects(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Fetch Projects Error:", err);
            setError("Failed to load projects. Please try again.");
            Alert.alert("Error", "Failed to load projects.");
        } finally {
            setLoading(false);
        }
    };

    const handleSerializeProperty = (project) => {
        router.push(`/PropertyDetails?projectId=${project.id}`);
    };

    const handleViewSerialized = (project) => {
        Alert.alert("View Serialized", `View serialized properties for ${project.projectName}`);
        // TODO: Navigate to serialized properties view
    };

    return (
        <SafeAreaView style={filterStyles.safeArea}>
            <ScrollView contentContainerStyle={filterStyles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* Header */}
                <View style={filterStyles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={28} color="#333" />
                    </TouchableOpacity>
                    <Text style={filterStyles.title}>
                        Existing <Text style={{ color: '#004d40' }}>Projects</Text>
                    </Text>
                </View>

                {/* Loading State */}
                {loading && (
                    <View style={filterStyles.loadingContainer}>
                        <ActivityIndicator size="large" color="#004d40" />
                        <Text style={filterStyles.loadingText}>Loading projects...</Text>
                    </View>
                )}

                {/* Error State */}
                {error && (
                    <View style={filterStyles.errorContainer}>
                        <Ionicons name="alert-circle" size={48} color="#e53935" />
                        <Text style={filterStyles.errorText}>{error}</Text>
                        <TouchableOpacity style={filterStyles.retryButton} onPress={fetchProjects}>
                            <Text style={filterStyles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Projects List */}
                {!loading && !error && (
                    <View style={filterStyles.card}>
                        <Text style={filterStyles.cardTitle}>
                            All Projects ({projects.length})
                        </Text>
                        
                        {projects.length > 0 ? (
                            <FlatList
                                data={projects}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item, index }) => (
                                    <ProjectListItem
                                        project={item}
                                        index={index}
                                        onSerialize={handleSerializeProperty}
                                        onView={handleViewSerialized}
                                    />
                                )}
                                scrollEnabled={false}
                                ItemSeparatorComponent={() => <View style={filterStyles.separator} />}
                            />
                        ) : (
                            <View style={filterStyles.emptyState}>
                                <Ionicons name="folder-open-outline" size={64} color="#999" />
                                <Text style={filterStyles.emptyText}>No projects found.</Text>
                            </View>
                        )}
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

// --- STYLES (Adjusted for projects list) ---
const filterStyles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
    scrollContent: { padding: 5, paddingTop: 30, paddingBottom: 40 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    title: { 
        fontSize: 24,
        fontFamily: "PlusSB", 
        color: '#333', 
        marginLeft: 10 
    },
    
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        fontFamily: "PlusM",
        color: '#004d40',
    },
    
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    errorText: {
        marginTop: 15,
        fontSize: 16,
        fontFamily: "PlusM",
        color: '#e53935',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    retryButton: {
        marginTop: 20,
        backgroundColor: '#004d40',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 10,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: "PlusSB",
    },
    
    card: { 
        backgroundColor: '#fff', 
        borderRadius: 16, 
        padding: 16, 
        elevation: 5, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    cardTitle: { 
        fontSize: 20, 
        fontFamily: 'PlusSB',
        color: '#1a1a1a', 
        marginBottom: 15, 
        borderBottomWidth: 2, 
        borderBottomColor: '#004d40', 
        paddingBottom: 10 
    },
    
    projectRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
        marginBottom: 8,
    },
    serialNumber: {
        fontSize: 16,
        fontFamily: "PlusSB",
        color: '#004d40',
        width: 40,
        textAlign: 'center',
    },
    projectInfo: {
        flex: 1,
        marginLeft: 10,
    },
    projectName: {
        fontSize: 16,
        fontFamily: "PlusSB",
        color: '#1a1a1a',
        marginBottom: 4,
    },
    builderName: {
        fontSize: 13,
        fontFamily: "PlusL",
        color: '#666',
        marginBottom: 6,
    },
    statusBadge: {
        backgroundColor: '#10b98130',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: 11,
        fontFamily: "PlusM",
        color: '#10b981',
    },
    
    actionButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    
    separator: { 
        height: 1, 
        backgroundColor: '#e0e0e0',
        marginHorizontal: 8,
        marginVertical: 4,
    },
    
    emptyState: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
        fontFamily: "PlusM",
        color: '#999',
    },
});