import React from 'react';
import './styles/Table.css';

const Table = ({ censusData, metric, onMunicipalityClick }) => {
  // sort the censusData based on the metric value
  const sortedData = censusData
    .filter((d) => !isNaN(parseFloat(d[1]))) // filter out invalid data
    .sort((a, b) => parseFloat(b[1]) - parseFloat(a[1])); // sort descending

  return (
    <div className="table-container">
      <h2>Sorted {metric === 'income' ? 'Median Income' : 'Population'} Data (High to Low)</h2>
      <table>
        <thead>
          <tr>
            <th>Municipality</th>
            <th>{metric === 'income' ? 'Median Income' : 'Population'}</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr key={index} onClick={() => onMunicipalityClick(row[0])}> {/* Pass the municipality name */}
              <td>{row[0]}</td> {/* Municipality Name */}
              <td>{row[1]}</td> {/* Metric value */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
