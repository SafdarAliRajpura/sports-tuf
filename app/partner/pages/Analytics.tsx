import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInRight, useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, G, Line, Text as SvgText } from 'react-native-svg';

const metrics = [
    { title: 'TOTAL REVENUE', value: '₹1.2L', trend: '+12%', isPositive: true },
    { title: 'AVG. BOOKING VALUE', value: '₹850', trend: '+5%', isPositive: true },
    { title: 'CONVERSION RATE', value: '3.2%', trend: '-1.1%', isPositive: false },
    { title: 'NEW CUSTOMERS', value: '145', trend: '+8.4%', isPositive: true },
];

const topTurfs = [
    { name: 'Neon Arena Main', value: 85, color: '#A855F7' },
    { name: 'Sky Badminton', value: 70, color: '#22C55E' },
    { name: 'Box Cricket', value: 65, color: '#00D1FF' },
    { name: 'Arena B', value: 40, color: '#EC4899' },
];

// Rough Bezier Curve points for a smooth revenue line
// Assuming SVG width 600, height 250
// Max Y = 4000
const chartData = [
    { label: 'Mon', x: 50, y: 50 },      // 4000
    { label: 'Tue', x: 130, y: 120 },    // ~2500
    { label: 'Wed', x: 210, y: 180 },    // ~1500
    { label: 'Thu', x: 290, y: 130 },    // ~2200
    { label: 'Fri', x: 370, y: 200 },    // ~1000
    { label: 'Sat', x: 450, y: 150 },    // 2390
    { label: 'Sun', x: 530, y: 80 },     // ~3500
];

