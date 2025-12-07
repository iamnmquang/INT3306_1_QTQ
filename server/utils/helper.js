// Helper functions
const formatTime = (dateTime) => {
  const date = new Date(dateTime);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
}

const formatDate = (dateTime) => {
  const date = new Date(dateTime);
  return date.toLocaleDateString('en-GB', { 
    day: '2-digit',
    month: 'short',
    year: '2-digit'
  });
}

const formatDateShort = (dateTime) => {
  const date = new Date(dateTime);
  return date.toLocaleDateString('en-GB', { 
    day: '2-digit',
    month: 'short',
    year: '2-digit'
  }).replace(/ /g, ' ');
}
module.exports = {formatDate, formatDateShort, formatTime}
