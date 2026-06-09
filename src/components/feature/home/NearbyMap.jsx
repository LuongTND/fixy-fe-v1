"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Tag } from "antd";
import { workerProfileApi } from "@/apis/worker-profile.api";
import { getDistance } from "@/utils/helpers";

const GOONG_JS_URL =
  "https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.js";
const GOONG_CSS_URL =
  "https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.css";

// Default coordinate: Palmier Hotel, 305 Trần Hưng Đạo, Đà Nẵng
const DEFAULT_COORDS = { lat: 16.0749787, lng: 108.2290198 };

const MOCK_NEAREST_WORKERS = [
  {
    id: 1,
    name: "Nguyễn Văn Hùng",
    specialty: "Điện Nước",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAKTEKb_b7m_T5pAI0OVE6QTu3x2OjqY44gWmtIPK_57uOLt-DecKWtexdfiTcsO87ajMLDc5FJ1t8bcMwgr6EPVhkeJHMbM87olYnvfnQ6GguEWA1eqsOp-lgb-HK-njGhAXOvEJLMUQap-f7PlJdpDKqq6axdMC_guPylRfekmvqJ4kiyoHX32zPRZwT5k2yZd0eFchm2LsNHLbiitKE6azsXqGfUDqIwCaiZRmA2esidjqBikdZaGdmKvk3Ssce_DVpbGQFlPI9D",
    lat: 16.078,
    lng: 108.232,
    distance: 1.2,
  },
  {
    id: 2,
    name: "Lê Thị Mai",
    specialty: "Điện Lạnh",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDgOxCPjHbIo1Qn2KGVb29Hid6soAQzHUR2-wspNlPcsSLB_6PryNDyPMez-LZ55y7F-c77A1LRRsEPdq6WWp5HT_vk_N2empDljgVQ_UHasuVPopdsBWG6V5an2L6kEmew-1Fyk_hoCMz1djJwr9QZmEwQahjCjLScGFu_WShrF4NZf13H8Kv3VB0w5JHIljSuIGuaysii9WStWYANIL4e7jEes7gDFa2lkE4SZhf2jynoHKGULdF72bnv8h2ABftirQS7iZ_ub0g3",
    lat: 16.071,
    lng: 108.224,
    distance: 2.5,
  },
];

