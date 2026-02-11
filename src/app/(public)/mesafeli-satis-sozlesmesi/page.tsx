import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi | Lesya",
  description: "Lesya Studio mesafeli satış sözleşmesi ön bilgilendirme formu.",
};

export default function DistanceSalesPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <header className="mb-16">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-4">Yasal</p>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-neutral-900">
            Mesafeli Satış Sözleşmesi
          </h1>
          <p className="text-xs text-neutral-400 mt-4">Son güncelleme: 11 Şubat 2026</p>
        </header>

        <div className="prose prose-neutral prose-sm max-w-none space-y-12 text-neutral-600 leading-relaxed">

          {/* 1 */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">1. Taraflar</h2>
            
            <div className="space-y-4">
              <div className="bg-neutral-50 rounded-2xl p-6 text-sm space-y-1">
                <p className="font-bold text-neutral-900 mb-2">SATICI</p>
                <p><strong>Ticari Unvan:</strong> Lesya Studio</p>
                <p><strong>Web Sitesi:</strong> lesyastudio.com</p>
                <p><strong>E-posta:</strong> info@lesyastudio.com</p>
              </div>
              <div className="bg-neutral-50 rounded-2xl p-6 text-sm">
                <p className="font-bold text-neutral-900 mb-2">ALICI (TÜKETİCİ)</p>
                <p>Sipariş formunda belirtilen ad, soyad, adres, e-posta ve telefon bilgilerine sahip kişi.</p>
              </div>
            </div>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">2. Sözleşmenin Konusu</h2>
            <p>
              İşbu sözleşme, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler 
              Yönetmeliği hükümleri gereğince, ALICI&apos;nın SATICI&apos;ya ait <strong>lesyastudio.com</strong> internet 
              sitesinden elektronik ortamda sipariş verdiği ürün/ürünlerin satışı ve teslimi ile ilgili 
              tarafların hak ve yükümlülüklerinin belirlenmesidir.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">3. Ürün Bilgileri</h2>
            <p>
              Satışa konu ürünlerin türü, miktarı, marka/modeli, rengi, adedi, satış bedeli ve ödeme şekli, 
              sipariş sayfasında ve sipariş onay e-postasında belirtildiği gibidir. Ürünlere ait temel 
              özellikler, ürün detay sayfasında yayınlanmaktadır.
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Tüm ürün fiyatları <strong>KDV dahildir</strong> (%20 KDV oranı uygulanmaktadır).</li>
              <li>Ürünlerin stok durumu, sipariş anına göre değişiklik gösterebilir.</li>
              <li>Ürün görselleri temsili niteliktedir.</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">4. Genel Hükümler</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>ALICI, SATICI&apos;ya ait internet sitesinde ürünlerin temel nitelikleri, satış fiyatı ve ödeme şekli ile teslimata ilişkin ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli onayı verdiğini kabul ve beyan eder.</li>
              <li>ALICI, bu sözleşmeyi elektronik ortamda teyit etmekle, mesafeli sözleşmelerin akdinden önce SATICI tarafından ALICI&apos;ya verilmesi gereken adres, sipariş konusu ürünlere ait temel özellikler, ürünlerin vergiler dahil fiyatı, ödeme ve teslimat bilgilerini de doğru ve eksiksiz olarak edindiğini teyit etmiş olur.</li>
              <li>Sözleşme konusu ürünler, yasal 30 günlük süreyi aşmamak koşuluyla, her bir ürün için ALICI&apos;nın sipariş tarihinden itibaren en geç 7 iş günü içinde kargoya teslim edilir.</li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">5. Teslimat Koşulları</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Teslimat, ALICI&apos;nın sipariş formunda belirttiği adrese yapılır.</li>
              <li>Teslimat sırasında ALICI&apos;nın adresinde bulunmaması durumunda dahi SATICI edimini tam ve eksiksiz olarak yerine getirmiş kabul edilir.</li>
              <li>Kargo ücreti sipariş toplam tutarına göre belirlenir:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>500 TL altı siparişlerde: <strong>30 TL</strong> kargo ücreti</li>
                  <li>500 TL ve üzeri siparişlerde: <strong>Ücretsiz kargo</strong></li>
                </ul>
              </li>
              <li>Tahmini teslimat süresi kargoya verilme tarihinden itibaren 1-5 iş günüdür.</li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">6. Ödeme</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Ödemeler, <strong>iyzico</strong> güvenli ödeme altyapısı üzerinden kredi kartı veya banka kartı ile yapılır.</li>
              <li>ALICI&apos;nın kart bilgileri SATICI tarafından hiçbir şekilde saklanmaz.</li>
              <li>İnternet sitesinden kredi kartı ile yapılan alışverişlerin taksitli satış seçeneği bulunmamaktadır. Banka tarafından sunulan taksitlendirme seçenekleri bankanın kendi insiyatifindedir.</li>
            </ul>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">7. Cayma Hakkı</h2>
            <p>
              ALICI, sözleşme konusu ürünün kendisine veya gösterdiği adresteki kişi/kuruluşa teslim tarihinden 
              itibaren <strong>14 (on dört) gün</strong> içinde herhangi bir gerekçe göstermeksizin ve cezai şart 
              ödemeksizin cayma hakkına sahiptir.
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Cayma hakkı süresi, ürünün teslim edildiği günden itibaren başlar.</li>
              <li>Cayma hakkının kullanılması için <strong>info@lesyastudio.com</strong> adresine yazılı bildirimde bulunulması yeterlidir.</li>
              <li>Cayma bildiriminin SATICI&apos;ya ulaşmasından itibaren 14 gün içinde ürün bedeli ALICI&apos;ya iade edilir.</li>
              <li>ALICI, cayma bildirimini yönelttiği tarihten itibaren 10 gün içinde ürünü iade etmekle yükümlüdür.</li>
            </ul>
            
            <div className="bg-neutral-50 rounded-2xl p-6 mt-6 text-sm">
              <p className="font-bold text-neutral-900 mb-2">Cayma Hakkı Kullanılamayan Ürünler</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>ALICI&apos;nın istekleri veya açıkça kişisel ihtiyaçları doğrultusunda hazırlanan ürünler</li>
                <li>Tesliminden sonra ambalaj, bant, mühür, paket gibi koruyucu unsurları açılmış olan ve iadesi sağlık ve hijyen açısından uygun olmayan ürünler (iç giyim, mayo, bikini vb.)</li>
                <li>Tesliminden sonra başka ürünlerle karışan ve doğası gereği ayrıştırılması mümkün olmayan ürünler</li>
              </ul>
            </div>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">8. Temerrüt Hali ve Hukuki Sonuçları</h2>
            <p>
              ALICI&apos;nın kredi kartı ile yapılan işlemlerde temerrüde düşmesi halinde, kart sahibi banka ile 
              arasındaki kredi kartı sözleşmesi çerçevesinde faiz ödeyecek ve bankaya karşı sorumlu olacaktır. 
              Bu durumda ilgili banka, hukuki yollara başvurabilir.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">9. Yetkili Mahkeme</h2>
            <p>
              İşbu sözleşmeden doğan uyuşmazlıklarda, Gümrük ve Ticaret Bakanlığınca ilan edilen değere kadar 
              <strong> Tüketici Hakem Heyetleri</strong>, bu değerin üzerindeki ihtilaflarda ise 
              <strong> Tüketici Mahkemeleri</strong> yetkilidir.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">10. Yürürlük</h2>
            <p>
              ALICI, sipariş adımında &quot;Mesafeli Satış Sözleşmesi&apos;ni okudum ve kabul ediyorum&quot; kutucuğunu 
              işaretleyerek işbu sözleşmenin tüm koşullarını kabul etmiş sayılır. Sözleşme, siparişin 
              onaylanması ile birlikte yürürlüğe girer.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
