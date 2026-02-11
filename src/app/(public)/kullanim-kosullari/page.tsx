import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kullanım Koşulları | Lesya",
  description: "Lesya Studio web sitesi kullanım koşulları ve şartları.",
};

export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <header className="mb-16">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-4">Yasal</p>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-neutral-900">
            Kullanım Koşulları
          </h1>
          <p className="text-xs text-neutral-400 mt-4">Son güncelleme: 11 Şubat 2026</p>
        </header>

        <div className="prose prose-neutral prose-sm max-w-none space-y-12 text-neutral-600 leading-relaxed">

          {/* 1 */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">1. Genel</h2>
            <p>
              Bu kullanım koşulları, <strong>lesyastudio.com</strong> web sitesini (&quot;Site&quot;) kullanımınıza 
              ilişkin hüküm ve koşulları düzenler. Siteyi ziyaret ederek veya site üzerinden alışveriş yaparak 
              bu koşulları kabul etmiş sayılırsınız.
            </p>
            <p className="mt-3">
              Site, 6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun ve ilgili mevzuat 
              çerçevesinde faaliyet göstermektedir.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">2. Hizmet Sağlayıcı Bilgileri</h2>
            <div className="bg-neutral-50 rounded-2xl p-6 text-sm space-y-1">
              <p><strong>Ticari Unvan:</strong> Lesya Studio</p>
              <p><strong>Web Sitesi:</strong> lesyastudio.com</p>
              <p><strong>E-posta:</strong> info@lesyastudio.com</p>
              <p><strong>Faaliyet Alanı:</strong> Kadın giyim e-ticaret</p>
            </div>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">3. Ürün ve Fiyat Bilgileri</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Sitede yer alan ürün fiyatları <strong>KDV dahil</strong> olarak gösterilmektedir.</li>
              <li>Kargo ücreti, sipariş toplamının 500 TL altında olması durumunda 30 TL&apos;dir. 500 TL ve üzeri siparişlerde kargo ücretsizdir.</li>
              <li>Ürün fiyatları önceden bildirimde bulunmaksızın değiştirilebilir. Sipariş anındaki fiyat geçerlidir.</li>
              <li>Sistemsel hatalardan kaynaklanan bariz fiyat yanlışlıkları bağlayıcı değildir.</li>
              <li>Ürün görselleri temsilidir; renk ve görünümde monitör ayarlarına bağlı farklılıklar olabilir.</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">4. Sipariş ve Ödeme</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Siparişler, ödemenin onaylanmasıyla kesinleşir.</li>
              <li>Ödeme işlemleri, PCI DSS sertifikalı ödeme kuruluşu <strong>iyzico</strong> aracılığıyla güvenli şekilde gerçekleştirilir.</li>
              <li>Kredi kartı ve banka kartı bilgileriniz tarafımızca saklanmaz.</li>
              <li>Siparişin onaylanması, ürünün stokta bulunmasına bağlıdır.</li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">5. Teslimat</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Siparişler, ödeme onayından sonra en geç <strong>3 iş günü</strong> içinde kargoya teslim edilir.</li>
              <li>Tahmini teslimat süresi, kargoya verilme tarihinden itibaren <strong>1-5 iş günüdür</strong> (bulunduğunuz bölgeye göre değişebilir).</li>
              <li>Teslimat, belirtilen adrese yapılır. Adres bilgisindeki hatalardan kaynaklanan gecikmelerden sorumluluk kabul edilmez.</li>
              <li>Kargo takip numarası, sipariş kargoya verildiğinde e-posta ile bildirilir.</li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">6. Fikri Mülkiyet Hakları</h2>
            <p>
              Site üzerindeki tüm içerikler (tasarımlar, logolar, metinler, görseller, yazılım kodları) 
              Lesya Studio&apos;nun fikri mülkiyetindedir veya lisansı altındadır. Bu içerikler, önceden yazılı izin 
              alınmaksızın kopyalanamaz, çoğaltılamaz, dağıtılamaz veya ticari amaçla kullanılamaz.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">7. Sorumluluk Sınırı</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Site, &quot;olduğu gibi&quot; sunulmaktadır. Teknik aksaklıklar, bakım çalışmaları veya mücbir sebepler nedeniyle geçici olarak erişilemeyebilir.</li>
              <li>Kullanıcının, site üzerinden üçüncü taraf sitelere yönlendiren bağlantılara tıklaması halinde, bu sitelerin içeriğinden Lesya Studio sorumlu değildir.</li>
              <li>Hatalı veya eksik bilgi girişinden kaynaklanan sorunlardan kullanıcı sorumludur.</li>
            </ul>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">8. Uyuşmazlık Çözümü</h2>
            <p>
              Bu koşullardan doğabilecek uyuşmazlıklarda, 6502 sayılı Tüketicinin Korunması Hakkında 
              Kanun kapsamında <strong>Tüketici Hakem Heyetleri</strong> ve <strong>Tüketici Mahkemeleri</strong> yetkilidir.
            </p>
            <p className="mt-3 text-xs text-neutral-400">
              Başvuru limitleri, her yıl Ticaret Bakanlığı tarafından güncellenmektedir. 
              Güncel limitler için <strong>tuketici.ticaret.gov.tr</strong> adresini ziyaret edebilirsiniz.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">9. Değişiklikler</h2>
            <p>
              Bu kullanım koşulları, yasal düzenlemelerdeki değişiklikler doğrultusunda güncellenebilir. 
              Güncel versiyon her zaman bu sayfada yayınlanır.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
