// Foto sementara dari Picsum Photos (gratis, bebas lisensi, tanpa perlu atribusi wajib)
// khusus supaya tampilan tidak kosong sebelum foto asli Desa Pagergunung diunggah ke Supabase.
// Ganti dengan URL foto asli (upload lewat Supabase Storage) begitu tersedia.
// Dokumentasi: https://picsum.photos

// export function placeholderImage(seed, width = 800, height = 600) {
//   return `https://picsum.photos/seed/${seed}/${width}/${height}`;
// }

// export function placeholderImage(filename) {
//   return `/images/${filename}`;
// }

export function placeholderImage(name, w, h) {
  return `/images/${name}.jpg`;
}
