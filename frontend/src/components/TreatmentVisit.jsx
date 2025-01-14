const TreatmentVisit = ({ visitNumber, title, description }) => {
  return (
    <div className="space-y-3">
      <h3 className="text-green-700 font-medium">Visit {visitNumber}</h3>
      <h4 className="font-medium">{title}</h4>
      <p className="text-gray-600">{description}</p>
      <button className="inline-flex items-center px-4 py-2 text-sm border border-green-700 text-green-700 rounded-md hover:bg-green-50">
        Schedule Visit {visitNumber}
      </button>
    </div>
  );
};

export default TreatmentVisit; 