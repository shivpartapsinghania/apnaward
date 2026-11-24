import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Crosshair, MapPin, AlertCircle } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

interface LocationPickerMapProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
  wardCenterLat: number;
  wardCenterLng: number;
}

export function LocationPickerMap({
  latitude,
  longitude,
  onChange,
  wardCenterLat,
  wardCenterLng,
}: LocationPickerMapProps) {
  const { language } = useTranslation();
  const isHi = language === 'hi';
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);
  const [tileError, setTileError] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [latitude, longitude],
      zoom: 15,
      zoomControl: true,
      attributionControl: true,
    });

    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    });

    let errorCount = 0;
    tileLayer.on('tileerror', () => {
      errorCount += 1;
      if (errorCount >= 3) {
        setTileError(true);
      }
    });
    tileLayer.on('tileload', () => {
      setTileError(false);
    });

    tileLayer.addTo(map);

    const marker = L.circleMarker([latitude, longitude], {
      radius: 9,
      color: '#0B1B36',
      weight: 3,
      fillColor: '#1D4ED8',
      fillOpacity: 0.9,
    }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      const nextLat = Number(e.latlng.lat.toFixed(5));
      const nextLng = Number(e.latlng.lng.toFixed(5));
      marker.setLatLng([nextLat, nextLng]);
      onChange(nextLat, nextLng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    const resizeTimer = window.setTimeout(() => {
      map.invalidateSize();
    }, 240);

    const observer =
      typeof ResizeObserver !== 'undefined' && containerRef.current
        ? new ResizeObserver(() => map.invalidateSize())
        : null;
    if (observer && containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      window.clearTimeout(resizeTimer);
      observer?.disconnect();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // Initialize once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (markerRef.current && mapRef.current) {
      markerRef.current.setLatLng([latitude, longitude]);
      mapRef.current.panTo([latitude, longitude], { animate: true });
    }
  }, [latitude, longitude]);

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <MapPin className="w-3.5 h-3.5 text-blue-700 shrink-0" aria-hidden="true" />
          <span>
            {isHi
              ? 'मानचित्र पर कहीं भी टैप करके नमूना स्थान पिन करें'
              : 'Click anywhere on the map to set illustrative pin coordinates'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onChange(wardCenterLat, wardCenterLng)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100 transition-colors min-h-[38px] whitespace-nowrap shrink-0"
        >
          <Crosshair className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{isHi ? 'वार्ड केंद्र पर लाएं' : 'Center on Ward'}</span>
        </button>
      </div>

      {tileError ? (
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" aria-hidden="true" />
            <p>
              {isHi
                ? 'मानचित्र टाइल्स लोड नहीं हो सकीं। आप नीचे अक्षांश और देशांतर सीधे दर्ज कर सकते हैं।'
                : 'Map tiles could not load in this network view. You can enter or adjust illustrative latitude and longitude coordinates directly below.'}
            </p>
          </div>
        </div>
      ) : null}

      <div
        ref={containerRef}
        className="w-full h-56 rounded-xl overflow-hidden border border-slate-200 bg-slate-100"
        aria-label={isHi ? 'इंटरैक्टिव मानचित्र स्थान चयनकर्ता' : 'Interactive Leaflet coordinate selector'}
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="picker-lat"
            className="block text-xs font-medium text-slate-600 mb-1"
          >
            {isHi ? 'अक्षांश (Latitude · डेमो ग्रिड)' : 'Latitude (Demo Grid)'}
          </label>
          <input
            id="picker-lat"
            type="number"
            step="0.0001"
            min={-90}
            max={90}
            value={latitude}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (Number.isFinite(val) && val >= -90 && val <= 90) onChange(val, longitude);
            }}
            className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs font-mono tabular-nums text-slate-900 focus:outline-none focus:border-blue-600 min-h-[40px]"
          />
        </div>
        <div>
          <label
            htmlFor="picker-lng"
            className="block text-xs font-medium text-slate-600 mb-1"
          >
            {isHi ? 'देशांतर (Longitude · डेमो ग्रिड)' : 'Longitude (Demo Grid)'}
          </label>
          <input
            id="picker-lng"
            type="number"
            step="0.0001"
            min={-180}
            max={180}
            value={longitude}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (Number.isFinite(val) && val >= -180 && val <= 180) onChange(latitude, val);
            }}
            className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs font-mono tabular-nums text-slate-900 focus:outline-none focus:border-blue-600 min-h-[40px]"
          />
        </div>
      </div>

      <p className="text-[11px] text-slate-500">
        {isHi
          ? 'मानचित्र टाइल्स: © OpenStreetMap योगदानकर्ता। निर्देशांक केवल नमूना वार्ड स्थान दर्शाते हैं।'
          : 'Map tiles: © OpenStreetMap contributors. Coordinates represent illustrative demo ward locations.'}
      </p>
    </div>
  );
}
