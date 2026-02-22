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
            <Feather name={iconName} color={active ? "#22C55E" : "#94A3B8"} size={20} />
            <Text style={[styles.sidebarLabel, active && styles.sidebarLabelActive]}>
                {label}
            </Text>
            {active && (
                <View style={styles.activePill} />
            )}
        </TouchableOpacity>
    );
};

export default function AdminLayout({ children }: { children?: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    const sidebarItems = [
        { iconName: "grid", label: 'Dashboard', path: '/admin/pages/Dashboard' },
        { iconName: "users", label: 'Users', path: '/admin/pages/Users' },
        { iconName: "map-pin", label: 'Venues', path: '/admin/pages/Venues' },
        { iconName: "award", label: 'Tournaments', path: '/admin/pages/Tournaments' },
        { iconName: "calendar", label: 'Bookings', path: '/admin/pages/Bookings' },
        { iconName: "settings", label: 'Settings', path: '/admin/pages/Settings' },
    ];

    // Helper to determine active state
    const isActive = (path: string) => {
        if (pathname === '/admin' || pathname === '/admin/' || pathname === '/admin/layouts/AdminLayout') {
            return path === '/admin/pages/Dashboard';
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
                            <Feather name="zap" color="#0A0F1A" size={16} />
                        </View>
                        <Text style={styles.brandText} numberOfLines={1}>
                            ARENA <Text style={styles.brandAccent}>PRO</Text>
                        </Text>
                        <View style={styles.adminBadge}>
                            <Text style={styles.adminBadgeText}>ADMIN</Text>
                        </View>
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
                        <Feather name="log-out" color="#EF4444" size={20} />
                        <Text style={styles.exitText}>Exit Admin</Text>
                    </TouchableOpacity>

                    <View style={styles.userBox}>
                        <Image 
                            source={{ uri: 'https://api.dicebear.com/7.x/avataaars/png?seed=AdminUser' }} 
                            style={styles.userAvatar} 
                        />
                        <View style={styles.userDetails}>
                            <Text style={styles.userName}>Admin User</Text>
                            <Text style={styles.userRole}>SUPER ADMIN</Text>
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
                            placeholder="Type to search..."
                            placeholderTextColor="#64748B"
                        />
                    </View>
                    
                    <View style={styles.headerRight}>
                        <TouchableOpacity style={styles.bellButton}>
                            <Feather name="bell" color="#94A3B8" size={20} />
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
        backgroundColor: '#070B14', // Match the main background
    },
    sidebar: {
        backgroundColor: '#0F1623', // slightly lighter for sidebar
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
        marginBottom: 40,
    },
    logoSquare: {
        width: 28,
        height: 28,
        borderRadius: 6,
        backgroundColor: '#00D1FF', // Cyan color
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
    adminBadge: {
        borderWidth: 1,
        borderColor: '#1E293B',
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginLeft: 6,
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    adminBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#64748B',
        letterSpacing: 1,
    },
    navMenu: {
        gap: 8,
    },
    sidebarItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 8,
        backgroundColor: 'transparent',
    },
    sidebarItemActive: {
        backgroundColor: 'rgba(34, 197, 94, 0.1)', // green/10
    },
    sidebarLabel: {
        color: '#94A3B8',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 14,
        letterSpacing: 0.3,
    },
    sidebarLabelActive: {
        color: '#22C55E', // green
        fontWeight: '700',
    },
    activePill: {
        marginLeft: 'auto',
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#22C55E', // green dot
    },
    sidebarBottom: {
        padding: 24,
    },
    exitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 20,
    },
    exitText: {
        color: '#EF4444',
        fontWeight: '600',
        fontSize: 14,
        marginLeft: 14,
    },
    userBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0A0F1A', // Darker background for user card
        padding: 12,
        borderRadius: 8,
    },
    userAvatar: {
        width: 36,
        height: 36,
        borderRadius: 6,
        marginRight: 12,
        backgroundColor: '#1E293B',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    userName: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 13,
    },
    userRole: {
        color: '#64748B',
        fontSize: 10,
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
        backgroundColor: '#070B14',
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
        backgroundColor: '#0F1623', 
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
        borderRadius: 8,
        backgroundColor: '#0F1623',
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
        backgroundColor: '#EC4899', // pink-500
    },
    contentArea: {
        flex: 1,
        padding: Platform.OS === 'web' ? 32 : 16,
        overflow: 'hidden', // Let children manage their own scroll
    }
});