export default function Analytics() {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    
    // Track active hovered point
    const [activeIndex, setActiveIndex] = useState<number | null>(5); // Default to Saturday
    const [tooltipData, setTooltipData] = useState({ label: 'Sat', value: 2390 });

    // Smooth reanimated pointers
    const tooltipX = useSharedValue(0);
    const tooltipY = useSharedValue(0);
    const tooltipOpacity = useSharedValue(0);
    
    // For responsive SVG width on the Revenue Card
    // Desktop layout has sidebar (260px) + padding. 
    // Rough width approx container - spacing
    const chartCardWidth = isMobile ? width - 32 - 48 : (width - 260 - 64) * 0.65;
    const svgWidth = Math.max(chartCardWidth, 300);
    const svgHeight = 250;

    // Scale X points proportionally to svgWidth
    const scaledChartData = chartData.map((pt, i) => ({
        ...pt,
        x: (i + 0.5) * (svgWidth / chartData.length)
    }));
    
    // Build path string
    let pathObj = `M ${scaledChartData[0].x} ${scaledChartData[0].y}`;
    for (let i = 0; i < scaledChartData.length - 1; i++) {
        const curr = scaledChartData[i];
        const next = scaledChartData[i + 1];
        const cp1x = curr.x + (next.x - curr.x) / 2;
        const cp1y = curr.y;
        const cp2x = curr.x + (next.x - curr.x) / 2;
        const cp2y = next.y;
        pathObj += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }

    // Creating area path by closing the curve down to the bottom
    const areaPath = `${pathObj} L ${scaledChartData[scaledChartData.length - 1].x} ${svgHeight} L ${scaledChartData[0].x} ${svgHeight} Z`;

    // Convert raw Y value to simulated revenue value for tooltip display
    const getRevenueFromY = (y: number) => {
        const val = 4000 - ((y - 10) / (svgHeight / 4 * 4)) * 4000;
        return Math.max(0, Math.round(val));
    };

    useEffect(() => {
        if (activeIndex !== null && scaledChartData[activeIndex]) {
            const pt = scaledChartData[activeIndex];
            setTooltipData({ label: pt.label, value: getRevenueFromY(pt.y) });
            
            if (tooltipOpacity.value === 0) {
                tooltipX.value = pt.x;
                tooltipY.value = pt.y;
                tooltipOpacity.value = withTiming(1, { duration: 150 });
            } else {
                tooltipX.value = withSpring(pt.x, { damping: 14, stiffness: 120 });
                tooltipY.value = withSpring(pt.y, { damping: 14, stiffness: 120 });
            }
        } else {
            tooltipOpacity.value = withTiming(0, { duration: 150 });
        }
    }, [activeIndex, svgWidth]);

    const animatedLineStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: tooltipX.value }],
            opacity: tooltipOpacity.value,
        };
    });

    const animatedDotStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: tooltipX.value },
                { translateY: tooltipY.value }
            ],
            opacity: tooltipOpacity.value,
        };
    });

    const animatedTooltipStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: tooltipX.value - 70 },
                { translateY: tooltipY.value + 15 }
            ],
            opacity: tooltipOpacity.value,
        };
    });

    const handlePointerMove = (e: any) => {
        let x = 0;
        // React Native web provides e.nativeEvent.offsetX, React Native Mobile uses locationX
        if (e.nativeEvent.offsetX !== undefined) {
             x = e.nativeEvent.offsetX;
        } else if (e.nativeEvent.locationX !== undefined) {
             x = e.nativeEvent.locationX;
        } else {
             return;
        }

        let closestIndex = 0;
        let minDistance = Infinity;

        scaledChartData.forEach((pt, i) => {
            const dist = Math.abs(pt.x - x);
            if (dist < minDistance) {
                minDistance = dist;
                closestIndex = i;
            }
        });

        if (activeIndex !== closestIndex) {
            setActiveIndex(closestIndex);
        }
    };

    const handlePointerLeave = () => {
        setActiveIndex(null);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
            {/* Header Area */}
            <View style={[styles.header, isMobile && styles.headerMobile]}>
                <Animated.View entering={FadeInUp.duration(600)} style={styles.headerTextGroup}>
                    <Text style={styles.headerTitle}>ANALYTICS</Text>
                    <Text style={styles.headerSubtitle}>Deep dive into your business metrics.</Text>
                </Animated.View>
                <Animated.View entering={FadeInRight.duration(600)} style={styles.headerActions}>
                    <TouchableOpacity style={styles.headerActionBtn}>
                        <Feather name="share-2" size={14} color="#FFFFFF" />
                        <Text style={styles.headerActionText}>Share</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.headerActionBtn, { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' }]}>
                        <Feather name="download" size={14} color="#000000" />
                        <Text style={[styles.headerActionText, { color: '#000000' }]}>Export Report</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>

            {/* Metrics Row */}
            <View style={styles.metricsWrapper}>
                {metrics.map((item, index) => (
                    <Animated.View 
                        entering={FadeInUp.duration(500).delay(index * 100)} 
                        key={item.title} 
                        style={[styles.metricCard, { width: isMobile ? '100%' : (isTablet ? '48%' : '23.5%') }]}
                    >
                        <Text style={styles.metricTitle}>{item.title}</Text>
                        <View style={styles.metricValRow}>
                            <Text style={styles.metricValue}>{item.value}</Text>
                            <View style={[
                                styles.trendBadge, 
                                { backgroundColor: item.isPositive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)' }
                            ]}>
                                <Text style={[
                                    styles.trendText, 
                                    { color: item.isPositive ? '#22C55E' : '#EF4444' }
                                ]}>{item.trend}</Text>
                            </View>
                        </View>
                    </Animated.View>
                ))}
            </View>

            {/* Charts Area */}
            <View style={[styles.chartsWrapper, isMobile && { flexDirection: 'column' }]}>
                
                {/* Revenue Overview Chart */}
                <Animated.View entering={FadeInUp.duration(600).delay(300)} style={[styles.chartCard, { flex: isMobile ? 0 : 2 }]}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>Revenue Overview</Text>
                        <View style={styles.dropdownBtn}>
                            <Text style={styles.dropdownBtnText}>Last 7 Days</Text>
                            <Feather name="chevron-down" size={14} color="#94A3B8" />
                        </View>
                    </View>

                    <View 
                        style={styles.svgContainer}
                        // @ts-ignore - RN Web pointer events
                        onPointerMove={Platform.OS === 'web' ? handlePointerMove : undefined}
                        onPointerLeave={Platform.OS === 'web' ? handlePointerLeave : undefined}
                        // RN Mobile touch events
                        onTouchMove={Platform.OS !== 'web' ? handlePointerMove : undefined}
                        onTouchEnd={Platform.OS !== 'web' ? handlePointerLeave : undefined}
                    >
                        <Svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
                            <Defs>
                                <SvgLinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                    <Stop offset="0" stopColor="#A855F7" stopOpacity="0.4" />
                                    <Stop offset="1" stopColor="#A855F7" stopOpacity="0.0" />
                                </SvgLinearGradient>
                            </Defs>

                            {/* Horizontal Grid Lines */}
                            {[0, 1, 2, 3, 4].map((level) => {
                                const y = level * (svgHeight / 4) + 10;
                                return (
                                    <G key={`grid-${level}`}>
                                        <Line x1="40" y1={y} x2={svgWidth} y2={y} stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" />
                                        {level < 4 && (
                                            <SvgText x="10" y={y + 5} fill="#64748B" fontSize="11" fontWeight="500">
                                                ₹{(4 - level) * 1000}
                                            </SvgText>
                                        )}
                                    </G>
                                );
                            })}
                            <SvgText x="10" y={svgHeight-5} fill="#64748B" fontSize="11" fontWeight="500">₹0</SvgText>

                            {/* X-Axis Labels */}
                            {scaledChartData.map((pt, i) => (
                                <SvgText key={`label-${i}`} x={pt.x} y={svgHeight + 20} fill={activeIndex === i ? "#FFFFFF" : "#64748B"} fontSize="11" fontWeight={activeIndex === i ? "700" : "500"} textAnchor="middle">
                                    {pt.label}
                                </SvgText>
                            ))}

                            {/* The Gradient Area */}
                            <Path d={areaPath} fill="url(#grad)" pointerEvents="none" />

                            {/* The Line Segment */}
                            <Path d={pathObj} fill="none" stroke="#A855F7" strokeWidth="3" pointerEvents="none" />
                        </Svg>
                        
                        {/* Smooth Animated Overlay Marker Line */}
                        <Animated.View style={[styles.hoverLine, animatedLineStyle]} pointerEvents="none" />
                        
                        {/* Smooth Animated Overlay Marker Dot */}
                        <Animated.View style={[styles.hoverDot, animatedDotStyle]} pointerEvents="none" />

                        {/* Smooth Animated Tooltip Overlay */}
                        <Animated.View pointerEvents="none" style={[styles.tooltipBox, animatedTooltipStyle]}>
                            <Text style={styles.tooltipTitle}>{tooltipData.label}</Text>
                            <Text style={styles.tooltipContent}>revenue : {tooltipData.value}</Text>
                        </Animated.View>
                    </View>
                </Animated.View>

                {/* Top Performing Turfs */}
                <Animated.View entering={FadeInUp.duration(600).delay(400)} style={[styles.chartCard, { flex: isMobile ? 0 : 1 }]}>
                    <Text style={styles.cardTitle}>Top Performing Turfs</Text>
                    
                    <View style={styles.barsContainer}>
                        {topTurfs.map((turf, idx) => (
                            <View key={idx} style={styles.barRow}>
                                <Text style={styles.barLabel}>{turf.name}</Text>
                                <View style={styles.barTrack}>
                                    {/* Grid background markers for visual effect */}
                                    <View style={styles.barGridBg}>
                                        {[1,2,3,4,5].map(g => <View key={g} style={styles.gridLine} />)}
                                    </View>
                                    {/* The filled bar */}
                                    <Animated.View 
                                        entering={FadeInRight.duration(800).delay(500 + idx * 100)} 
                                        style={[styles.barFill, { width: `${turf.value}%`, backgroundColor: turf.color }]} 
                                    />
                                </View>
                            </View>
                        ))}
                    </View>
                </Animated.View>

            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    contentContainer: {
        paddingBottom: 40,
        paddingHorizontal: Platform.OS === 'web' ? 0 : 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    headerMobile: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 16,
    },
    headerTextGroup: {
        gap: 4,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '500',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    headerActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#1E293B',
        backgroundColor: 'transparent',
    },
    headerActionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    metricsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 32,
    },
    metricCard: {
        backgroundColor: '#121927',
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    metricTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#94A3B8',
        letterSpacing: 0.5,
        marginBottom: 12,
    },
    metricValRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    metricValue: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    trendBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    trendText: {
        fontSize: 12,
        fontWeight: '800',
    },
    chartsWrapper: {
        flexDirection: 'row',
        gap: 24,
    },
    chartCard: {
        backgroundColor: '#121927',
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: '#1E293B',
        minHeight: 380,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    dropdownBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#0F1624',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    dropdownBtnText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    svgContainer: {
        position: 'relative',
        width: '100%',
        height: 280, // Height matching svgHeight roughly + padding
    },
    tooltipBox: {
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: '#0F1624',
        borderWidth: 1,
        borderColor: '#1E293B',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
        zIndex: 10,
        minWidth: 140,
    },
    tooltipTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
    },
    tooltipContent: {
        color: '#94A3B8',
        fontSize: 13,
        fontWeight: '600',
    },
    hoverLine: {
        position: 'absolute',
        top: 10,
        left: 0,
        width: 1,
        height: 240, 
        backgroundColor: '#FFFFFF',
        opacity: 0.5,
    },
    hoverDot: {
        position: 'absolute',
        top: -7,
        left: -7,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#FFFFFF',
        borderWidth: 3,
        borderColor: '#A855F7',
    },
    barsContainer: {
        marginTop: 24,
        gap: 24,
    },
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    barLabel: {
        width: 100, // Fixed width for labels
        color: '#94A3B8',
        fontSize: 13,
        fontWeight: '600',
        paddingRight: 10,
        textAlign: 'right',
    },
    barTrack: {
        flex: 1,
        height: 28,
        justifyContent: 'center',
        position: 'relative',
    },
    barGridBg: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 0,
    },
    gridLine: {
        width: 1,
        height: '100%',
        backgroundColor: '#1E293B',
        borderStyle: 'dashed',
    },
    barFill: {
        height: 28,
        borderRadius: 4,
        zIndex: 1,
    }
});
