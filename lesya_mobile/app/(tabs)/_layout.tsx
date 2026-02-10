import { MenuModal } from '@/components/shared/MenuModal';
import { Caption } from '@/components/ui/Typography';
import { useUnreadCount } from '@/hooks/use-notifications';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import {
  Bell,
  LayoutDashboard,
  Menu,
  Package,
  Tag
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Platform, View } from 'react-native';

export default function TabLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: unreadCount = 0 } = useUnreadCount();

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: Platform.OS === 'ios' ? 30 : 20,
            left: 24,
            right: 24,
            elevation: 0,
            backgroundColor: 'transparent',
            borderRadius: 32,
            height: 64,
            borderTopWidth: 0,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
          },
          tabBarBackground: () => (
            <BlurView 
              intensity={90} 
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                borderRadius: 32,
                overflow: 'hidden',
                backgroundColor: 'rgba(255,255,255,0.8)',
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.05)'
              }} 
            />
          ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} Icon={LayoutDashboard} />
            ),
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} Icon={Package} />
            ),
          }}
        />
        <Tabs.Screen
          name="catalog"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} Icon={Tag} />
            ),
          }}
        />
        
        <Tabs.Screen
          name="notifications"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIconWithBadge focused={focused} Icon={Bell} badge={unreadCount} />
            ),
          }}
        />
        
        {/* 'more' tab acts as the Menu trigger */}
        <Tabs.Screen
          name="more"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} Icon={Menu} />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setIsMenuOpen(true);
            },
          }}
        />

        {/* Hidden Routes (Still accessible via router.push) */}
        <Tabs.Screen name="finance" options={{ href: null }} />
        <Tabs.Screen name="customers" options={{ href: null }} />
        <Tabs.Screen name="settings" options={{ href: null }} />
      </Tabs>

      {/* MODAL IS HERE */}
      <MenuModal isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}

function TabIcon({ focused, Icon }: { focused: boolean; Icon: any }) {
  return (
    <View className="items-center justify-center gap-1">
      <Icon 
        size={24} 
        color={focused ? "#000000" : "#A3A3A3"} 
        strokeWidth={focused ? 2.5 : 2}
      />
      {focused && (
        <View className="h-1 w-1 rounded-full bg-black" />
      )}
    </View>
  );
}

function TabIconWithBadge({ focused, Icon, badge }: { focused: boolean; Icon: any; badge?: number }) {
  return (
    <View className="items-center justify-center">
      <Icon 
        size={24} 
        color={focused ? "#000000" : "#A3A3A3"} 
        strokeWidth={focused ? 2.5 : 2}
      />
      {(badge || 0) > 0 && (
        <View className="absolute -top-1 -right-2 h-5 w-5 rounded-full bg-destructive items-center justify-center border-2 border-white">
          <Caption className="text-destructive-foreground text-[9px] font-black">
            {(badge ?? 0) > 9 ? '9+' : String(badge ?? 0)}
          </Caption>
        </View>
      )}
      {focused && (
        <View className="h-1 w-1 rounded-full bg-black mt-1" />
      )}
    </View>
  );
}
