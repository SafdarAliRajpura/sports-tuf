import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Platform } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const SidebarItem = ({ iconName, label, path, active, onClick }: { iconName: any, label: string, path: string, active: boolean, onClick: () => void }) => {
    return (
        <TouchableOpacity
            style={[styles.sidebarItem, active && styles.sidebarItemActive]}
            onPress={onClick}
            activeOpacity={0.7}
        >
            <Feather name={iconName} color={active ? "#FFFFFF" : "#94A3B8"} size={20} />
            <Text style={[styles.sidebarLabel, active && styles.sidebarLabelActive]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
};

export default function PartnerLayout({ children }: { children?: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    const sidebarItems = [
        { iconName: "grid", label: 'Dashboard', path: '/partner/pages/Dashboard' },
        { iconName: "map-pin", label: 'My Turfs', path: '/partner/pages/MyTurfs' },
        { iconName: "calendar", label: 'Bookings', path: '/partner/pages/Bookings' },
        { iconName: "bar-chart-2", label: 'Analytics', path: '/partner/pages/Analytics' },
        { iconName: "settings", label: 'Settings', path: '/partner/pages/Settings' },
    ];

    // Helper to determine active state
    const isActive = (path: string) => {
        if (pathname === '/partner' || pathname === '/partner/' || pathname === '/partner/layouts/PartnerLayout') {
            return path === '/partner/pages/Dashboard';
        }
        return pathname.includes(path);
    };

    return (
        <View style={styles.container}>
            
            {/* --- SIDEBAR --- */}
            <View style={[styles.sidebar, Platform.OS === 'web' && { width: 260 }]}>
                <View style={styles.sidebarTop}>
                    {/* Logo Row */}
                    <TouchableOpacity 
                        style={styles.logoRow} 
                        onPress={() => router.push('/(tabs)/home')}
                        activeOpacity={0.8}
                    >
                        <View style={styles.logoSquare}>
                            <Feather name="layers" color="#FFFFFF" size={16} />
                        </View>
                        <Text style={styles.brandText} numberOfLines={1}>
                            ARENA <Text style={styles.brandAccent}>PRO</Text>
                        </Text>
                        <View style={styles.partnerBadge}>
                            <Text style={styles.partnerBadgeText}>PARTNER</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Add New Turf Button */}
                    <TouchableOpacity style={styles.addTurfButton}>
                        <Feather name="plus" size={16} color="#FFFFFF" />
                        <Text style={styles.addTurfButtonText}>Add New Turf</Text>
                    </TouchableOpacity>

                    {/* Navigation Items */}
                    <View style={styles.navMenu}>
                        {sidebarItems.map((item) => (
                            <SidebarItem
                                key={item.path}
                                iconName={item.iconName}
                                label={item.label}
                                path={item.path}
                                active={isActive(item.path)}
                                onClick={() => router.push(item.path as any)}
                            />
                        ))}
                    </View>
                </View>

                <View style={styles.sidebarBottom}>
                    <TouchableOpacity style={styles.exitButton} onPress={() => router.push('/home')}>
                        <Feather name="log-out" color="#F87171" size={18} />
                        <Text style={styles.exitText}>Log Out</Text>
                    </TouchableOpacity>

                    <View style={styles.userBox}>
                        <Image 
                            source={{ uri: 'https://api.dicebear.com/7.x/avataaars/png?seed=JohnDoe' }} 
                            style={styles.userAvatar} 
                        />
                        <View style={styles.userDetails}>
                            <Text style={styles.userName}>John Doe</Text>
                            <Text style={styles.userRole}>BUSINESS OWNER</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* --- MAIN CONTENT AREA --- */}
            <View style={styles.mainContent}>
                
                {/* Topbar Header */}
                <View style={styles.topbar}>
                    <View style={styles.searchBox}>
                        <Feather name="search" color="#64748B" size={16} style={{ marginRight: 10 }} />
                        <TextInput 
                            style={[
                                styles.searchInput,
                                Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)
                            ]}
                            placeholder="Search your venues..."
                            placeholderTextColor="#64748B"
                        />
                    </View>
                    
                    <View style={styles.headerRight}>
                        <TouchableOpacity style={styles.bellButton}>
                            <Feather name="bell" color="#94A3B8" size={18} />
                            <View style={styles.notificationDot} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Dynamic Page Component injection */}
                <View style={styles.contentArea}>
                     {children || <Slot />}
                </View>

            </View>

        </View>
    );
}

const styles: any = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#0F1624', // Match the main background
    },
    sidebar: {
        backgroundColor: '#121927', // slightly lighter for sidebar
        borderRightWidth: 1,
        borderRightColor: '#1E293B',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: 260, // Default width for mobile/web
    },
    sidebarTop: {
        padding: 24,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
    },
    logoSquare: {
        width: 24,
        height: 24,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    brandText: {
        fontSize: 18,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    brandAccent: {
        color: '#00D1FF', // Cyan accent
    },
    partnerBadge: {
        borderWidth: 1,
        borderColor: '#334155',
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginLeft: 6,
        backgroundColor: '#1E293B',
    },
    partnerBadgeText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#94A3B8',
        letterSpacing: 1,
    },
    addTurfButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 32,
        gap: 8,
    },
    addTurfButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    navMenu: {
        gap: 4,
    },
    sidebarItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: 'transparent',
        marginBottom: 4,
    },
    sidebarItemActive: {
        backgroundColor: 'rgba(255,255,255,0.05)', // light translucent background
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    sidebarLabel: {
        color: '#94A3B8',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 14,
        letterSpacing: 0.3,
    },
    sidebarLabelActive: {
        color: '#FFFFFF', 
        fontWeight: '700',
    },
    sidebarBottom: {
        padding: 24,
    },
    exitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 0,
        paddingVertical: 14,
        marginBottom: 20,
    },
    exitText: {
        color: '#F87171',
        fontWeight: '600',
        fontSize: 14,
        marginLeft: 14,
    },
    userBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)', // Darker background for user card
        padding: 12,
        borderRadius: 8,
    },
    userAvatar: {
        width: 36,
        height: 36,
        borderRadius: 6,
        marginRight: 12,
        backgroundColor: '#1E293B',
    },
    userName: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 13,
    },
    userRole: {
        color: '#64748B',
        fontSize: 9,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 2,
        fontWeight: '600',
    },
    userDetails: {
        justifyContent: 'center',
    },
    mainContent: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0A0F1A',
    },
    topbar: {
        height: 72,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 32,
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#121927', 
        borderWidth: 1,
        borderColor: '#1E293B',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        width: Platform.OS === 'web' ? 360 : '70%', 
    },
    searchInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
        padding: 0,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bellButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#121927',
        borderWidth: 1,
        borderColor: '#1E293B',
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationDot: {
        position: 'absolute',
        top: 8,
        right: 10,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#10B981', // green notification dot
    },
    contentArea: {
        flex: 1,
        padding: Platform.OS === 'web' ? 32 : 16,
        overflow: 'hidden', // Let children manage their own scroll
    }
});
