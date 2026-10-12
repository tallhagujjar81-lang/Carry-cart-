import React, { useState } from 'react';
import { Product } from '../types.ts';
import { Package } from 'lucide-react';

export function formatPKR(amount: number): string {
  const rounded = Math.round(Number(amount) || 0);
  return `PKR ${rounded.toLocaleString('en-PK')}`;
}

export function getEffectivePrice(product: Product): number {
  if (
    product.discountedPrice !== null &&
    product.discountedPrice > 0 &&
    product.discountedPrice < product.price
  ) {
    return product.discountedPrice;
  }
  return product.price;
}

export function getDiscountPercentage(product: Product): number {
  if (
    product.discountedPrice !== null &&
    product.discountedPrice > 0 &&
    product.discountedPrice < product.price
  ) {
    return Math.round(((product.price - product.discountedPrice) / product.price) * 100);
  }
  return 0;
}

export function buildWhatsAppInquiryUrl(
  baseWhatsappLink: string,
  product?: Product,
  selectedVariations?: Record<string, string>
): string {
  const baseUrl = baseWhatsappLink || 'https://wa.me/966501701709';
  const cleanBase = baseUrl.split('?')[0];

  if (!product) {
    const generalMsg =
      'Assalam-o-Alaikum CARRY CART Support! I have a question regarding products and delivery in Pakistan.';
    return `${cleanBase}?text=${encodeURIComponent(generalMsg)}`;
  }

  const effectivePrice = getEffectivePrice(product);
  const productUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?product=${encodeURIComponent(product.slug)}`
      : `https://carrycart.pk/?product=${encodeURIComponent(product.slug)}`;

  const variationText =
    selectedVariations && Object.keys(selectedVariations).length > 0
      ? `\nSelected Options: ${Object.entries(selectedVariations)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ')}`
      : '';

  const message = `Assalam-o-Alaikum CARRY CART! I would like to inquire about this product:\n\nProduct: ${product.name}\nSKU: ${product.sku}\nPrice: ${formatPKR(effectivePrice)}${variationText}\nProduct Link: ${productUrl}`;

  return `${cleanBase}?text=${encodeURIComponent(message)}`;
}

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  itemTitle?: string;
}

export const SafeProductImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  itemTitle,
}) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-neutral-100 text-neutral-600 p-6 text-center select-none ${className}`}
      >
        <Package className="w-10 h-10 text-red-600 mb-2 stroke-[1.5]" />
        <span className="text-xs font-semibold tracking-tight text-neutral-900 line-clamp-2">
          {itemTitle || alt}
        </span>
        <span className="text-[11px] text-neutral-500 mt-1">CARRY CART STUDIO</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
