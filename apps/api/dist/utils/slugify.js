"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = slugify;
// Simple slugify for Chinese/English text
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[\u4e00-\u9fa5]/g, (char) => {
        // Replace CJK chars with pinyin approximation - just use hex code for uniqueness
        return char.codePointAt(0)?.toString(16) || '';
    })
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50) || 'agent';
}
