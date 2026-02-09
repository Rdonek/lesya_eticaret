import { z } from 'zod';
import { validatePhone } from '@/lib/utils/validation';

export const checkoutSchema = z.object({
  name: z.string().min(2, 'Ad Soyad en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  phone: z.string().refine((val) => validatePhone(val), {
    message: 'Geçerli bir telefon numarası giriniz (05xxxxxxxxx)',
  }),
  address: z.string().min(10, 'Lütfen açık adresinizi tam olarak giriniz'),
  city: z.string().min(2, 'Şehir adı en az 2 karakter olmalıdır'),
  postalCode: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
