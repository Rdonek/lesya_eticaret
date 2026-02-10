import React from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { DailyRevenue } from '@/hooks/use-sales-stats';

interface TrendChartProps {
  data: DailyRevenue[];
  height?: number;
  color?: string;
}

export function TrendChart({ data, height = 60, color = "#000000" }: TrendChartProps) {
  if (!data || data.length === 0) return null;

  const width = Dimensions.get('window').width - 80; // Padding consideration
  const maxVal = Math.max(...data.map(d => d.revenue)) || 1;
  const stepX = width / (data.length - 1);
  
  const points = data.map((d, i) => ({
    x: i * stepX,
    y: height - (d.revenue / maxVal) * height * 0.8 // Keep some padding top
  }));

  // Bezier Curve Logic (Mirrored from Web Admin AFI engine)
  const getPath = () => {
    if (points.length === 0) return '';
    if (points.length === 1) {
        // Fix for single data point (avoid NaN)
        return `M 0,${points[0].y} L ${width},${points[0].y}`;
    }

    return points.reduce((path, point, i, a) => {
      if (i === 0) return `M ${point.x},${point.y}`;
      const prev = a[i - 1];
      const cx = (prev.x + point.x) / 2;
      return `${path} C ${cx},${prev.y} ${cx},${point.y} ${point.x},${point.y}`;
    }, '');
  };

  const pathData = getPath();
  const fillData = `${pathData} L ${points[points.length - 1].x},${height} L 0,${height} Z`;

  return (
    <View style={{ height, width }}>
      <Svg height={height} width={width} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        
        {/* Fill Area */}
        <Path d={fillData} fill="url(#grad)" />
        
        {/* Stroke Line */}
        <Path 
          d={pathData} 
          fill="none" 
          stroke={color} 
          strokeWidth="2.5" 
          strokeLinecap="round" 
        />
      </Svg>
    </View>
  );
}
