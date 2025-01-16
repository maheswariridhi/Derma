import React from 'react';

const Table = ({ headers, data, onRowClick }) => {
  const getCellValue = (row, key) => {
    // Handle nested properties like 'treatmentPlan.diagnosis'
    return key.split('.').reduce((obj, key) => obj?.[key], row) || '';
  };

  return (
    <div className="overflow-x-auto bg-white p-4 rounded shadow">
      <table className="table-auto w-full border-collapse border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="border px-4 py-2 text-left">
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr 
              key={row.id} 
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onRowClick(row)}
            >
              {headers.map((header, index) => (
                <td key={index} className="border px-4 py-2">
                  {getCellValue(row, header.key)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table; 