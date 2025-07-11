import { Select, useColorModeValue } from '@chakra-ui/react';

const ProjectionHorizonSelector = ({ onHorizonSelect }) => {
  const horizons = [1, 3, 6, 12]; // In months
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const bgColor = useColorModeValue('white', 'gray.700');

  return (
    <Select 
      placeholder="Select projection horizon"
      onChange={(e) => onHorizonSelect(parseInt(e.target.value))}
      size="lg"
      bg={bgColor}
      color={textColor}
    >
      {horizons.map(horizon => (
        <option key={horizon} value={horizon}>
          {horizon} month{horizon > 1 ? 's' : ''}
        </option>
      ))}
    </Select>
  );
};

export default ProjectionHorizonSelector;