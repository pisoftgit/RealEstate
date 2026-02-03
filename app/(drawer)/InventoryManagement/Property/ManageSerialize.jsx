import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../../../../services/api';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

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
    scrollContent: { padding: wp('1.5%'), paddingTop: hp('4%'), paddingBottom: hp('5%') },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: hp('2.5%') },
    title: { 
        fontSize: wp('6.2%'),
        fontFamily: "PlusSB", 
        color: '#333', 
        marginLeft: wp('2.5%')
    },
    
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: hp('8%'),
    },
    loadingText: {
        marginTop: hp('2%'),
        fontSize: wp('4%'),
        fontFamily: "PlusM",
        color: '#004d40',
    },
    
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: hp('8%'),
    },
    errorText: {
        marginTop: hp('2%'),
        fontSize: wp('4%'),
        fontFamily: "PlusM",
        color: '#e53935',
        textAlign: 'center',
        paddingHorizontal: wp('5%'),
    },
    retryButton: {
        marginTop: hp('2.5%'),
        backgroundColor: '#004d40',
        paddingVertical: hp('1.5%'),
        paddingHorizontal: wp('8%'),
        borderRadius: wp('2.5%'),
    },
    retryButtonText: {
        color: '#fff',
        fontSize: wp('4%'),
        fontFamily: "PlusSB",
    },
    
    card: { 
        backgroundColor: '#fff', 
        borderRadius: wp('4%'), 
        padding: wp('4%'), 
        elevation: 5, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: hp('0.25%') },
        shadowOpacity: 0.1,
        shadowRadius: wp('1.5%'),
    },
    cardTitle: { 
        fontSize: wp('5.2%'), 
        fontFamily: 'PlusSB',
        color: '#1a1a1a', 
        marginBottom: hp('2%'), 
        borderBottomWidth: 2, 
        borderBottomColor: '#004d40', 
        paddingBottom: hp('1.2%'),
    },
    
    projectRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: hp('1.5%'),
        paddingHorizontal: wp('2%'),
        backgroundColor: '#f8f9fa',
        borderRadius: wp('2.5%'),
        marginBottom: hp('1%'),
    },
    serialNumber: {
        fontSize: wp('4.2%'),
        fontFamily: "PlusSB",
        color: '#004d40',
        width: wp('10%'),
        textAlign: 'center',
    },
    projectInfo: {
        flex: 1,
        marginLeft: wp('2.5%'),
    },
    projectName: {
        fontSize: wp('4.2%'),
        fontFamily: "PlusSB",
        color: '#1a1a1a',
        marginBottom: hp('0.5%'),
    },
    builderName: {
        fontSize: wp('3.2%'),
        fontFamily: "PlusL",
        color: '#666',
        marginBottom: hp('0.8%'),
    },
    statusBadge: {
        backgroundColor: '#10b98130',
        paddingVertical: hp('0.5%'),
        paddingHorizontal: wp('2.5%'),
        borderRadius: wp('3%'),
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: wp('2.8%'),
        fontFamily: "PlusM",
        color: '#10b981',
    },
    
    actionButtons: {
        flexDirection: 'row',
        gap: wp('2.5%'),
    },
    actionButton: {
        width: wp('10%'),
        height: wp('10%'),
        borderRadius: wp('5%'),
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: hp('0.12%') },
        shadowOpacity: 0.1,
        shadowRadius: wp('0.5%'),
    },
    
    separator: { 
        height: 1, 
        backgroundColor: '#e0e0e0',
        marginHorizontal: wp('2%'),
        marginVertical: hp('0.5%'),
    },
    
    emptyState: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: hp('8%'),
    },
    emptyText: {
        marginTop: hp('2%'),
        fontSize: wp('4%'),
        fontFamily: "PlusM",
        color: '#999',
    },
});