export function NearbyMap() {
  const router = useRouter();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const [userLocation, setUserLocation] = useState(DEFAULT_COORDS);
  const [nearestWorkers, setNearestWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [onlineCount, setOnlineCount] = useState(42);
  const [mapLoading, setMapLoading] = useState(true);

  // 1. Get current geolocation on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          console.log(
            "Geolocation permission denied/failed. Using Đà Nẵng fallback.",
          );
        },
        { enableHighAccuracy: true, timeout: 5000 },
      );
    }
  }, []);

  // 2. Fetch workers and compute distance
  useEffect(() => {
    let alive = true;

    async function loadNearbyWorkers() {
      try {
        const response = await workerProfileApi.search({
          CustomerLat: userLocation.lat,
          CustomerLng: userLocation.lng,
          SortBy: "nearest",
          RadiusKm: 50,
          PageSize: 10,
        });
        if (!alive) return;

        const items = Array.isArray(response)
          ? response
          : response?.items || response?.data?.items || [];

        if (items.length > 0) {
          const mapped = items.map((w) => {
            const primaryService =
              w.services?.find((s) => s.isPrimary) || w.services?.[0];
            const specialtyName =
              primaryService?.categoryName || "Kỹ thuật viên";
            const avatar = w.portfolioImages?.[0]?.fileUrl || "";

            const lat = Number(w.address?.lat);
            const lng = Number(w.address?.lng);

            // Assign a small random coordinate offset around user if address coords are absent/0
            const hasCoords =
              !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
            const finalLat = hasCoords
              ? lat
              : userLocation.lat + (Math.random() - 0.5) * 0.02;
            const finalLng = hasCoords
              ? lng
              : userLocation.lng + (Math.random() - 0.5) * 0.02;

            const dist = getDistance(
              userLocation.lat,
              userLocation.lng,
              finalLat,
              finalLng,
            );

            return {
              id: w.userId || w.id,
              name: w.fullName || "Kỹ thuật viên",
              specialty: specialtyName,
              avatar,
              lat: finalLat,
              lng: finalLng,
              distance: dist,
            };
          });

          // Sort by distance and take top 3
          const sorted = mapped
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 3);
          setNearestWorkers(sorted);
          setSelectedWorker(sorted[0]);
          setOnlineCount(items.length + 5);
        } else {
          // If no workers returned from backend, use fallback mock
          const mocked = MOCK_NEAREST_WORKERS.map((w) => {
            const dist = getDistance(
              userLocation.lat,
              userLocation.lng,
              w.lat,
              w.lng,
            );
            return { ...w, distance: dist };
          }).sort((a, b) => a.distance - b.distance);
          setNearestWorkers(mocked);
          setSelectedWorker(mocked[0]);
        }
      } catch (err) {
        console.error("Failed to load nearby workers:", err);
        if (alive) {
          const mocked = MOCK_NEAREST_WORKERS.map((w) => {
            const dist = getDistance(
              userLocation.lat,
              userLocation.lng,
              w.lat,
              w.lng,
            );
            return { ...w, distance: dist };
          }).sort((a, b) => a.distance - b.distance);
          setNearestWorkers(mocked);
          setSelectedWorker(mocked[0]);
        }
      }
    }

    loadNearbyWorkers();

    return () => {
      alive = false;
    };
  }, [userLocation]);

  // 3. Initialize Goong Map and draw markers
  useEffect(() => {
    let cancelled = false;

    const ensureGoongAssets = () =>
      new Promise((resolve, reject) => {
        if (window.goongjs) {
          resolve(window.goongjs);
          return;
        }

        if (!document.querySelector(`link[href="${GOONG_CSS_URL}"]`)) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = GOONG_CSS_URL;
          document.head.appendChild(link);
        }

        const existingScript = document.querySelector(
          `script[src="${GOONG_JS_URL}"]`,
        );
        if (existingScript) {
          existingScript.addEventListener(
            "load",
            () => resolve(window.goongjs),
            { once: true },
          );
          existingScript.addEventListener("error", reject, { once: true });
          return;
        }

        const script = document.createElement("script");
        script.src = GOONG_JS_URL;
        script.async = true;
        script.onload = () => resolve(window.goongjs);
        script.onerror = reject;
        document.body.appendChild(script);
      });

    async function initMap() {
      if (!mapContainerRef.current) return;

      const configResponse = await fetch("/api/goong/map-config");
      const config = await configResponse.json();

      if (cancelled || !config.maptilesKey || !mapContainerRef.current) return;

      const [goongjs, styleResponse] = await Promise.all([
        ensureGoongAssets(),
        fetch(
          `https://tiles.goong.io/assets/goong_map_web.json?api_key=${config.maptilesKey}`,
        )
          .then((res) => res.json())
          .catch(() => null),
      ]);

      if (cancelled || !goongjs || !mapContainerRef.current) return;

      // Clear existing map instance if any
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      goongjs.accessToken = config.maptilesKey;

      let mapStyle = `https://tiles.goong.io/assets/goong_map_web.json?api_key=${config.maptilesKey}`;
      if (styleResponse && Array.isArray(styleResponse.layers)) {
        styleResponse.layers = styleResponse.layers.filter(
          (layer) => layer.id !== "poi-tree",
        );
        mapStyle = styleResponse;
      }

      const map = new goongjs.Map({
        container: mapContainerRef.current,
        style: mapStyle,
        center: [userLocation.lng, userLocation.lat],
        zoom: 13.5,
      });

      mapRef.current = map;

      // Silence missing image warnings
      map.on("styleimagemissing", () => {});

      map.on("load", () => {
        if (!cancelled) setMapLoading(false);
      });

      // Cleanup marker refs
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // Add user marker
      const userEl = document.createElement("div");
      userEl.className = "booking-map-marker";
      userEl.innerHTML = `
        <div class="booking-map-marker__bubble booking-map-marker__bubble--destination">
          <span class="material-symbols-outlined booking-map-marker__icon">home</span>
        </div>
        <div class="booking-map-marker__caption">Bạn</div>
      `;

      const userMarker = new goongjs.Marker({ element: userEl })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map);

      markersRef.current.push(userMarker);

      // Add worker markers
      nearestWorkers.forEach((w) => {
        const workerEl = document.createElement("div");
        workerEl.className = "booking-map-marker";
        workerEl.innerHTML = `
          <div class="booking-map-marker__bubble booking-map-marker__bubble--worker">
            ${
              w.avatar
                ? `<img class="booking-map-marker__image" src="${w.avatar}" alt="" />`
                : `<span class="material-symbols-outlined booking-map-marker__icon">engineering</span>`
            }
          </div>
          <div class="booking-map-marker__caption">${w.name}</div>
        `;

        const marker = new goongjs.Marker({ element: workerEl })
          .setLngLat([w.lng, w.lat])
          .addTo(map);

        workerEl.addEventListener("click", () => {
          setSelectedWorker(w);
          map.flyTo({ center: [w.lng, w.lat], zoom: 14 });
        });

        markersRef.current.push(marker);
      });
    }

    initMap().catch((err) => {
      console.error("Goong Map initialization error:", err);
    });

    return () => {
      cancelled = true;
      markersRef.current.forEach((m) => m.remove());
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [userLocation, nearestWorkers]);

  return (
    <div className="nearby-sidebar hidden lg:flex">
      <Card
        className="sidebar-map"
        title={<span className="sidebar-map-title">Thợ Gần Bạn</span>}
        extra={
          <Tag className="sidebar-map-online">{onlineCount} người online</Tag>
        }
      >
        <div
          className="sidebar-map-body"
          style={{ position: "relative", overflow: "hidden" }}
        >
          {mapLoading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(255,255,255,0.8)",
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Montserrat, sans-serif",
                fontSize: "14px",
                color: "var(--color-text-muted)",
              }}
            >
              Đang tải bản đồ...
            </div>
          )}

          {/* Map Canvas */}
          <div
            ref={mapContainerRef}
            style={{ width: "100%", height: "100%" }}
          />

          {selectedWorker && (
            <div
              className="glass-card nearby-pro-card cursor-pointer"
              onClick={() => router.push(`/worker/${selectedWorker.id}`)}
              style={{ zIndex: 5 }}
            >
              <div className="nearby-pro-row">
                <div className="nearby-pro-icon">
                  <span className="material-symbols-outlined">bolt</span>
                </div>
                <div>
                  <p className="nearby-pro-title">
                    Thợ {selectedWorker.specialty} - {selectedWorker.name}
                  </p>
                  <p className="nearby-pro-status">
                    Cách bạn {selectedWorker.distance.toFixed(1)}km • Sẵn sàng
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="sidebar-commitment">
        <h3>Cam Kết Fixy</h3>
        <ul>
          <li>
            <span className="material-symbols-outlined">security</span>
            <span>Thợ được xác minh danh tính và bằng cấp chuyên môn.</span>
          </li>
          <li>
            <span className="material-symbols-outlined">payments</span>
            <span>Giá cả minh bạch, không phát sinh chi phí ẩn.</span>
          </li>
          <li>
            <span className="material-symbols-outlined">verified_user</span>
            <span>Bảo hành dịch vụ lên đến 12 tháng.</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
