import React from 'react';
import './styles/Table.css';

const Table = ({ censusData, metric, onMunicipalityClick }) => {
  // sort the censusData based on the metric value
  const sortedData = censusData
    .filter((d) => !isNaN(parseFloat(d[1]))) // filter out invalid data
    .sort((a, b) => parseFloat(b[1]) - parseFloat(a[1])); // sort descending

  return (
    <div className="table-container">
      <h2>Sorted {metric === 'income' ? 'Median Income' : metric === 'population' ? 'Population' : 'Education'} Data (High to Low)</h2>
      <table>
        <thead>
          <tr>
            <th>Municipality</th>
            <th>{metric === 'income' ? 'Median Income' : metric === 'population' ? 'Population' : 'Bachelor\'s Degree Count'}</th>
            {metric === 'education' && <th>% Population with Higher Education</th>}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => {
            const bachelors = metric === 'education' ? parseFloat(row[1]) : null;
            const totalPopulation = metric === 'education' ? parseFloat(row[2]) : null;
            const percentage = totalPopulation ? (bachelors / totalPopulation * 100).toFixed(2) : 'N/A';

            return (
              <tr key={index} onClick={() => onMunicipalityClick(row[0])}> {/* Pass the municipality name */}
                <td>{row[0]}</td> {/* Municipality Name */}
                <td>{row[1]}</td> {/* Metric value */}
                {metric === 'education' && <td>{percentage}%</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
