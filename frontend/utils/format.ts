export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Tanggal tidak tersedia';
  
  try {
    // Handle various date formats
    let date: Date;
    
    // If it's already a Date object
    if (dateString instanceof Date) {
      date = dateString;
    } else if (typeof dateString === 'string') {
      // Parse ISO string or other common formats
      date = new Date(dateString);
    } else {
      return 'Tanggal tidak valid';
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Tanggal tidak valid';
    }
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('id-ID', options);
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Tanggal tidak valid';
  }
};

export const truncateText = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};