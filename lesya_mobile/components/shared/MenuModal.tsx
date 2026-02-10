import React from 'react';
import { View, TouchableOpacity, Modal, Pressable, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { 
  Wallet, 
  Users, 
  Settings, 
  LogOut, 
  X
} from 'lucide-react-native';
import { H3, Caption, Body } from '@/components/ui/Typography';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MenuModal({ isOpen, onClose }: MenuModalProps) {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    onClose();
    // Use setTimeout to ensure the modal closes before navigation starts on some Android devices
    setTimeout(() => {
      router.push(path as any);
    }, 100);
  };

  const handleSignOut = async () => {
    onClose();
    await supabase.auth.signOut();
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable onPress={onClose} className="flex-1 bg-black/40">
        <View className="flex-1 justify-end">
          <Pressable 
            onPress={(e) => e.stopPropagation()} 
            className="bg-white rounded-t-[40px] px-6 pt-8 pb-12 shadow-2xl"
          >
            {/* Modal Header */}
            <View className="flex-row items-center justify-between mb-8 px-2">
              <View>
                <H3 className="text-xl">YÖNETİM</H3>
                <Caption>HIZLI ERİŞİM MENÜSÜ</Caption>
              </View>
              <TouchableOpacity 
                onPress={onClose}
                className="h-10 w-10 rounded-full bg-neutral-50 items-center justify-center"
              >
                <X size={20} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Bento Grid */}
            <View className="gap-4">
              <View className="flex-row gap-4">
                <MenuCard 
                  icon={Wallet} 
                  label="Finans" 
                  sub="Kasa Durumu" 
                  onPress={() => handleNavigate('/(tabs)/finance')}
                />
                <MenuCard 
                  icon={Users} 
                  label="Müşteriler" 
                  sub="CRM Analizi" 
                  onPress={() => handleNavigate('/(tabs)/customers')}
                />
              </View>

              <View className="flex-row gap-4">
                <MenuCard 
                  icon={Settings} 
                  label="Ayarlar" 
                  sub="Mağaza Ayarları" 
                  onPress={() => handleNavigate('/(tabs)/settings')}
                />
                <MenuCard 
                  icon={LogOut} 
                  label="Çıkış" 
                  sub="Oturumu Kapat" 
                  variant="danger"
                  onPress={handleSignOut}
                />
              </View>
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

function MenuCard({ icon: Icon, label, sub, onPress, variant = 'default' }: any) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-1 bg-neutral-50 p-5 rounded-[28px] border border-neutral-100 gap-4"
    >
      <View className={`h-10 w-10 rounded-2xl items-center justify-center ${variant === 'danger' ? 'bg-red-50' : 'bg-white border border-neutral-100'}`}>
        <Icon size={20} color={variant === 'danger' ? '#ef4444' : '#000'} />
      </View>
      <View>
        <Body className={`font-bold text-sm ${variant === 'danger' ? 'text-red-600' : 'text-neutral-900'}`}>{label}</Body>
        <Caption className="text-[9px] tracking-normal normal-case opacity-60">{sub}</Caption>
      </View>
    </TouchableOpacity>
  );
}
