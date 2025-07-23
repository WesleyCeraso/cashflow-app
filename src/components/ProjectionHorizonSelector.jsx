import { Box, Slider, SliderTrack, SliderFilledTrack, SliderThumb, SliderMark, Tooltip, FormLabel, FormControl, useColorModeValue } from '@chakra-ui/react';
import { useState } from 'react';

const ProjectionHorizonSelector = ({ onHorizonSelect, currentHorizon }) => {
  const [sliderValue, setSliderValue] = useState(currentHorizon);
  const [showTooltip, setShowTooltip] = useState(false);

  const horizons = [1, 3, 6, 12, 24, 36]; // Example horizons in months

  const handleSliderChange = (val) => {
    setSliderValue(val);
    onHorizonSelect(val);
  };

  return (
    <FormControl>
      <FormLabel>Projection Horizon ({sliderValue} months)</FormLabel>
      <Slider
        id="slider"
        defaultValue={currentHorizon}
        min={1}
        max={36}
        step={1}
        onChange={(v) => handleSliderChange(v)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <SliderMark value={1} mt="1" fontSize="sm">1m</SliderMark>
        <SliderMark value={12} mt="1" fontSize="sm">12m</SliderMark>
        <SliderMark value={24} mt="1" fontSize="sm">24m</SliderMark>
        <SliderMark value={36} mt="1" fontSize="sm">36m</SliderMark>
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <Tooltip
          hasArrow
          bg="blue.500"
          color="white"
          placement="top"
          isOpen={showTooltip}
          label={`${sliderValue} months`}
        >
          <SliderThumb />
        </Tooltip>
      </Slider>
    </FormControl>
  );
};

export default ProjectionHorizonSelector;