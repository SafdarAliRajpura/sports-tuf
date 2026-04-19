import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Platform, ScrollView } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { 
    LayoutDashboard, 
    MapPin, 
    Trophy, 
    Calendar, 
    TrendingUp, 
    Settings, 
    Plus, 
    LogOut, 
    Search, 
    Bell,
    ChevronRight,
    Maximize,
    Briefcase
} from 'lucide-react-native';

const SidebarItem = ({ Icon, label, path, active, onClick }: { Icon: any, label: string, path: string, active: boolean, onClick: () => void }) => {
    return (
        <TouchableOpacity
            style={[styles.sidebarItem, active && styles.sidebarItemActive]}
            onPress={onClick}
            activeOpacity={0.7}
        >
            <View style={[styles.iconWrapper, active && styles.iconWrapperActive]}>
                <Icon size={20} color={active ? "#A855F7" : "#94A3B8"} strokeWidth={active ? 2.5 : 2} />
            </View>
            <Text style={[styles.sidebarLabel, active && styles.sidebarLabelActive]}>
                {label}
            </Text>
            {active && (
                <View style={styles.activePill} />
            )}
        </TouchableOpacity>
    );
};

export default function PartnerLayout({ children }: { children?: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    const sidebarItems = [
        { Icon: LayoutDashboard, label: 'Dashboard', path: '/partner/pages/Dashboard' },
        { Icon: MapPin, label: 'My Turfs', path: '/partner/pages/MyTurfs' },
        { Icon: Trophy, label: 'Tournaments', path: '/partner/pages/Tournaments' },
        { Icon: Calendar, label: 'Bookings', path: '/partner/pages/Bookings' },
        { Icon: Maximize, label: 'Entry Scanner', path: '/partner/pages/Scanner' },
        { Icon: TrendingUp, label: 'Analytics', path: '/partner/pages/Analytics' },
        { Icon: Settings, label: 'Settings', path: '/partner/pages/Settings' },
    ];

    const isActive = (path: string) => {
        if (pathname === '/partner' || pathname === '/partner/' || pathname === '/partner/layouts/PartnerLayout') {
            return path === '/partner/pages/Dashboard';
        }
        return pathname.includes(path);
    };

    return (
        <View style={styles.container}>
            
            {/* --- NEON PURPLE SIDEBAR --- */}
            <View style={[styles.sidebar, Platform.OS === 'web' && { width: 280 }]}>
                <View style={styles.sidebarContent}>
                    {/* Logo Section (Web-Parity) */}
                    <TouchableOpacity 
                        style={styles.logoSection} 
                        onPress={() => router.push('/(tabs)/home')}
                        activeOpacity={0.8}
                    >
                        <View style={styles.logoBox}>
                            <Briefcase color="#FFFFFF" size={18} />
                        </View>
                        <View>
                            <Text style={styles.brandMain}>ARENA<Text style={styles.brandSub}>PRO</Text></Text>
                            <View style={styles.partnerTag}>
                                <Text style={styles.partnerTagText}>PARTNER</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Action Section */}
                    <View style={styles.actionSection}>
                        <TouchableOpacity style={styles.addButton} activeOpacity={0.8}>
                            <Plus color="#FFFFFF" size={18} strokeWidth={3} />
                            <Text style={styles.addButtonText}>Add New Turf</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Navigation Menu */}
                    <ScrollView showsVerticalScrollIndicator={false} style={styles.menuScrollView}>
                        <Text style={styles.menuSectionLabel}>MENU</Text>
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
                    </ScrollView>
                </View>

                {/* Bottom Section */}
                <View style={styles.sidebarBottom}>
                    <TouchableOpacity style={styles.logoutButton} onPress={() => router.push('/home')}>
                        <LogOut color="#F87171" size={18} />
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>

                    <View style={styles.userCard}>
                        <Image 
                            source={{ uri: 'https://api.dicebear.com/7.x/avataaars/png?seed=JohnDoe' }} 
                            style={styles.userAvatar} 
                        />
                        <View style={styles.userMeta}>
                            <Text style={styles.userName} numberOfLines={1}>John Doe</Text>
                            <Text style={styles.userRole}>Business Owner</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* --- MAIN CONTENT AREA --- */}
            <View style={styles.mainContent}>
                <View style={styles.topbar}>
                    <View style={styles.searchContainer}>
                        <Search color="#64748B" size={18} />
                        <TextInput 
                            style={[styles.searchInput, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                            placeholder="Search your venues or tournaments..."
                            placeholderTextColor="#64748B"
                        />
                    </View>
                    
                    <View style={styles.headerRight}>
                        <TouchableOpacity style={styles.headerIcon}>
                            <Bell color="#94A3B8" size={20} />
                            <View style={styles.notifDot} />
                        </TouchableOpacity>
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
        backgroundColor: '#020617',
    },
    sidebar: {
        backgroundColor: '#0F172A',
        borderRightWidth: 1,
        borderRightColor: 'rgba(255,255,255,0.05)',
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
        marginBottom: 40,
        gap: 12,
    },
    logoBox: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: '#A855F7',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#A855F7',
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 5,
    },
    brandMain: {
        fontSize: 18,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -1,
    },
    brandSub: {
        color: '#A855F7',
    },
    partnerTag: {
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#334155',
        borderRadius: 4,
        paddingHorizontal: 4,
        paddingVertical: 1,
        marginTop: 2,
    },
    partnerTagText: {
        fontSize: 8,
        fontWeight: '800',
        color: '#64748B',
        letterSpacing: 1,
    },
    actionSection: {
        marginBottom: 35,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#A855F7',
        paddingVertical: 14,
        borderRadius: 14,
        gap: 10,
        shadowColor: '#A855F7',
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 4,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
    },
    menuScrollView: {
        flex: 1,
    },
    menuSectionLabel: {
        color: '#475569',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 15,
        marginLeft: 10,
    },
    navMenu: {
        gap: 6,
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
        backgroundColor: 'rgba(168, 85, 247, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(168, 85, 247, 0.15)',
    },
    iconWrapper: {
        width: 34,
        height: 34,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconWrapperActive: {
        // Optional
    },
    sidebarLabel: {
        color: '#94A3B8',
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 10,
    },
    sidebarLabelActive: {
        color: '#A855F7',
    },
    activePill: {
        marginLeft: 'auto',
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#A855F7',
        shadowColor: '#A855F7',
        shadowOpacity: 1,
        shadowRadius: 5,
    },
    sidebarBottom: {
        padding: 20,
        gap: 15,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 10,
    },
    logoutText: {
        color: '#F87171',
        fontWeight: '800',
        fontSize: 13,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#020617',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    userAvatar: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#1E293B',
    },
    userMeta: {
        marginLeft: 12,
    },
    userName: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 13,
    },
    userRole: {
        color: '#64748B',
        fontSize: 9,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginTop: 2,
    },
    mainContent: {
        flex: 1,
        backgroundColor: '#020617',
    },
    topbar: {
        height: 80,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0F172A',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 10,
        width: Platform.OS === 'web' ? 380 : '70%',
        gap: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    searchInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#0F172A',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    notifDot: {
        position: 'absolute',
        top: 12,
        right: 14,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#A855F7',
        borderWidth: 2,
        borderColor: '#0F172A',
    },
    contentArea: {
        flex: 1,
    }
});


