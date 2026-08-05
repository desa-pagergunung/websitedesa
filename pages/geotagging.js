import { useState } from 'react';
import dynamic from 'next/dynamic';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabaseClient';

// Leaflet butuh `window`, jadi harus di-render hanya di client (ssr: false)
const MapView = dynamic(() => import('../components/MapView'), { ssr: false });

const KATEGORI = ['semua', 'rumah_warga', 'fasilitas', 'potensi_wisata', 'batas_wilayah', 'umkm'];

export default function Geotagging({ points }) {
  const [filter, setFilter] = useState('semua');
  const filtered = filter === 'semua' ? points : points.filter((p) => p.kategori === filter);

  return (
    <Layout title="Peta Desa">
      <h1 className="text-2xl font-bold text-desa-green mb-1">Peta Desa (Geotagging)</h1>
      <p className="text-sm text-gray-500 mb-4">
        Titik lokasi hasil pemetaan proker geotagging: rumah warga, fasilitas, potensi wisata, dan batas wilayah.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {KATEGORI.map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`px-3 py-1 rounded-full text-sm border capitalize ${
              filter === k ? 'bg-desa-green text-white border-desa-green' : 'border-gray-300 text-gray-600'
            }`}
          >
            {k.replace('_', ' ')}
          </button>
        ))}
      </div>

      <MapView points={filtered} />

      <p className="text-xs text-gray-400 mt-3">
        Total titik ditampilkan: {filtered.length} dari {points.length}
      </p>
    </Layout>
  );
}

export async function getServerSideProps() {
  const { data } = await supabase
    .from('geotagging')
    .select('id, nama_lokasi, kategori, deskripsi, latitude, longitude')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null);

  return { props: { points: data || [] } };
}
