import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { joinBookingRoom, leaveBookingRoom, emitLocation, getSocket } from '../../hooks/useSocket';
import api from '../../utils/api';
import { Card, Loader } from '../../components/common/UI';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const truckIcon = L.divIcon({
  html: '<div style="font-size:28px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">🚛</div>',
  className: '', iconAnchor: [14, 28],
});

const pickupIcon = L.divIcon({
  html: '<div style="font-size:22px">📍</div>',
  className: '', iconAnchor: [11, 22],
});

const dropIcon = L.divIcon({
  html: '<div style="font-size:22px">🏁</div>',
  className: '', iconAnchor: [11, 22],
});

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => { if (position) map.setView(position, map.getZoom()); }, [position, map]);
  return null;
}

export default function Tracking() {
  const { bookingId } = useParams();
  const { user } = useSelector((s) => s.auth);
  const [booking, setBooking] = useState(null);
  const [driverPos, setDriverPos] = useState(null);
  const [path, setPath] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const watchRef = useRef(null);

  useEffect(() => {
    if (!bookingId) { setLoading(false); return; }

    api.get(`/bookings/${bookingId}`).then(r => {
      setBooking(r.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));

    joinBookingRoom(bookingId);

    const socket = getSocket();
    if (socket) {
      socket.on('location_update', ({ lat, lng }) => {
        setDriverPos([lat, lng]);
        setPath(p => [...p, [lat, lng]]);
      });
    }

    return () => {
      leaveBookingRoom(bookingId);
      const s = getSocket();
      if (s) s.off('location_update');
    };
  }, [bookingId]);

  // Driver: share location
  const startSharing = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported');
    setIsSharing(true);
    watchRef.current = navigator.geolocation.watchPosition(
      ({ coords }) => {
        emitLocation(bookingId, coords.latitude, coords.longitude, coords.speed || 0);
        setDriverPos([coords.latitude, coords.longitude]);
        setPath(p => [...p, [coords.latitude, coords.longitude]]);
      },
      (err) => console.error(err),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  };

  const stopSharing = () => {
    if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    setIsSharing(false);
  };

  if (loading) return <Loader size="lg" />;

  const defaultCenter = [11.0168, 76.9558]; // Coimbatore, Tamil Nadu (near user's location)
  const mapCenter = driverPos || defaultCenter;

  return (
    <div className="space-y-4 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Live Tracking</h1>
          {booking && (
            <p className="text-gray-500 text-sm mt-0.5">
              Booking #{booking.bookingNumber} · {booking.pickup?.city} → {booking.drop?.city}
            </p>
          )}
        </div>
        {/* Driver controls */}
        {user?.role === 'driver' && booking?.status === 'in_transit' && (
          <div>
            {!isSharing ? (
              <button onClick={startSharing}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                Start Sharing Location
              </button>
            ) : (
              <button onClick={stopSharing}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-white" />
                Stop Sharing
              </button>
            )}
          </div>
        )}
      </div>

      {/* Status bar */}
      {booking && (
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-dark-border px-4 py-3 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${booking.status === 'in_transit' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
            <span className="text-gray-600 dark:text-dark-muted">
              {booking.status === 'in_transit' ? 'Trip in progress' : 'Waiting for trip to start'}
            </span>
          </div>
          {booking.distance && <span className="text-gray-500">📏 {booking.distance} km</span>}
          {driverPos && <span className="text-gray-500">📍 Live: {driverPos[0].toFixed(4)}, {driverPos[1].toFixed(4)}</span>}
          {path.length > 0 && <span className="text-gray-500">🛣️ {path.length} points tracked</span>}
        </div>
      )}

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-dark-border shadow-card" style={{ height: '500px' }}>
        <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={true}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            maxZoom={19}
          />

          {/* Pickup marker */}
          {booking?.pickup?.coordinates?.lat && (
            <Marker position={[booking.pickup.coordinates.lat, booking.pickup.coordinates.lng]} icon={pickupIcon}>
              <Popup><strong>📍 Pickup</strong><br />{booking.pickup.address}</Popup>
            </Marker>
          )}

          {/* Drop marker */}
          {booking?.drop?.coordinates?.lat && (
            <Marker position={[booking.drop.coordinates.lat, booking.drop.coordinates.lng]} icon={dropIcon}>
              <Popup><strong>🏁 Drop</strong><br />{booking.drop.address}</Popup>
            </Marker>
          )}

          {/* Driver / truck marker */}
          {driverPos && (
            <>
              <Marker position={driverPos} icon={truckIcon}>
                <Popup>
                  <strong>🚛 {booking?.driver?.user?.name || 'Driver'}</strong><br />
                  <span className="text-xs text-green-600">Live Location</span>
                </Popup>
              </Marker>
              <RecenterMap position={driverPos} />
            </>
          )}

          {/* Route polyline */}
          {path.length > 1 && (
            <Polyline positions={path} color="#f97316" weight={4} opacity={0.7} />
          )}
        </MapContainer>
      </div>

      {/* Demo: No active trip */}
      {!booking && (
        <Card>
          <div className="p-8 text-center">
            <div className="text-5xl mb-3">📍</div>
            <h3 className="font-semibold text-gray-700 dark:text-dark-text mb-2">No active booking selected</h3>
            <p className="text-sm text-gray-500">Go to a booking and click "Track Live" to start tracking.</p>
          </div>
        </Card>
      )}
    </div>
  );
}
