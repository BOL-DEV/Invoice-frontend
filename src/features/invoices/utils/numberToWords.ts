const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const TENS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

const SCALES = ['', 'Thousand', 'Million', 'Billion'];

function convertLessThanThousand(num: number): string {
  let words = '';
  if (num >= 100) {
    words += ONES[Math.floor(num / 100)] + ' Hundred ';
    num %= 100;
  }
  if (num >= 20) {
    words += TENS[Math.floor(num / 10)] + ' ';
    num %= 10;
  }
  if (num > 0) {
    words += ONES[num] + ' ';
  }
  return words.trim();
}

export function numberToNairaWords(amount: number): string {
  const roundedAmount = Math.round((amount + Number.EPSILON) * 100) / 100;
  if (roundedAmount === 0) return 'Zero Naira Only';

  const parts = roundedAmount.toFixed(2).split('.');
  const naira = parseInt(parts[0], 10);
  const kobo = parseInt(parts[1], 10);

  let nairaWords = '';
  if (naira > 0) {
    let tempNaira = naira;
    let scaleIndex = 0;
    
    while (tempNaira > 0) {
      const chunk = tempNaira % 1000;
      if (chunk > 0) {
        const chunkWords = convertLessThanThousand(chunk);
        const scale = SCALES[scaleIndex];
        nairaWords = `${chunkWords} ${scale ? scale + ' ' : ''}${nairaWords}`;
      }
      tempNaira = Math.floor(tempNaira / 1000);
      scaleIndex++;
    }
    
    // Normalize spacing
    nairaWords = nairaWords.replace(/\s+/g, ' ').trim();
    nairaWords = `${nairaWords} Naira`;
  }

  let koboWords = '';
  if (kobo > 0) {
    koboWords = `${convertLessThanThousand(kobo)} Kobo`;
  }

  if (nairaWords && koboWords) {
    return `${nairaWords} and ${koboWords} Only`;
  } else if (nairaWords) {
    return `${nairaWords} Only`;
  } else if (koboWords) {
    return `${koboWords} Only`;
  }

  return 'Zero Naira Only';
}
