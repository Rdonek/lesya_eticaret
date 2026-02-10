'use server';

import { revalidatePath } from 'next/cache';

/**
 * Force clear the cache for a specific product and the catalog
 */
export async function revalidateProductAction(slug?: string) {
  try {
    revalidatePath('/urunler'); // Clear main catalog
    if (slug) {
      revalidatePath(`/urunler/${slug}`); // Clear specific product page
    }
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}
