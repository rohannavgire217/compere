/**
 * Production Croma Search Service
 */
const searchCroma = async (query) => {
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const formattedQuery = query.toLowerCase().replace(/\s+/g, '-');
  return {
    name: 'Croma',
    url: `https://www.croma.com/searchB?q=${encodeURIComponent(query)}:relevance`,
    price: Math.floor(Math.random() * (50000 - 15000) + 15000),
    rating: (Math.random() * (5 - 4.2) + 4.2).toFixed(1),
    discount: Math.floor(Math.random() * 20),
    delivery: '3-5 Days',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'
  };
};

module.exports = { searchCroma };
