// Number to Hindi/Marathi Rupee Conversion Utilities

const HINDI_NUMBERS = {
  0: 'शून्य',
  1: 'एक',
  2: 'दो',
  3: 'तीन',
  4: 'चार',
  5: 'पाँच',
  6: 'छह',
  7: 'सात',
  8: 'आठ',
  9: 'नौ',
  10: 'दस',
  11: 'ग्यारह',
  12: 'बारह',
  13: 'तेरह',
  14: 'चौदह',
  15: 'पंद्रह',
  16: 'सोलह',
  17: 'सत्रह',
  18: 'अठारह',
  19: 'उन्नीस',
  20: 'बीस',
  30: 'तीस',
  40: 'चालीस',
  50: 'पचास',
  60: 'साठ',
  70: 'सत्तर',
  80: 'अस्सी',
  90: 'नब्बे',
  100: 'सौ',
  200: 'दो सौ',
  300: 'तीन सौ',
  400: 'चार सौ',
  500: 'पाँच सौ',
  600: 'छह सौ',
  700: 'सात सौ',
  800: 'आठ सौ',
  900: 'नौ सौ',
  1000: 'एक हज़ार',
};

const MARATHI_NUMBERS = {
  0: 'शून्य',
  1: 'एक',
  2: 'दोन',
  3: 'तीन',
  4: 'चार',
  5: 'पाच',
  6: 'सहा',
  7: 'सात',
  8: 'आठ',
  9: 'नऊ',
  10: 'दहा',
  11: 'अकरा',
  12: 'बारा',
  13: 'तेरा',
  14: 'चौदा',
  15: 'पंधरा',
  16: 'सोळा',
  17: 'सतरा',
  18: 'अठरा',
  19: 'एकोणीस',
  20: 'वीस',
  30: 'तीस',
  40: 'चाळीस',
  50: 'पन्नास',
  60: 'साठ',
  70: 'सत्तर',
  80: 'ऐंशी',
  90: 'नव्व्देण',
  100: 'शंभर',
  200: 'दोनशे',
  300: 'तीनशे',
  400: 'चारशे',
  500: 'पाचशे',
  600: 'सहाशे',
  700: 'सातशे',
  800: 'आठशे',
  900: 'नऊशे',
  1000: 'एक हजार',
};

// Hindi tens
const HINDI_TENS = {
  20: 'बीस',
  30: 'तीस',
  40: 'चालीस',
  50: 'पचास',
  60: 'साठ',
  70: 'सत्तर',
  80: 'अस्सी',
  90: 'नब्बे',
};

// Marathi tens
const MARATHI_TENS = {
  20: 'वीस',
  30: 'तीस',
  40: 'चाळीस',
  50: 'पन्नास',
  60: 'साठ',
  70: 'सत्तर',
  80: 'ऐंशी',
  90: 'नव्व्देण',
};

// Hindi ones
const HINDI_ONES = {
  1: 'एक',
  2: 'दो',
  3: 'तीन',
  4: 'चार',
  5: 'पाँच',
  6: 'छह',
  7: 'सात',
  8: 'आठ',
  9: 'नौ',
};

// Marathi ones
const MARATHI_ONES = {
  1: 'एक',
  2: 'दोन',
  3: 'तीन',
  4: 'चार',
  5: 'पाच',
  6: 'सहा',
  7: 'सात',
  8: 'आठ',
  9: 'नऊ',
};

/**
 * Convert number to Hindi words
 */
export function numberToHindi(num: number): string {
  const integer = Math.floor(num);
  
  // Direct lookup for common values
  if (HINDI_NUMBERS[integer as keyof typeof HINDI_NUMBERS]) {
    return HINDI_NUMBERS[integer as keyof typeof HINDI_NUMBERS];
  }

  // Handle numbers 1-99
  if (integer < 100) {
    if (integer < 20) {
      return HINDI_NUMBERS[integer as keyof typeof HINDI_NUMBERS] || integer.toString();
    }
    
    const tens = Math.floor(integer / 10) * 10;
    const ones = integer % 10;
    
    if (ones === 0) {
      return HINDI_TENS[tens as keyof typeof HINDI_TENS] || integer.toString();
    }
    
    return (HINDI_TENS[tens as keyof typeof HINDI_TENS] || '') + ' ' + 
           (HINDI_ONES[ones as keyof typeof HINDI_ONES] || '');
  }

  // Handle hundreds
  if (integer < 1000) {
    const hundreds = Math.floor(integer / 100);
    const remainder = integer % 100;
    
    const hundredsPart = (HINDI_ONES[hundreds as keyof typeof HINDI_ONES] || hundreds.toString()) + ' सौ';
    
    if (remainder === 0) return hundredsPart;
    return hundredsPart + ' ' + numberToHindi(remainder);
  }

  // Handle thousands
  if (integer < 100000) {
    const thousands = Math.floor(integer / 1000);
    const remainder = integer % 1000;
    
    const thousandsPart = numberToHindi(thousands) + ' हज़ार';
    
    if (remainder === 0) return thousandsPart;
    return thousandsPart + ' ' + numberToHindi(remainder);
  }

  // For very large numbers, fallback to English
  return integer.toString();
}

/**
 * Convert number to Marathi words
 */
export function numberToMarathi(num: number): string {
  const integer = Math.floor(num);
  
  // Direct lookup for common values
  if (MARATHI_NUMBERS[integer as keyof typeof MARATHI_NUMBERS]) {
    return MARATHI_NUMBERS[integer as keyof typeof MARATHI_NUMBERS];
  }

  // Handle numbers 1-99
  if (integer < 100) {
    if (integer < 20) {
      return MARATHI_NUMBERS[integer as keyof typeof MARATHI_NUMBERS] || integer.toString();
    }
    
    const tens = Math.floor(integer / 10) * 10;
    const ones = integer % 10;
    
    if (ones === 0) {
      return MARATHI_TENS[tens as keyof typeof MARATHI_TENS] || integer.toString();
    }
    
    return (MARATHI_TENS[tens as keyof typeof MARATHI_TENS] || '') + ' ' + 
           (MARATHI_ONES[ones as keyof typeof MARATHI_ONES] || '');
  }

  // Handle hundreds
  if (integer < 1000) {
    const hundreds = Math.floor(integer / 100);
    const remainder = integer % 100;
    
    const hundredsPart = (MARATHI_ONES[hundreds as keyof typeof MARATHI_ONES] || hundreds.toString()) + ' शंभर';
    
    if (remainder === 0) return hundredsPart;
    return hundredsPart + ' ' + numberToMarathi(remainder);
  }

  // Handle thousands
  if (integer < 100000) {
    const thousands = Math.floor(integer / 1000);
    const remainder = integer % 1000;
    
    const thousandsPart = numberToMarathi(thousands) + ' हजार';
    
    if (remainder === 0) return thousandsPart;
    return thousandsPart + ' ' + numberToMarathi(remainder);
  }

  // For very large numbers, fallback to English
  return integer.toString();
}

/**
 * Format price with Hindi and Marathi readings
 */
export function formatPriceWithLanguages(price: number): {
  numeric: string;
  hindi: string;
  marathi: string;
} {
  return {
    numeric: `₹${price.toFixed(2)}`,
    hindi: `${numberToHindi(price)} रुपये`,
    marathi: `${numberToMarathi(price)} रुपये`,
  };
}

/**
 * Get price as string with both languages separated by pipe
 */
export function getBilingualPriceText(price: number): string {
  const { hindi, marathi } = formatPriceWithLanguages(price);
  return `${hindi} | ${marathi}`;
}
