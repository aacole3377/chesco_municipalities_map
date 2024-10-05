import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './styles/MapComponent.css';

const MapComponent = ({ censusData, metric, setMetric, selectedMunicipality }) => {  
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [percentileRanges, setPercentileRanges] = useState([]);
  const geoJsonLayerRef = useRef(null);
  const mapRef = useRef(null);

  // Close all popups
  const closeAllPopups = () => {
    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.eachLayer((layer) => layer.closePopup()); // Close popups of all layers
    }
  };

  useEffect(() => {
    const fetchGeoJSON = async () => {
      const response = await fetch(process.env.PUBLIC_URL + '/chester_county_municipalities.geojson');
      const geojson = await response.json();
      setGeoJsonData(geojson);
    };
    fetchGeoJSON();
  }, []);

  useEffect(() => {
    if (censusData) {
      const values = censusData.map(d => parseFloat(d[1])).filter(v => !isNaN(v)).sort((a, b) => a - b);
      const rangeSize = Math.floor(values.length / 5);
      const ranges = [
        values[rangeSize * 0],
        values[rangeSize * 1],
        values[rangeSize * 2],
        values[rangeSize * 3],
        values[rangeSize * 4],
        values[values.length - 1]
      ];
      setPercentileRanges(ranges);
    }
  }, [censusData]);

  useEffect(() => {
    if (selectedMunicipality && geoJsonLayerRef.current) {
      geoJsonLayerRef.current.eachLayer((layer) => {
        const geoJsonName = normalizeName(layer.feature.properties.MUNI_NAME);
        if (normalizeName(selectedMunicipality).includes(geoJsonName)) {
          layer.openPopup();
        }
      });
    }
  }, [selectedMunicipality]);

  useEffect(() => {
    // Close all popups when the metric changes
    closeAllPopups();

    // Rebind popups with new data
    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.eachLayer((layer) => {
        const geoJsonName = normalizeName(layer.feature.properties.MUNI_NAME);
        let value = 'N/A';
  
        if (censusData) {
          const match = censusData.find((d) => normalizeName(d[0]).includes(geoJsonName));
          value = match ? parseFloat(match[1]) : 'N/A';
        }
  
        const metricLabel = metric === 'income' ? 'Median Income' :
                            metric === 'education' ? 'Higher Education Count' : 
                            'Population';
  
        // First unbind the old popup if it exists
        layer.unbindPopup();
  
        // Now bind the new popup
        layer.bindPopup(`
          <strong>${layer.feature.properties.MUNI_NAME}</strong><br>
          ${metricLabel}: ${value !== 'N/A' ? value.toLocaleString() : 'N/A'}
        `);
      });
    }
  }, [metric, censusData]);

  const getColor = (value) => {
    if (!percentileRanges.length) return '#FFFFFF'; 
    return value > percentileRanges[4] ? '#800026' :
           value > percentileRanges[3] ? '#BD0026' :
           value > percentileRanges[2] ? '#E31A1C' :
           value > percentileRanges[1] ? '#FC4E2A' :
           '#FFEDA0'; 
  };

  const normalizeName = (name) => {
    return name ? name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '').replace(/\s+/g, '') : '';
  };

  const styleFunction = (feature) => {
    const geoJsonName = normalizeName(feature.properties.MUNI_NAME); 
    let value;
  
    if (censusData) {
      const match = censusData.find((d) => normalizeName(d[0]).includes(geoJsonName));
      
      if (metric === 'education' && match) {
        value = parseFloat(match[1]); // Bachelor's degree count
      } else {
        value = match ? parseFloat(match[1]) : null; // Handle income or population
      }
    }
  
    return {
      fillColor: value ? getColor(value) : '#FFFFFF',
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  };

  const onEachFeature = (feature, layer) => {
    const geoJsonName = normalizeName(feature.properties.MUNI_NAME);  
    let metricValue = 'N/A';
  
    if (censusData) {
      const match = censusData.find((d) => normalizeName(d[0]).includes(geoJsonName));
  
      if (match) {
        if (metric === 'education') {
          metricValue = parseFloat(match[1]); // Bachelor's degree count
        } else if (metric === 'income') {
          metricValue = parseFloat(match[1]); // Median income
        } else {
          metricValue = parseFloat(match[1]); // Population
        }
      }
    }
  
    const metricLabel = metric === 'income' ? 'Median Income' :
                        metric === 'education' ? 'Higher Education Count' : 
                        'Population';
  
    layer.bindPopup(`
      <strong>${feature.properties.MUNI_NAME}</strong><br>
      ${metricLabel}: ${metricValue !== 'N/A' ? metricValue.toLocaleString() : 'N/A'}
    `);
  };
    
  const Legend = () => {
    const map = useMap();
  
    useEffect(() => {
      const legend = L.control({ position: 'bottomright' });
  
      legend.onAdd = () => {
        const div = L.DomUtil.create('div', 'info legend');
        const labels = [];
  
        div.style.backgroundColor = 'white';
        div.style.padding = '10px';
        div.style.border = '2px solid black';
        div.style.borderRadius = '5px';
        div.style.fontSize = '14px';
  
        const legendTitle = metric === 'income' ? 'Income Ranges' : 
                            metric === 'education' ? 'Higher Education Ranges' : 
                            'Population Ranges';
  
        div.innerHTML = `<h4>${legendTitle}</h4>`;
  
        for (let i = 0; i < percentileRanges.length - 1; i++) {
          const color = getColor(percentileRanges[i] + 1);
          labels.push(
            `<i style="background:${color}; width: 18px; height: 18px; display: inline-block; margin-right: 8px;"></i> 
            ${Math.round(percentileRanges[i])} &ndash; ${Math.round(percentileRanges[i + 1])}<br>`
          );
        }
  
        div.innerHTML += labels.join('');
        return div;
      };
  
      legend.addTo(map);
  
      return () => {
        map.removeControl(legend);
      };
    }, [map, percentileRanges, metric]);
  
    return null;
  };

  return (
    <div className="map-container">
      <h1 className="map-title">Chester County Municipality Metrics</h1>

      <select className="metric-dropdown" value={metric} onChange={(e) => setMetric(e.target.value)}>
        <option value="income">Median Income</option>
        <option value="population">Population</option>
        <option value="education">Education</option>
      </select>

      <MapContainer 
        center={[40.0, -75.7]} 
        zoom={10} 
        style={{ height: '600px', width: '100%' }}
        scrollWheelZoom={false} 
        doubleClickZoom={false} 
        whenCreated={mapInstance => mapRef.current = mapInstance}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {geoJsonData && censusData && (
          <GeoJSON
            data={geoJsonData}
            style={styleFunction}
            onEachFeature={onEachFeature}
            ref={geoJsonLayerRef}  
          />
        )}

        <Legend />
      </MapContainer>
    </div>
  );
};

export default MapComponent;
