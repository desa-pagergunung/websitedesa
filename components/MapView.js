import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix default marker icon Leaflet yang sering rusak di Next.js
const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// pusat default: perkiraan koordinat Desa Pagergunung, Kec. Pangandaran
// GANTI dengan koordinat asli desa (ambil dari Google Maps, klik kanan > koordinat)
const DEFAULT_CENTER = [-7.6870, 108.6530];

export default function MapView({ points = [], zoom = 14, height = 480 }) {
  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={zoom}
      className="leaflet-map-container"
      style={{ height }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((p) => (
        <Marker key={p.id} position={[p.latitude, p.longitude]} icon={defaultIcon}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{p.nama_lokasi || p.nama_usaha}</p>
              {p.kategori && <p className="text-xs text-gray-500 capitalize">{p.kategori}</p>}
              {p.deskripsi && <p className="mt-1">{p.deskripsi}</p>}
              {p.alamat && <p className="text-xs mt-1">📍 {p.alamat}</p>}
              {p.no_kontak && <p className="text-xs mt-1">📞 {p.no_kontak}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
