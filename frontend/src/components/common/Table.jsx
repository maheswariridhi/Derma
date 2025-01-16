import React from 'react';

const Table = ({ headers, data, onRowClick }) => {
  return (
    <div className="overflow-x-auto bg-white p-4 rounded shadow">
      <table className="table-auto w-full border-collapse border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="border px-4 py-2">{header.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              {headers.map((header, index) => (
                <td 
                  key={index}
                  className={`border px-4 py-2 ${header.key === 'name' ? 'cursor-pointer hover:text-blue-600' : ''}`}
                  onClick={() => header.key === 'name' && onRowClick(row)}
                >
                  {row[header.key]}
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