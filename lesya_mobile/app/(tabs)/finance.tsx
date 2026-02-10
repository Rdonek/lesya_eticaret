import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Caption, H1, H2, H3, Body } from '@/components/ui/Typography';
import { useFinanceActions, useFinanceStats, useTransactions } from '@/hooks/use-finance';
import { formatPrice } from '@/utils/format';
import { useRouter } from 'expo-router';
import {
    ArrowDownRight,
    ArrowUpRight,
    ChevronLeft,
    Plus,
    Trash2,
    TrendingUp,
    Wallet,
    X,
    Receipt,
    Package
} from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function FinanceScreen() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<'this_month' | 'last_month' | 'all_time'>('this_month');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useFinanceStats(dateRange);
  const { data: transactions, isLoading: txLoading, refetch: refetchTransactions } = useTransactions(dateRange);    
  const { addTransaction, deleteTransaction } = useFinanceActions();

  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [desc, setDescription] = useState('');

  const onRefresh = React.useCallback(() => {
    refetchStats();
    refetchTransactions();
  }, [refetchStats, refetchTransactions]);

  const handleAdd = () => {
    if (!amount || !desc) {
        Alert.alert('Eksik Bilgi', 'Lütfen tutar ve açıklama girin.');
        return;
    }

    addTransaction.mutate({
      type: txType,
      category: 'other',
      amount: parseFloat(amount),
      description: desc
    }, {
      onSuccess: () => {
        setIsModalOpen(false);
        setAmount('');
        setDescription('');
      }
    });
  };

  const handleDelete = (id: string) => {
    Alert.alert(
        'İşlemi Geri Al',
        'Bu işlemi ve varsa stok girişini tamamen geri almak istediğinize emin misiniz?',
        [
            { text: 'Vazgeç', style: 'cancel' },
            { text: 'Geri Al', style: 'destructive', onPress: () => deleteTransaction.mutate(id) }
        ]
    );
  };

  const isProfitPositive = (stats?.netProfit || 0) >= 0;

  if (statsLoading && !stats) {
    return (
        <ScreenWrapper className="bg-background items-center justify-center">
            <ActivityIndicator size="large" color="#000" />
        </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper noPadding className="bg-background">
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-neutral-50">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 rounded-full bg-neutral-50 items-center justify-center">
          <ChevronLeft size={20} color="#000" />
        </TouchableOpacity>
        <View className="flex-row bg-neutral-100 p-1 rounded-xl">
            <TouchableOpacity
                onPress={() => setDateRange('this_month')}
                style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: dateRange === 'this_month' ? '#fff' : 'transparent' }}
            >
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: dateRange === 'this_month' ? '#000' : '#a3a3a3' }}>BU AY</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => setDateRange('all_time')}
                style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: dateRange === 'all_time' ? '#fff' : 'transparent' }}
            >
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: dateRange === 'all_time' ? '#000' : '#a3a3a3' }}>TÜMÜ</Text>
            </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => setIsModalOpen(true)} className="h-10 w-10 rounded-full bg-neutral-900 items-center justify-center">
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={statsLoading || txLoading} onRefresh={onRefresh} tintColor="#000" />}
      >
        <View className="gap-6">
          
          {/* NET PROFIT CARD (The Star) */}
          <View className="bg-neutral-900 rounded-[32px] p-6 shadow-xl relative overflow-hidden">
            <View className="absolute top-0 right-0 p-6 opacity-10">
                <TrendingUp size={100} color="white" />
            </View>
            <View className="gap-6 relative z-10">
                <View className="flex-row justify-between items-start">
                    <View>
                        <Caption className="text-neutral-400 mb-1">NET İŞLETME KÂRI</Caption>
                        <H1 className="text-white text-3xl tracking-tighter">
                            {formatPrice(stats?.netProfit || 0)}
                        </H1>
                    </View>
                    <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: isProfitPositive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' }}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: isProfitPositive ? '#34d399' : '#f87171' }}>
                            {`%${stats?.margin?.toFixed(0) ?? '0'} MARJ`}
                        </Text>
                    </View>
                </View>
                <View className="flex-row justify-between border-t border-white/10 pt-4">
                    <View>
                        <Caption className="text-neutral-500 text-[8px]">CİRO</Caption>
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>{formatPrice(stats?.grossRevenue || 0)}</Text>
                    </View>
                    <View>
                        <Caption className="text-neutral-500 text-[8px]">MALİYET</Caption>
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>{formatPrice(stats?.cogs || 0)}</Text>
                    </View>
                    <View>
                        <Caption className="text-neutral-500 text-[8px]">GİDERLER</Caption>
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>{formatPrice((stats?.operationalExpenses || 0) + (stats?.vat || 0))}</Text>
                    </View>
                </View>
            </View>
          </View>

          {/* KASA CARD */}
          <View className="bg-white rounded-[28px] p-6 border border-neutral-100 shadow-sm gap-4">
            <View className="flex-row items-center gap-3 border-b border-neutral-50 pb-4">
                <View className="h-10 w-10 rounded-xl bg-neutral-50 items-center justify-center">
                    <Wallet size={20} color="#000" />
                </View>
                <View>
                    <Caption>TOPLAM KASA BAKİYESİ</Caption>
                    <H2 className="text-xl">{formatPrice(stats?.cashBalance || 0)}</H2>
                </View>
            </View>
            <View className="gap-3">
                <View className="flex-row justify-between items-center">
                    <Caption className="text-neutral-400">{dateRange === 'all_time' ? 'TOPLAM GİRİŞ' : 'DÖNEMSEL GİRİŞ'}</Caption>
                    <Text style={{ color: '#059669', fontWeight: 'bold', fontSize: 12 }}>+{formatPrice(stats?.periodIncome || 0)}</Text>
                </View>
                <View className="w-full bg-neutral-50 h-1.5 rounded-full overflow-hidden">
                    <View className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }} />
                </View>
                <View className="flex-row justify-between items-center mt-1">
                    <Caption className="text-neutral-400">{dateRange === 'all_time' ? 'TOPLAM ÇIKIŞ' : 'DÖNEMSEL ÇIKIŞ'}</Caption>
                    <Text style={{ color: '#dc2626', fontWeight: 'bold', fontSize: 12 }}>-{formatPrice(stats?.periodExpense || 0)}</Text>
                </View>
                <View className="w-full bg-neutral-50 h-1.5 rounded-full overflow-hidden">
                    <View 
                        className="bg-rose-500 h-full rounded-full" 
                        style={{ width: (stats?.periodIncome ? Math.min(100, (stats.periodExpense / stats.periodIncome) * 100) : 0) + ('%' as any) }} 
                    />
                </View>
            </View>
          </View>

          {/* TRANSACTIONS LIST */}
          <View>
            <View className="flex-row justify-between items-center mb-4 ml-1">
                <H3 className="text-base">HAREKETLER</H3>
                <Caption className="text-neutral-400 uppercase">{dateRange === 'all_time' ? 'TÜMÜ' : 'BU AY'}</Caption>
            </View>
            
            {transactions?.map((tx) => (
                <View key={tx.id} className="flex-row items-center justify-between p-4 bg-white rounded-2xl border border-neutral-100 mb-2 shadow-sm">
                    <View className="flex-row items-center gap-3 flex-1">
                        <View className={`h-10 w-10 rounded-xl items-center justify-center ${tx.type === 'income' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                            {tx.category === 'inventory' ? <Package size={18} color="#dc2626" /> : 
                             tx.category === 'sale' ? <Receipt size={18} color="#059669" /> :
                             tx.type === 'income' ? <ArrowUpRight size={18} color="#059669" /> : <ArrowDownRight size={18} color="#dc2626" />}
                        </View>
                        <View className="flex-1">
                            <Text style={{ fontWeight: 'bold', fontSize: 13, color: '#171717' }} numberOfLines={1}>{tx.description}</Text>
                            <Text style={{ fontSize: 10, color: '#a3a3a3', marginTop: 2 }}>
                                {new Date(tx.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} • {tx.source === 'manual' ? 'Manuel' : 'Sistem'}
                            </Text>
                        </View>
                    </View>
                    <View className="items-end gap-1 ml-2">
                        <Text style={{ fontWeight: '900', fontSize: 14, color: tx.type === 'income' ? '#059669' : '#171717' }}>
                            {`${tx.type === 'income' ? '+' : '-'}${formatPrice(tx.amount)}`}
                        </Text>
                        {(tx.source === 'manual' || tx.source === 'system_purchase') && (
                            <TouchableOpacity onPress={() => handleDelete(tx.id)} hitSlop={10}>
                                <Trash2 size={12} color="#ef4444" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            ))}
            
            {transactions?.length === 0 && (
                <View className="py-12 items-center justify-center bg-white rounded-3xl border border-neutral-50 border-dashed">
                    <Caption>BU DÖNEMDE HAREKET BULUNAMADI.</Caption>
                </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* NEW TRANSACTION MODAL */}
      <Modal visible={isModalOpen} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
                <View style={{ backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, gap: 24 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>  
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#000' }}>YENİ İŞLEM</Text>
                        <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                            <X size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: 'row', backgroundColor: '#f5f5f5', padding: 4, borderRadius: 12 }}>
                        <TouchableOpacity
                            onPress={() => setTxType('income')}
                            style={{ flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 8, backgroundColor: txType === 'income' ? 'white' : 'transparent' }}
                        >
                            <Text style={{ fontWeight: 'bold', fontSize: 14, color: txType === 'income' ? 'black' : '#a3a3a3' }}>GELİR</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setTxType('expense')}
                            style={{ flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 8, backgroundColor: txType === 'expense' ? 'white' : 'transparent' }}
                        >
                            <Text style={{ fontWeight: 'bold', fontSize: 14, color: txType === 'expense' ? 'black' : '#a3a3a3' }}>GİDER</Text>
                        </TouchableOpacity>
                    </View>

                    <View>
                        <Text style={{ marginBottom: 8, fontWeight: '500', color: '#000' }}>Tutar</Text>
                        <TextInput
                            placeholder="0.00"
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                            style={{ backgroundColor: '#f9f9f9', borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, borderColor: '#e5e5e5', color: '#000' }}
                        />
                    </View>

                    <View>
                        <Text style={{ marginBottom: 8, fontWeight: '500', color: '#000' }}>Açıklama</Text>       
                        <TextInput
                            placeholder="Örn: Ofis Kirası"
                            value={desc}
                            onChangeText={setDescription}
                            style={{ backgroundColor: '#f9f9f9', borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, borderColor: '#e5e5e5', color: '#000' }}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleAdd}
                        disabled={addTransaction.isPending}
                        style={{ backgroundColor: '#000', borderRadius: 16, height: 56, alignItems: 'center', justifyContent: 'center', opacity: addTransaction.isPending ? 0.5 : 1 }}
                    >
                        {addTransaction.isPending ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>KAYDET</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenWrapper>
  );
}