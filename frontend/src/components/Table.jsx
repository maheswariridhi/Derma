import React from "react";

const Table = ({ data }) => {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          <th className="border-b p-2 text-left">Patient</th>
          <th className="border-b p-2 text-left">Status</th>
          <th className="border-b p-2 text-right">Value</th>
          <th className="border-b p-2 text-left">Created Date</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            <td className="p-2">{row.name}</td>
            <td className="p-2">{row.status}</td>
            <td className="p-2 text-right">${row.value}</td>
            <td className="p-2">{row.date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
