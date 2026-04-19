import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Platform, ScrollView } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { 
    LayoutGrid, 
    Users, 
    MapPin, 
    Award, 
    Calendar, 
    Settings, 
    LogOut, 
    Search, 
    Bell,
    ChevronRight,
    ShieldCheck,
    Zap
} from 'lucide-react-native';

const SidebarItem = ({ Icon, label, path, active, onClick }: { Icon: any, label: string, path: string, active: boolean, onClick: () => void }) => {
    return (
        <TouchableOpacity
            style={[styles.sidebarItem, active && styles.sidebarItemActive]}
            onPress={onClick}
            activeOpacity={0.7}
        >
            <View style={[styles.iconWrapper, active && styles.iconWrapperActive]}>
                <Icon size={20} color={active ? "#22C55E" : "#94A3B8"} strokeWidth={active ? 2.5 : 2} />
            </View>
            <Text style={[styles.sidebarLabel, active && styles.sidebarLabelActive]}>
                {label}
            </Text>
            {active && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
    );
};

export default function AdminLayout({ children }: { children?: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    const sidebarItems = [
        { Icon: LayoutGrid, label: 'Dashboard', path: '/admin/pages/Dashboard' },
        { Icon: Users, label: 'Users', path: '/admin/pages/Users' },
        { Icon: MapPin, label: 'Venues', path: '/admin/pages/Venues' },
        { Icon: Award, label: 'Tournaments', path: '/admin/pages/Tournaments' },
        { Icon: Calendar, label: 'Bookings', path: '/admin/pages/Bookings' },
        { Icon: Settings, label: 'Settings', path: '/admin/pages/Settings' },
    ];

    const isActive = (path: string) => {
        if (pathname === '/admin' || pathname === '/admin/' || pathname === '/admin/layouts/AdminLayout') {
            return path === '/admin/pages/Dashboard';
        }
        return pathname.includes(path);
    };

    return (
        <View style={styles.container}>
            
            {/* --- ADMIN PREMIUM SIDEBAR --- */}
            <View style={[styles.sidebar, Platform.OS === 'web' && { width: 280 }]}>
                <View style={styles.sidebarContent}>
                    {/* Logo Section */}
                    <TouchableOpacity 
                        style={styles.logoSection} 
                        onPress={() => router.push('/(tabs)/home')}
                        activeOpacity={0.8}
                    >
                        <View style={styles.logoContainer}>
                            <ShieldCheck color="#22C55E" size={20} fill="#22C55E" fillOpacity={0.2} />
                        </View>
                        <View>
                            <Text style={styles.brandMain}>ARENA<Text style={styles.brandSub}>PRO</Text></Text>
                            <Text style={styles.brandTagline}>ADMIN CONTROL CENTER</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Navigation Menu */}
                    <ScrollView showsVerticalScrollIndicator={false} style={styles.menuScrollView}>
                        <Text style={styles.menuSectionLabel}>ADMINISTRATION</Text>
                        <View style={styles.navMenu}>
                            {sidebarItems.map((item) => (
                                <SidebarItem
                                    key={item.path}
                                    Icon={item.Icon}
                                    label={item.label}
                                    path={item.path}
                                    active={isActive(item.path)}
                                    onClick={() => router.push(item.path as any)}
                                />
                            ))}
                        </View>

                        {/* Status Card */}
                        <View style={styles.statusCard}>
                            <View style={styles.statusHeader}>
                                <View style={styles.onlineDot} />
                                <Text style={styles.statusTitle}>System Status</Text>
                            </View>
                            <Text style={styles.statusText}>All systems operational. No pending critical alerts.</Text>
                        </View>
                    </ScrollView>
                </View>

                {/* Bottom Profile Section */}
                <View style={styles.sidebarBottom}>
                    <TouchableOpacity style={styles.userProfileCard} activeOpacity={0.9}>
                        <Image 
                            source={{ uri: 'https://api.dicebear.com/7.x/avataaars/png?seed=AdminUser' }} 
                            style={styles.userAvatar} 
                        />
                        <View style={styles.userMeta}>
                            <Text style={styles.userName} numberOfLines={1}>Admin User</Text>
                            <Text style={styles.userRole}>Super Administrator</Text>
                        </View>
                        <ChevronRight color="#475569" size={16} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.logoutButton} onPress={() => router.push('/home')}>
                        <LogOut color="#EF4444" size={18} />
                        <Text style={styles.logoutText}>Exit Admin Panel</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* --- MAIN CONTENT AREA --- */}
            <View style={styles.mainContent}>
                <View style={styles.topbar}>
                    <View style={styles.searchWrapper}>
                        <Search color="#64748B" size={18} />
                        <TextInput 
                            style={[styles.searchInput, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                            placeholder="Search users, venues, or transactions..."
                            placeholderTextColor="#64748B"
                        />
                    </View>
                    
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.headerIconButton}>
                            <Bell color="#94A3B8" size={20} />
                            <View style={styles.activeDot} />
                        </TouchableOpacity>
                        <View style={styles.verticalDivider} />
                        <View style={styles.adminStatusBadge}>
                            <Text style={styles.adminStatusText}>LIVE MODE</Text>
                        </View>
                    </View>
                </View>

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
        backgroundColor: '#070B14',
    },
    sidebar: {
        backgroundColor: '#0F1623',
        borderRightWidth: 1,
        borderRightColor: '#1E293B',
        width: 280,
    },
    sidebarContent: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    logoSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 35,
        gap: 12,
    },
    logoContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.2)',
    },
    brandMain: {
        fontSize: 18,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    brandSub: {
        color: '#22C55E',
    },
    brandTagline: {
        fontSize: 8,
        fontWeight: '800',
        color: '#64748B',
        letterSpacing: 1,
        marginTop: 2,
    },
    menuScrollView: {
        flex: 1,
    },
    menuSectionLabel: {
        color: '#475569',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1.5,
        marginBottom: 15,
        marginLeft: 10,
    },
    navMenu: {
        gap: 8,
    },
    sidebarItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: 'transparent',
    },
    sidebarItemActive: {
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    iconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    iconWrapperActive: {
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
    },
    sidebarLabel: {
        color: '#94A3B8',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 12,
    },
    sidebarLabelActive: {
        color: '#FFFFFF',
        fontWeight: '800',
    },
    activeIndicator: {
        marginLeft: 'auto',
        width: 4,
        height: 18,
        borderRadius: 2,
        backgroundColor: '#22C55E',
        shadowColor: '#22C55E',
        shadowOpacity: 1,
        shadowRadius: 10,
    },
    statusCard: {
        backgroundColor: 'rgba(34, 197, 94, 0.03)',
        borderRadius: 16,
        padding: 15,
        marginTop: 30,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.1)',
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    onlineDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#22C55E',
    },
    statusTitle: {
        color: '#22C55E',
        fontSize: 12,
        fontWeight: '800',
    },
    statusText: {
        color: '#64748B',
        fontSize: 11,
        lineHeight: 16,
        fontWeight: '500',
    },
    sidebarBottom: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#1E293B',
    },
    userProfileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 12,
        borderRadius: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#1E293B',
    },
    userMeta: {
        flex: 1,
        marginLeft: 12,
    },
    userName: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
    userRole: {
        color: '#64748B',
        fontSize: 10,
        fontWeight: '600',
        marginTop: 2,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 12,
    },
    logoutText: {
        color: '#EF4444',
        fontWeight: '700',
        fontSize: 13,
    },
    mainContent: {
        flex: 1,
        backgroundColor: '#070B14',
    },
    topbar: {
        height: 80,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
        backgroundColor: '#0F1623',
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 10,
        width: Platform.OS === 'web' ? 400 : '65%',
        gap: 12,
    },
    searchInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    headerIconButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    activeDot: {
        position: 'absolute',
        top: 12,
        right: 14,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EC4899',
        borderWidth: 2,
        borderColor: '#1E293B',
    },
    verticalDivider: {
        width: 1,
        height: 24,
        backgroundColor: '#334155',
    },
    adminStatusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.2)',
    },
    adminStatusText: {
        color: '#22C55E',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1,
    },
    contentArea: {
        flex: 1,
        overflow: 'hidden',
    }
});
