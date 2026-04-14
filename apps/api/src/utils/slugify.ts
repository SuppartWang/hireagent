// Simple slugify for Chinese/English text
export default function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u4e00-\u9fa5]/g, (char) => {
      // Replace CJK chars with pinyin approximation - just use hex code for uniqueness
      return char.codePointAt(0)?.toString(16) || ''
    })
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50) || 'agent'
}
