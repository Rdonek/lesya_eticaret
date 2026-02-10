import React, { useState, useMemo, useCallback } from 'react';
import { View, FlatList, RefreshControl, ActivityIndicator, TextInput, TouchableOpacity, ScrollView, Text, Modal, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { AdminHeader } from '@/components/shared/AdminHeader';
import { CatalogCard } from '@/components/shared/CatalogCard';
import { useCatalog, useCategories, useCatalogActions } from '@/hooks/use-catalog';
import { Search, X, Plus, Box } from 'lucide-react-native';
import { Caption, H3 } from '@/components/ui/Typography';
import { useRouter } from 'expo-router';

export default function CatalogScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const { data: products, isLoading, refetch } = useCatalog(searchQuery, selectedCategoryId);
  const { data: categories } = useCategories();
  const { addCategory, deleteCategory } = useCatalogActions();

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    addCategory.mutate(newCategoryName.trim(), {
      onSuccess: () => {
        setIsCategoryModalOpen(false);
        setNewCategoryName('');
      }
    });
  };

  const handleDeleteCategory = (id: string, name: string) => {
    Alert.alert(
      'Kategoriyi Sil',
      `"${name}" kategorisini silmek istediğinize emin misiniz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: () => deleteCategory.mutate(id) }
      ]
    );
  };

  return (
    <ScreenWrapper noPadding className="bg-background">
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="px-4">
            <CatalogCard product={item} />
          </View>
        )}
        ListHeaderComponent={
          <View className="gap-4 mb-4">
            <AdminHeader title="KATALOG" subtitle="ÜRÜN YÖNETİMİ">
              <View className="flex-row gap-2">
                  <TouchableOpacity
                  onPress={() => {
                      setIsSearching(!isSearching);
                      if (isSearching) setSearchQuery('');
                  }}
                  className="h-10 w-10 rounded-xl bg-white border border-neutral-100 items-center justify-center shadow-sm"
                  >
                  {isSearching ? <X size={18} color="#000" /> : <Search size={18} color="#000" />}
                  </TouchableOpacity>

                  <TouchableOpacity
                  onPress={() => router.push('/catalog/stock')}
                  className="h-10 w-10 rounded-xl bg-white border border-neutral-100 items-center justify-center shadow-sm"
                  >
                  <Box size={18} color="#000" />
                  </TouchableOpacity>

                  <TouchableOpacity
                  onPress={() => router.push('/catalog/new')}
                  className="h-10 w-10 rounded-xl bg-neutral-900 items-center justify-center shadow-sm"
                  >
                  <Plus size={18} color="#fff" />
                  </TouchableOpacity>
              </View>
            </AdminHeader>

            {isSearching && (
              <View className="px-4">
                <View className="flex-row items-center bg-white border border-neutral-100 rounded-2xl px-4 h-12 shadow-sm">
                  <Search size={16} color="#a3a3a3" />
                  <TextInput
                    placeholder="Ürün adı ara..."
                    className="flex-1 ml-3 text-sm font-medium h-full"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                </View>
              </View>
            )}

            {/* Category Rail */}
            <View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
              >
                <TouchableOpacity
                  onPress={() => setSelectedCategoryId(null)}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 16,
                    borderWidth: 1,
                    backgroundColor: !selectedCategoryId ? '#171717' : '#fff',
                    borderColor: !selectedCategoryId ? '#171717' : '#f5f5f5'
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: !selectedCategoryId ? '#fff' : '#a3a3a3' }}>TÜMÜ</Text>
                </TouchableOpacity>

                {categories?.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setSelectedCategoryId(cat.id)}
                    onLongPress={() => handleDeleteCategory(cat.id, cat.name)}
                    style={{
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                      borderRadius: 16,
                      borderWidth: 1,
                      backgroundColor: selectedCategoryId === cat.id ? '#171717' : '#fff',
                      borderColor: selectedCategoryId === cat.id ? '#171717' : '#f5f5f5'
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: selectedCategoryId === cat.id ? '#fff' : '#a3a3a3' }}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  onPress={() => setIsCategoryModalOpen(true)}
                  className="h-9 w-9 rounded-2xl bg-neutral-100 items-center justify-center border border-neutral-200 border-dashed"
                >
                  <Plus size={14} color="#000" />
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor="#000"
          />
        }
        ListEmptyComponent={!isLoading ? (
          <View className="py-20 items-center justify-center">
            <Caption>ÜRÜN BULUNAMADI</Caption>
          </View>
        ) : null}
        keyboardShouldPersistTaps="handled"
      />

      {/* Add Category Modal */}
      <Modal visible={isCategoryModalOpen} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <View className="flex-1 bg-black/60 justify-end">
            <View className="bg-white rounded-t-[32px] p-8 pb-12 gap-6">
              <View className="flex-row justify-between items-center">
                <H3>YENİ KATEGORİ</H3>
                <TouchableOpacity onPress={() => setIsCategoryModalOpen(false)}>
                  <X size={24} color="#000" />
                </TouchableOpacity>
              </View>

              <View className="gap-2">
                <Caption className="ml-1">KATEGORİ ADI</Caption>
                <TextInput
                  placeholder="Örn: Yeni Sezon"
                  className="bg-neutral-50 rounded-2xl p-4 text-base border border-neutral-100 font-bold"
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                onPress={handleAddCategory}
                disabled={addCategory.isPending}
                style={{
                  backgroundColor: '#171717',
                  borderRadius: 16,
                  height: 56,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: addCategory.isPending ? 0.5 : 1
                }}
              >
                {addCategory.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>KAYDET</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {isLoading && !products && (
        <View className="flex-1 items-center justify-center absolute inset-0 bg-background/50">
          <ActivityIndicator size="large" color="#000" />
        </View>
      )}
    </ScreenWrapper>
  );
}