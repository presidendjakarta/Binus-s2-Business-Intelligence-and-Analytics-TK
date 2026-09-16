/**
 * INA-SEISMOBI: Active Fault Lines & Megathrust Geometry
 * Global window object to bypass browser file:/// CORS restrictions.
 */
window.FAULT_LINES_GEOJSON = {
  "type": "FeatureCollection",
  "name": "Indonesian_Active_Faults_And_Megathrust",
  "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
  "features": [
    {
      "type": "Feature",
      "properties": {
        "fault_id": "MEGA-SUNDA-01",
        "fault_name": "Sunda Megathrust Subduction Trench",
        "fault_type": "Megathrust Subduction",
        "slip_rate_mm_yr": 60.0,
        "hazard_rating": "CRITICAL"
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [92.5, 6.0], [93.8, 3.5], [96.0, 0.5], [98.5, -2.5], 
          [101.5, -5.5], [105.0, -7.5], [110.0, -9.5], [115.0, -10.5], 
          [120.0, -11.0], [125.0, -10.5], [130.0, -8.5]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "fault_id": "FLT-SUM-01",
        "fault_name": "Great Sumatran Fault (Sesar Semangko - Segmen Aceh & Seulimeum)",
        "fault_type": "Dextral Strike-Slip",
        "slip_rate_mm_yr": 18.0,
        "hazard_rating": "HIGH"
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [95.3, 5.8], [95.8, 5.2], [96.4, 4.5], [97.1, 3.7], [97.8, 2.9], [98.5, 2.0]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "fault_id": "FLT-SUM-02",
        "fault_name": "Great Sumatran Fault (Sesar Semangko - Segmen Ranau & Semangko)",
        "fault_type": "Dextral Strike-Slip",
        "slip_rate_mm_yr": 15.0,
        "hazard_rating": "HIGH"
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [100.5, -0.5], [101.5, -1.8], [102.8, -3.2], [104.0, -4.8], [104.8, -5.8]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "fault_id": "FLT-JAV-01",
        "fault_name": "Sesar Cimandiri (Pelabuhan Ratu - Gandasoli - Padalarang)",
        "fault_type": "Sinistral Strike-Slip Oblique",
        "slip_rate_mm_yr": 4.5,
        "hazard_rating": "HIGH"
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [106.5, -6.95], [106.9, -6.92], [107.2, -6.88], [107.5, -6.84]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "fault_id": "FLT-JAV-02",
        "fault_name": "Sesar Lembang (Bandung Utara)",
        "fault_type": "Sinistral Strike-Slip",
        "slip_rate_mm_yr": 5.0,
        "hazard_rating": "HIGH"
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [107.45, -6.82], [107.65, -6.81], [107.75, -6.80]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "fault_id": "FLT-JAV-03",
        "fault_name": "Sesar Opak (Yogyakarta - Bantul)",
        "fault_type": "Sinistral Strike-Slip",
        "slip_rate_mm_yr": 2.5,
        "hazard_rating": "HIGH"
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [110.25, -8.05], [110.40, -7.90], [110.50, -7.75]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "fault_id": "FLT-SUL-01",
        "fault_name": "Sesar Palu-Koro (Sulawesi Tengah)",
        "fault_type": "Left-Lateral Strike-Slip",
        "slip_rate_mm_yr": 35.0,
        "hazard_rating": "CRITICAL"
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [119.5, 0.5], [119.85, -0.85], [120.2, -1.8], [120.7, -2.8]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "fault_id": "FLT-SUL-02",
        "fault_name": "Sesar Matano & Lawanopo (Sulawesi Tenggara)",
        "fault_type": "Sinistral Strike-Slip",
        "slip_rate_mm_yr": 20.0,
        "hazard_rating": "HIGH"
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [120.8, -2.4], [121.5, -2.7], [122.3, -3.2], [122.9, -3.8]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "fault_id": "FLT-PAP-01",
        "fault_name": "Sesar Tarera-Aiduna & Sorong Fault Zone (Papua)",
        "fault_type": "Left-Lateral Strike-Slip",
        "slip_rate_mm_yr": 25.0,
        "hazard_rating": "HIGH"
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [130.5, -0.8], [133.0, -1.5], [135.5, -2.8], [138.0, -3.8], [140.5, -4.5]
        ]
      }
    }
  ]
};
