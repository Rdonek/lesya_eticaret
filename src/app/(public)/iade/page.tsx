import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "İade & İptal Politikası | Lesya",
  description: "Lesya Studio iade ve iptal koşulları, cayma hakkı bilgilendirmesi.",
};

export default function ReturnPolicyPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <header className="mb-16">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-4">Yasal</p>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-neutral-900">
            İade & İptal Politikası
          </h1>
          <p className="text-xs text-neutral-400 mt-4">Son güncelleme: 11 Şubat 2026</p>
        </header>

        <div className="prose prose-neutral prose-sm max-w-none space-y-12 text-neutral-600 leading-relaxed">

          {/* 1 */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">1. Cayma Hakkı</h2>
            <p>
              6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca, 
              mesafeli sözleşmelerden <strong>14 (on dört) gün</strong> içinde herhangi bir gerekçe göstermeksizin 
              ve cezai şart ödemeksizin cayma hakkına sahipsiniz.
            </p>
            <div className="bg-neutral-50 rounded-2xl p-6 mt-4 text-sm">
              <p className="font-bold text-neutral-900 mb-2">Süre Başlangıcı</p>
              <p>
                14 günlük cayma hakkı süresi, ürünün tarafınıza veya gösterdiğiniz üçüncü kişiye teslim 
                edildiği günden itibaren başlar. Sözleşmenin kurulmasından ürünün teslimine kadar geçen 
                süre içinde de cayma hakkınızı kullanabilirsiniz.
              </p>
            </div>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">2. Cayma Hakkının Kullanımı</h2>
            <p>Cayma hakkınızı kullanmak için aşağıdaki adımları izleyebilirsiniz:</p>
            <div className="space-y-4 mt-4">
              <div className="flex gap-4 items-start">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white text-xs font-bold">1</span>
                <div>
                  <p className="font-bold text-neutral-900">Bildirim</p>
                  <p className="text-sm">Cayma kararınızı <strong>info@lesyastudio.com</strong> adresine e-posta göndererek veya WhatsApp hattımıza yazarak bildiriniz.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white text-xs font-bold">2</span>
                <div>
                  <p className="font-bold text-neutral-900">Ürünü Hazırlayın</p>
                  <p className="text-sm">Ürünü, orijinal ambalajında, kullanılmamış ve etiketleri sökülmemiş şekilde hazırlayın.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white text-xs font-bold">3</span>
                <div>
                  <p className="font-bold text-neutral-900">Kargo ile Gönderin</p>
                  <p className="text-sm">Cayma bildiriminizi yönelttiğiniz tarihten itibaren <strong>10 gün</strong> içinde ürünü tarafımıza iade edin.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white text-xs font-bold">4</span>
                <div>
                  <p className="font-bold text-neutral-900">Geri Ödeme</p>
                  <p className="text-sm">Cayma bildiriminin tarafımıza ulaşmasından itibaren <strong>14 gün</strong> içinde ödemeniz iade edilir.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">3. İade Koşulları</h2>
            <p>İadenin kabul edilebilmesi için ürünün aşağıdaki şartları taşıması gerekmektedir:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Ürün <strong>kullanılmamış</strong> ve <strong>denenmemiş</strong> olmalıdır</li>
              <li>Orijinal ambalajı, etiketi ve varsa koruyucu aksesuarları eksiksiz olmalıdır</li>
              <li>Ürünle birlikte gönderilen fatura veya teslimat belgesi iade paketine eklenmelidir</li>
              <li>Ürün, tarafınıza teslim edildiği durumuyla aynı durumda olmalıdır</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">4. Cayma Hakkının İstisnaları</h2>
            <p>
              Mesafeli Sözleşmeler Yönetmeliği gereğince, aşağıdaki durumlarda cayma hakkı kullanılamaz:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Tüketicinin istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan ürünler (özel dikim, kişiye özel tasarım)</li>
              <li>Tesliminden sonra ambalaj, bant, mühür, paket gibi koruyucu unsurları açılmış olan ve iadesi <strong>sağlık ve hijyen açısından uygun olmayan</strong> ürünler (iç giyim, mayo, bikini vb.)</li>
              <li>Tesliminden sonra başka ürünlerle karışan ve doğası gereği ayrıştırılması mümkün olmayan ürünler</li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">5. Geri Ödeme</h2>
            <p>İade onaylandıktan sonra:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Ödemeniz, cayma bildiriminin bize ulaşmasından itibaren en geç <strong>14 gün</strong> içinde iade edilir</li>
              <li>İade, ödemenin yapıldığı yöntemle (kredi kartı, banka kartı) gerçekleştirilir</li>
              <li>Kredi kartına yapılan iadelerin hesabınıza yansıma süresi bankanıza göre değişiklik gösterebilir</li>
              <li>Teslimat masrafları, standart teslimat ücretini aşan kısmı hariç iade edilir</li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">6. Kargo Masrafları</h2>
            <p>
              Cayma hakkının kullanılması durumunda iade kargo masrafı, tarafımızca belirlenecek anlaşmalı 
              kargo firması aracılığıyla gönderilmesi halinde tarafımıza aittir. Farklı bir kargo firması 
              tercih edilmesi durumunda iade kargo bedeli tüketiciye ait olacaktır.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">7. Ayıplı Ürün</h2>
            <p>
              Teslim aldığınız ürünün ayıplı (kusurlu, hasarlı, eksik) olması durumunda, 6502 sayılı Kanun 
              kapsamında <strong>onarım, ürün değişimi, bedel iadesi veya ayıp oranında indirim</strong> talep 
              etme haklarınız saklıdır. Ayıplı ürünlerde iade kargo masrafı tarafımıza aittir.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">8. İletişim</h2>
            <div className="bg-neutral-50 rounded-2xl p-6 text-sm space-y-1">
              <p><strong>E-posta:</strong> info@lesyastudio.com</p>
              <p><strong>Web:</strong> lesyastudio.com</p>
              <p className="text-neutral-400 mt-2">İade talepleriniz en geç 3 iş günü içinde yanıtlanır.</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
