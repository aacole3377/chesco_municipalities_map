import React, { useState, useEffect } from 'react';
import MapComponent from './MapComponent';
import Table from './Table';
import axios from 'axios';

const CENSUS_API_KEY = '9c7a8194b884d48fa6ddcd0352e3115dee8cbd33';  

function App() {
  const [censusData, setCensusData] = useState(null);  
  const [metric, setMetric] = useState('income');  
  const [selectedMunicipality, setSelectedMunicipality] = useState(null); 

  useEffect(() => {
    const fetchCensusData = async () => {
      let apiUrl;

      if (metric === 'income') {
        apiUrl = `https://api.census.gov/data/2020/acs/acs5?get=NAME,B19013_001E&for=county%20subdivision:*&in=state:42%20county:029&key=${CENSUS_API_KEY}`;
      } else if (metric === 'population') {
        apiUrl = `https://api.census.gov/data/2020/acs/acs5?get=NAME,B01003_001E&for=county%20subdivision:*&in=state:42%20county:029&key=${CENSUS_API_KEY}`;
      }

      try {
        const response = await axios.get(apiUrl);
        setCensusData(response.data);
      } catch (error) {
        console.error("Error fetching census data:", error);
      }
    };

    fetchCensusData();
  }, [metric]);

  const onMunicipalityClick = (municipalityName) => {
    setSelectedMunicipality(municipalityName);  
  };

  return (
    <div className="App">
      <MapComponent 
        censusData={censusData} 
        metric={metric} 
        setMetric={setMetric} 
        selectedMunicipality={selectedMunicipality}  
      />
      {censusData && (
        <Table 
          censusData={censusData} 
          metric={metric}
          onMunicipalityClick={onMunicipalityClick}  
        />
      )}
    </div>
  );
}

export default App;
