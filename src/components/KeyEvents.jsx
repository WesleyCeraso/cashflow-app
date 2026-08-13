import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Heading, HStack, SimpleGrid, Text as ChakraText, useColorModeValue, VStack } from '@chakra-ui/react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { formatCurrency } from '../utils';
import { differenceInCalendarDays, format, parse } from 'date-fns';

const formatEventDate = (date) => {
  const parsedDate = parse(date, 'yyyy-MM-dd', new Date());
  const daysAway = differenceInCalendarDays(parsedDate, new Date());

  if (daysAway === 0) return 'Today';
  if (daysAway === 1) return 'Tomorrow';
  if (daysAway === -1) return 'Yesterday';
  if (daysAway > 1 && daysAway <= 7) return `In ${daysAway} days`;
  if (daysAway < -1 && daysAway >= -7) return `${Math.abs(daysAway)} days ago`;

  return format(parsedDate, 'yyyy-MM-dd');
};

const getLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const KeyEventCard = ({ event }) => {
  const cardBg = useColorModeValue('gray.50', 'gray.800');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const amount = event.is_subtotal ? event.amount : event.amount;

  return (
    <Box bg={cardBg} borderRadius="md" boxShadow="sm" p={4} minH="160px">
      <VStack align="stretch" spacing={3}>
        <Box>
          <ChakraText fontSize="sm" color={mutedColor}>{formatEventDate(event.date)}</ChakraText>
          <ChakraText fontSize="xs" color={mutedColor}>{format(parse(event.date, 'yyyy-MM-dd', new Date()), 'yyyy-MM-dd')}</ChakraText>
        </Box>
        <ChakraText fontWeight="bold" noOfLines={2}>{event.description}</ChakraText>
        <HStack justify="space-between">
          <ChakraText color={amount >= 0 ? 'green.500' : 'red.500'} fontWeight="semibold">
            {amount >= 0 ? '+' : '-'}{formatCurrency(Math.abs(amount))}
          </ChakraText>
          {typeof event.balance === 'number' && (
            <Box textAlign="right">
              <ChakraText fontSize="xs" color={mutedColor}>Balance</ChakraText>
              <ChakraText fontWeight="semibold">{formatCurrency(event.balance)}</ChakraText>
            </Box>
          )}
        </HStack>
      </VStack>
    </Box>
  );
};

const KeyEventCarousel = ({ events }) => {
  const [startIndex, setStartIndex] = useState(0);
  const carouselEvents = useMemo(() => {
    const today = getLocalDateString(new Date());
    return events.filter(event =>
      event.date > today &&
      !event.is_subtotal &&
      event.description !== 'Starting Balance'
    );
  }, [events]);
  const visibleEvents = useMemo(() => carouselEvents.slice(startIndex, startIndex + 3), [carouselEvents, startIndex]);
  const canGoBack = startIndex > 0;
  const canGoForward = startIndex + 3 < carouselEvents.length;
  const bg = useColorModeValue('white', 'gray.700');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    if (startIndex >= carouselEvents.length) {
      setStartIndex(0);
    }
  }, [carouselEvents.length, startIndex]);

  if (!carouselEvents || carouselEvents.length === 0) return null;

  return (
    <Box w="100%" bg={bg} borderRadius="lg" boxShadow="md" p={6}>
      <HStack justify="space-between" mb={4}>
        <Heading size="lg">Key Events</Heading>
        <HStack>
          <Button
            aria-label="Previous key events"
            leftIcon={<FaChevronLeft />}
            onClick={() => setStartIndex(index => Math.max(0, index - 3))}
            isDisabled={!canGoBack}
            size="sm"
          >
            Previous
          </Button>
          <Button
            aria-label="Next key events"
            rightIcon={<FaChevronRight />}
            onClick={() => setStartIndex(index => Math.min(carouselEvents.length - 1, index + 3))}
            isDisabled={!canGoForward}
            size="sm"
          >
            Next
          </Button>
        </HStack>
      </HStack>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        {visibleEvents.map((event, index) => (
          <KeyEventCard key={`${event.date}-${event.description}-${startIndex + index}`} event={event} />
        ))}
      </SimpleGrid>
      <ChakraText mt={4} fontSize="sm" color={mutedColor} textAlign="right">
        {startIndex + 1}-{Math.min(startIndex + 3, carouselEvents.length)} of {carouselEvents.length}
      </ChakraText>
    </Box>
  );
};

const KeyEvents = ({ events }) => (
  <VStack spacing={8} align="stretch" w="100%">
    <KeyEventCarousel events={events} />
  </VStack>
);

export default KeyEvents;
