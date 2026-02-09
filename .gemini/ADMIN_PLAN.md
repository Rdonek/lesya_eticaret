# Lesya Admin Pro - Geliştirme ve Genişletme Planı

Bu döküman, Lesya e-ticaret sisteminin mikro ölçekten profesyonel işletme yönetimine geçişi için gereken tüm teknik ve fonksiyonel detayları kapsar.

---

## 1. Finans ve Muhasebe Modülü (Finance Hub)
Bu modül, sadece ciroyu değil, işletmenin gerçek kârlılığını ölçmek için tasarlanmıştır.

### A. Veritabanı Gereksinimleri
- `product_variants` tablosuna `cost_price` (maliyet) sütunu eklenecek.
- `orders` tablosuna `shipping_cost_actual` (bizim kargoya ödediğimiz gerçek rakam) sütunu eklenecek.
- `finances` adında yeni bir tablo:
  - `id`, `type` (gelir/gider), `category` (Reklam, Kira, Lojistik, Stok, Maaş, Diğer), `amount`, `description`, `date`.

### B. Hesaplama Formülleri (Kesin Kurallar)
1. **Brüt Ciro:** Başarılı siparişlerin (`paid`, `shipped`, `delivered`) `total_amount` toplamı.
2. **KDV (Vergi):** `Ciro - (Ciro / (1 + VAT_RATE))`. (VAT_RATE ayarlardan gelecek, örn: 0.20).
3. **Ürün Maliyeti (COGS):** Satılan her ürünün o anki `cost_price` x `quantity` toplamı.
4. **Operasyonel Gider:** `finances` tablosundaki 'expense' kayıtları + Siparişlerdeki `shipping_cost_actual`.
5. **Net Kâr:** `Brüt Ciro - (KDV + Ürün Maliyeti + Operasyonel Gider)`.

### C. Finans UI
- **Özet Kartları:** Toplam Ciro, Beklenen KDV, Toplam Gider, Net Kâr (Renk kodlu: + ise Yeşil, - ise Kırmızı).
- **Gelir/Gider Listesi:** Tarih sıralı, kategori filtreli tablo.
- **Hızlı Giriş Formu:** Tip (Gelir/Gider), Kategori, Tutar, Açıklama seçilen modal.

---

## 2. Katalog ve Hızlı Stok Yönetimi (Bulk Manager)
Ürün bazlı değil, varyant bazlı hızlı operasyon ekranı.

### A. Fonksiyonel Detaylar
- `/admin/katalog/stok` adında yeni bir sayfa.
- **Spreadsheet UI:** Tüm ürün varyantlarının (Renk + Beden) alt alta listelendiği tek bir tablo.
- **Düzenlenebilir Alanlar:** `Fiyat`, `Maliyet`, `Stok`.
- **Toplu Kaydet:** Sadece değişen satırları tespit edip arka arkaya `update` atan "Batch Save" butonu.

---

## 3. Dinamik Mağaza Ayarları (Store Engine)
Kod değişikliği yapmadan mağaza parametrelerini yönetme alanı.

### A. Ayarlar Listesi (Key-Value)
- `SHIPPING_FREE_THRESHOLD`: Ücretsiz kargo alt sınırı (Sayı).
- `SHIPPING_FEE`: Standart kargo ücreti (Sayı).
- `VAT_RATE`: KDV oranı (Örn: 20).
- `STORE_STATUS`: Mağaza açık/kapalı/bakımda (Toggle).
- `CONTACT_WHATSAPP`: WhatsApp destek hattı (Text).

---

## 4. Gelişmiş Analitik ve Dashboard (BI Center)
Veri görselleştirme kuralları.

### A. Grafikler (SVG - Kesin Veri)
1. **Satış Trendi:** Son 30 günün günlük başarılı sipariş toplamları (Line Chart).
2. **Kategori Dağılımı:** Hangi kategoriden kaç adet satıldı? (Donut Chart).
3. **Popüler Ürünler:** En çok satan ilk 5 renk/varyant (Bar Chart).

---

## 5. CRM - Müşteri Veritabanı
Müşterileri birer dosya olarak takip etme.

### A. Müşteri Kartı Detayları
- **İsim/Email/Telefon.**
- **Toplam Harcama:** Bu müşterinin tüm başarılı siparişlerinin toplamı.
- **Sipariş Sayısı:** Toplam adet.
- **Son Sipariş Tarihi.**
- **Müşteri Segmenti:** (VIP: >5 sipariş, Yeni: 1 sipariş, Kayıp: >60 gün sipariş vermeyen).

---

## 6. Operasyonel Notlar ve Takip (Internal Logs)
Takım içi iletişim altyapısı.

### A. Sipariş İç Notları
- Sipariş detay sayfasında sadece adminlerin göreceği "Yönetici Notu" alanı.
- `order_logs` tablosuna manuel "Not" tipi eklenecek.

---

**Uygulama Sırası:**
1. **DB Setup:** Finans ve Ayarlar tablolarının kurulması.
2. **Store Settings:** Dinamik ayarların koda bağlanması.
3. **Bulk Stock:** Katalog yönetimi sayfasının inşası.
4. **Finance Hub:** Muhasebe dashboard ve tablo yapısı.
5. **Analytics:** Grafiklerin gerçek verilere bağlanması.