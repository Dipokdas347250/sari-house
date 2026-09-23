import Image, { type ImageProps } from 'next/image'

/**
 * next/image এর মোড়ক।
 * ডেমো ছবিগুলো SVG — সেগুলো অপটিমাইজ না করে সরাসরি দেখানো হয়।
 * দোকান থেকে আপলোড করা jpg/png/webp স্বাভাবিকভাবেই অপটিমাইজ হবে।
 */
export function SmartImage({ src, alt, ...rest }: ImageProps) {
  const isSvg = typeof src === 'string' && src.toLowerCase().endsWith('.svg')
  return <Image src={src} alt={alt} unoptimized={isSvg} {...rest} />
}

/** ছবি না থাকলে দেখানোর জন্য ফলব্যাক */
export const NO_IMAGE = '/seed/fabric-jamdani-diamond.svg'

export function firstImage(images: string[] | undefined): string {
  return images?.[0] || NO_IMAGE
}
