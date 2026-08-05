import { useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabaseClient';

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);
}

export default function Keuangan({ data }) {
  const tahunList = useMemo(() => [...new Set(data.map((d) => d.tahun_anggaran))].sort((a, b) => b - a), [data]);
  const [tahun, setTahun] = useState(tahunList[0]);

  const filtered = data.filter((d) => d.tahun_anggaran === tahun);
  const pendapatan = filtered.filter((d) => d.kategori === 'pendapatan');
  const belanja = filtered.filter((d) => d.kategori === 'belanja');
  const totalPendapatan = pendapatan.reduce((sum, d) => sum + Number(d.jumlah), 0);
  const totalBelanja = belanja.reduce((sum, d) => sum + Number(d.jumlah), 0);

  return (
    <Layout title="Keuangan Desa">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-desa-green">Transparansi Keuangan Desa (APBDes)</h1>
        {tahunList.length > 0 && (
          <select
            value={tahun}
            onChange={(e) => setTahun(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            {tahunList.map((t) => (
              <option key={t} value={t}>Tahun Anggaran {t}</option>
            ))}
          </select>
        )}
      </div>

      {filtered.length ? (
        <>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-desa-green/10">
              <p className="text-xs text-gray-500">Total Pendapatan</p>
              <p className="text-2xl font-bold text-desa-leaf">{formatRupiah(totalPendapatan)}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-desa-green/10">
              <p className="text-xs text-gray-500">Total Belanja</p>
              <p className="text-2xl font-bold text-desa-soil">{formatRupiah(totalBelanja)}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-desa-green/10">
              <h2 className="font-semibold text-desa-green mb-3">Rincian Pendapatan</h2>
              <ul className="text-sm divide-y">
                {pendapatan.map((d) => (
                  <li key={d.id} className="py-2 flex justify-between">
                    <span>{d.sub_kategori}</span>
                    <span className="font-medium">{formatRupiah(d.jumlah)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-desa-green/10">
              <h2 className="font-semibold text-desa-green mb-3">Rincian Belanja</h2>
              <ul className="text-sm divide-y">
                {belanja.map((d) => (
                  <li key={d.id} className="py-2 flex justify-between">
                    <span>{d.sub_kategori}</span>
                    <span className="font-medium">{formatRupiah(d.jumlah)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      ) : (
        <p className="text-gray-500 text-sm">Data keuangan belum tersedia untuk tahun ini.</p>
      )}
    </Layout>
  );
}

export async function getServerSideProps() {
  const { data } = await supabase.from('keuangan_desa').select('*').order('tahun_anggaran', { ascending: false });
  return { props: { data: data || [] } };
}
