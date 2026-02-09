import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Design Constants - Minimal/Bento Style
// Updated with the new mail logo URL
const LOGO_URL = 'https://orcxwbxislabdwnldgaa.supabase.co/storage/v1/object/public/logo/mail_logo.png'; 

const COLORS = {
  bg: '#F9FAFB', // neutral-50
  card: '#FFFFFF', // white
  text: '#111827', // neutral-900
  secondary: '#6B7280', // neutral-500
  border: '#E5E7EB', // neutral-200
  success: '#059669',
  error: '#DC2626',
};

export const emailService = {
  /**
   * Shared HTML Wrapper (The "Layout")
   */
  getHtmlWrapper(content: string, previewText: string) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${previewText}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: ${COLORS.bg}; color: ${COLORS.text}; }
            .wrapper { max-width: 600px; margin: 40px auto; background-color: ${COLORS.card}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02); }
            .header { padding: 32px; text-align: center; border-bottom: 1px solid ${COLORS.border}; }
            .body { padding: 40px 32px; }
            .footer { padding: 32px; text-align: center; font-size: 12px; color: ${COLORS.secondary}; background-color: ${COLORS.bg}; border-top: 1px solid ${COLORS.border}; }
            .btn { display: inline-block; padding: 14px 32px; background-color: ${COLORS.text}; color: #ffffff !important; text-decoration: none; border-radius: 99px; font-weight: 600; font-size: 14px; margin-top: 24px; }
            .btn-outline { background-color: transparent; border: 1px solid ${COLORS.border}; color: ${COLORS.text} !important; }
            .info-box { background-color: ${COLORS.bg}; border-radius: 12px; padding: 20px; margin: 24px 0; }
            .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: ${COLORS.secondary}; font-weight: 600; margin-bottom: 4px; display: block; }
            .value { font-size: 16px; font-weight: 500; margin: 0; }
            .product-row { display: flex; align-items: center; padding: 16px 0; border-bottom: 1px solid ${COLORS.border}; }
            .product-img { width: 64px; height: 80px; object-fit: cover; border-radius: 8px; background-color: ${COLORS.bg}; margin-right: 16px; }
            h1 { margin: 0 0 16px 0; font-size: 24px; letter-spacing: -0.5px; }
            p { margin: 0 0 16px 0; line-height: 1.6; color: ${COLORS.secondary}; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="header">
              <a href="https://lesya.com">
                <img src="${LOGO_URL}" alt="LESYA" width="140" style="display: block; margin: 0 auto;">
              </a>
            </div>
            <div class="body">
              ${content}
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} LESYA. Tüm hakları saklıdır.<br>
              Sorularınız için <a href="mailto:destek@lesya.com" style="color: ${COLORS.text}">destek@lesya.com</a>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  /**
   * 1. ORDER CONFIRMATION
   */
  async sendOrderConfirmation(order: any) {
    if (!resend) return;

    const itemsHtml = order.order_items.map((item: any) => `
      <div class="product-row">
        <img src="${item.product_snapshot.image || 'https://placehold.co/64x80/eee/ccc?text=IMG'}" class="product-img" alt="Ürün">
        <div style="flex: 1;">
          <div style="font-weight: 600; font-size: 14px;">${item.product_snapshot.name}</div>
          <div style="font-size: 12px; color: ${COLORS.secondary}; margin-top: 4px;">
            ${item.product_snapshot.size ? `Beden: ${item.product_snapshot.size}` : ''} | Adet: ${item.quantity}
          </div>
          <div style="font-weight: 500; font-size: 14px; margin-top: 4px;">${item.unit_price} TL</div>
        </div>
      </div>
    `).join('');

    const content = `
      <h1>Siparişiniz Alındı! 🎉</h1>
      <p>Merhaba ${order.customer_name}, harika seçimler! Siparişiniz başarıyla oluşturuldu ve ödemeniz onaylandı. Hazırlıklara hemen başlıyoruz.</p>
      
      <div class="info-box">
        <span class="label">Sipariş Numarası</span>
        <p class="value">#${order.order_number}</p>
      </div>

      <div style="margin-top: 32px;">
        <span class="label">Sipariş Detayları</span>
        ${itemsHtml}
      </div>

      <div style="margin-top: 24px; text-align: right;">
        <span style="font-size: 14px; color: ${COLORS.secondary};">Toplam Tutar</span>
        <div style="font-size: 20px; font-weight: 700;">${order.total_amount} TL</div>
      </div>

      <div style="margin-top: 32px; border-top: 1px solid ${COLORS.border}; padding-top: 24px;">
        <span class="label">Teslimat Adresi</span>
        <p class="value" style="font-weight: 400; margin-top: 8px;">
          ${order.address_line}<br>
          ${order.city} / Türkiye
        </p>
      </div>

      <div style="text-align: center;">
        <a href="https://lesya.com/siparis/${order.id}" class="btn">Siparişi Görüntüle</a>
      </div>
    `;

    return resend.emails.send({
      from: 'LESYA <onboarding@resend.dev>',
      to: order.email,
      subject: `Sipariş Onayı: #${order.order_number}`,
      html: this.getHtmlWrapper(content, 'Siparişiniz başarıyla alındı.'),
    });
  },

  /**
   * 2. PAYMENT FAILED
   */
  async sendPaymentFailed(order: any) {
    if (!resend) return;

    const content = `
      <h1 style="color: ${COLORS.error}">Ödeme Alınamadı ⚠️</h1>
      <p>Merhaba ${order.customer_name}, sipariş işleminiz sırasında bir sorun oluştu ve ödeme alınamadı. Ancak endişelenmeyin, sepetiniz koruma altında.</p>
      
      <div class="info-box" style="border-left: 4px solid ${COLORS.error};">
        <span class="label">Sipariş Numarası</span>
        <p class="value">#${order.order_number}</p>
      </div>

      <p>Aşağıdaki butona tıklayarak ödemeyi tekrar deneyebilir veya farklı bir kart kullanabilirsiniz.</p>

      <div style="text-align: center;">
        <a href="https://lesya.com/odeme" class="btn">Ödemeyi Tekrar Dene</a>
      </div>
    `;

    return resend.emails.send({
      from: 'LESYA <onboarding@resend.dev>',
      to: order.email,
      subject: `Ödeme Hatası: #${order.order_number}`,
      html: this.getHtmlWrapper(content, 'Ödeme işleminiz tamamlanamadı.'),
    });
  },

  /**
   * 3. ORDER SHIPPED
   */
  async sendShippingUpdate(order: any) {
    if (!resend) return;

    const content = `
      <h1>Siparişiniz Yola Çıktı! 🚚</h1>
      <p>Merhaba ${order.customer_name}, beklediğin an geldi! Siparişin kargoya verildi ve sana doğru geliyor.</p>
      
      <div class="info-box">
        <span class="label">Takip Numarası</span>
        <p class="value" style="font-family: monospace; font-size: 18px;">${order.tracking_number}</p>
      </div>

      <p>Kargonun durumunu anlık olarak takip edebilirsin.</p>

      <div style="text-align: center;">
        <a href="#" class="btn">Kargomu Takip Et</a>
      </div>
    `;

    return resend.emails.send({
      from: 'LESYA <onboarding@resend.dev>',
      to: order.email,
      subject: `Kargoya Verildi: #${order.order_number}`,
      html: this.getHtmlWrapper(content, 'Siparişiniz kargoya verildi.'),
    });
  },

  /**
   * 4. ORDER DELIVERED
   */
  async sendOrderDelivered(order: any) {
    if (!resend) return;

    const content = `
      <h1 style="color: ${COLORS.success}">Teslim Edildi! 📦</h1>
      <p>Merhaba ${order.customer_name}, kargonuz teslim edilmiş görünüyor. Umarız yeni ürünlerini çok seversin!</p>
      
      <p>Eğer bir sorun varsa veya iade etmek istersen, 14 gün süren var.</p>

      <div style="text-align: center;">
        <a href="https://lesya.com/iletisim" class="btn btn-outline">Bir Sorun Mu Var?</a>
      </div>
    `;

    return resend.emails.send({
      from: 'LESYA <onboarding@resend.dev>',
      to: order.email,
      subject: `Teslim Edildi: #${order.order_number}`,
      html: this.getHtmlWrapper(content, 'Siparişiniz teslim edildi.'),
    });
  },

  /**
   * 5. ORDER CANCELLED
   */
  async sendOrderCancelled(order: any) {
    if (!resend) return;

    const content = `
      <h1>Sipariş İptali</h1>
      <p>Merhaba ${order.customer_name}, talebiniz üzerine veya stok durumu nedeniyle siparişiniz iptal edilmiştir.</p>
      
      <div class="info-box">
        <span class="label">İptal Nedeni</span>
        <p class="value">${order.cancelled_reason || 'Belirtilmedi'}</p>
      </div>

      <p>Ödemeniz bankanıza bağlı olarak 3-7 iş günü içerisinde kartınıza iade edilecektir.</p>
    `;

    return resend.emails.send({
      from: 'LESYA <onboarding@resend.dev>',
      to: order.email,
      subject: `Sipariş İptali: #${order.order_number}`,
      html: this.getHtmlWrapper(content, 'Siparişiniz iptal edildi.'),
    });
  }
};
