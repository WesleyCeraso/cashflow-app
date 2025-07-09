const ProjectionHorizonSelector = ({ onHorizonSelect }) => {
  const horizons = [1, 3, 6, 12]; // In months

  return (
    <select onChange={(e) => onHorizonSelect(parseInt(e.target.value))}>
      <option value="">Select projection horizon</option>
      {horizons.map(horizon => (
        <option key={horizon} value={horizon}>
          {horizon} month{horizon > 1 ? 's' : ''}
        </option>
      ))}
    </select>
  );
};

export default ProjectionHorizonSelector;