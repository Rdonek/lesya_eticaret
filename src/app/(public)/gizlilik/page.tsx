import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gizlilik Politikası & KVKK | Lesya",
  description: "Lesya Studio kişisel verilerin korunması ve gizlilik politikası.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <header className="mb-16">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-4">Yasal</p>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-neutral-900">
            Gizlilik Politikası
          </h1>
          <p className="text-xs text-neutral-400 mt-4">Son güncelleme: 11 Şubat 2026</p>
        </header>

        <div className="prose prose-neutral prose-sm max-w-none space-y-12 text-neutral-600 leading-relaxed">

          {/* 1 */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">1. Veri Sorumlusu</h2>
            <p>
              6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) kapsamında veri sorumlusu sıfatıyla hareket eden:
            </p>
            <div className="bg-neutral-50 rounded-2xl p-6 mt-4 text-sm space-y-1">
              <p><strong>Ticari Unvan:</strong> Lesya Studio</p>
              <p><strong>Web Sitesi:</strong> lesyastudio.com</p>
              <p><strong>E-posta:</strong> info@lesyastudio.com</p>
            </div>
            <p className="mt-4">
              tarafından kişisel verileriniz aşağıda açıklanan amaçlar ve hukuki sebepler doğrultusunda işlenmektedir.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">2. Toplanan Kişisel Veriler</h2>
            <p>Sitemiz üzerinden aşağıdaki kişisel veriler toplanmaktadır:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Kimlik Bilgileri:</strong> Ad, soyad</li>
              <li><strong>İletişim Bilgileri:</strong> E-posta adresi, telefon numarası, teslimat adresi, şehir, posta kodu</li>
              <li><strong>İşlem Bilgileri:</strong> Sipariş detayları, ödeme durumu, takip numarası</li>
              <li><strong>Dijital İz Bilgileri:</strong> IP adresi, tarayıcı türü, ziyaret edilen sayfalar, çerezler</li>
            </ul>
            <p className="mt-3 text-xs text-neutral-400">
              Not: Kredi kartı ve banka kartı bilgileriniz tarafımızca saklanmamaktadır. Ödeme işlemleri, 
              PCI DSS sertifikalı ödeme kuruluşu iyzico tarafından güvenli şekilde işlenmektedir.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">3. Kişisel Verilerin İşlenme Amaçları</h2>
            <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Siparişlerinizin oluşturulması, işlenmesi ve teslimatının sağlanması</li>
              <li>Ödeme işlemlerinin güvenli şekilde gerçekleştirilmesi</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi (fatura düzenleme, vergi mevzuatı)</li>
              <li>Müşteri hizmetleri ve destek taleplerinin karşılanması</li>
              <li>Sipariş durumunuz hakkında bilgilendirme yapılması</li>
              <li>Hukuki uyuşmazlıkların çözümü ve yasal hakların korunması</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">4. Hukuki Sebepler</h2>
            <p>Kişisel verileriniz, KVKK madde 5/2 kapsamında aşağıdaki hukuki sebeplere dayanılarak işlenmektedir:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Sözleşmenin ifası:</strong> Sipariş ve teslimat süreçlerinin yürütülmesi</li>
              <li><strong>Yasal yükümlülük:</strong> Vergi mevzuatı, e-ticaret düzenlemeleri, tüketici hakları mevzuatı</li>
              <li><strong>Meşru menfaat:</strong> Hizmet kalitesinin artırılması, güvenlik önlemleri</li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">5. Kişisel Verilerin Aktarımı</h2>
            <p>Kişisel verileriniz, yukarıda belirtilen amaçların gerçekleştirilmesi doğrultusunda ve KVKK&apos;nın 8. ve 9. maddelerine uygun olarak aşağıdaki taraflara aktarılabilmektedir:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Ödeme kuruluşları:</strong> iyzico (ödeme işlemlerinin güvenli şekilde gerçekleştirilmesi)</li>
              <li><strong>Kargo şirketleri:</strong> Siparişlerinizin teslimatı için</li>
              <li><strong>Altyapı sağlayıcıları:</strong> Supabase (veritabanı), Vercel (hosting) — veri güvenliği sözleşmeleri kapsamında</li>
              <li><strong>Yetkili kamu kurum ve kuruluşları:</strong> Yasal zorunluluk hallerinde</li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">6. Veri Saklama Süresi</h2>
            <p>
              Kişisel verileriniz, işlenme amaçlarının gerektirdiği süre boyunca ve ilgili mevzuatta öngörülen 
              zamanaşımı süreleri boyunca saklanmaktadır:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Sipariş ve fatura bilgileri:</strong> 10 yıl (Vergi Usul Kanunu md. 253)</li>
              <li><strong>E-ticaret kayıtları:</strong> 3 yıl (6563 sayılı Kanun)</li>
              <li><strong>Çerez verileri:</strong> Maksimum 2 yıl</li>
            </ul>
            <p className="mt-3">
              Saklama süresi sona eren veriler, KVKK&apos;ya uygun şekilde silinir, yok edilir veya anonim hale getirilir.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">7. Çerez Politikası</h2>
            <p>
              Sitemizde oturum çerezleri ve tercih çerezleri kullanılmaktadır. Bu çerezler, alışveriş deneyiminizi 
              iyileştirmek ve sitenin düzgün çalışmasını sağlamak amacıyla kullanılır. Tarayıcı ayarlarınızdan 
              çerezleri kapatabilirsiniz; ancak bu durumda bazı site özellikleri düzgün çalışmayabilir.
            </p>
          </section>

          {/* 8 - KVKK Haklar */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">8. KVKK Kapsamında Haklarınız</h2>
            <p className="mb-3">KVKK&apos;nın 11. maddesi gereğince aşağıdaki haklara sahipsiniz:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
              <li>Kişisel verilerinizin işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
              <li>Eksik veya yanlış işlenmiş olması hâlinde düzeltilmesini isteme</li>
              <li>KVKK madde 7&apos;deki şartlar çerçevesinde silinmesini veya yok edilmesini isteme</li>
              <li>Düzeltme ve silme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
              <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonuç ortaya çıkmasına itiraz etme</li>
              <li>Kanuna aykırı işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
            </ul>
            <div className="bg-neutral-50 rounded-2xl p-6 mt-6 text-sm">
              <p className="font-bold text-neutral-900 mb-2">Başvuru Yöntemi</p>
              <p>
                Yukarıdaki haklarınıza ilişkin taleplerinizi, kimliğinizi tespit edici belgelerle birlikte 
                <strong> info@lesyastudio.com</strong> adresine iletebilirsiniz. Başvurularınız en geç 30 gün 
                içinde sonuçlandırılacaktır.
              </p>
            </div>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">9. Değişiklikler</h2>
            <p>
              Bu gizlilik politikası, yasal düzenlemelerdeki değişiklikler veya hizmetlerimizdeki güncellemeler 
              doğrultusunda revize edilebilir. Güncel versiyon her zaman bu sayfada yayınlanır.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
