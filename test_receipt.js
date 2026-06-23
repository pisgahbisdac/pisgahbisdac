const systemConfig = {
  receipt_prefix_bangun: "PEMB/26-06-",
  receipt_start_bangun: "8"
};

const cachedIncome = [];

function generateReceiptNo(category, typeValue) {
  let prefix = '';
  let startStr = '';
  let list = [];

  if (category === 'income') {
    const type = typeValue || '';
    
    if (type.toLowerCase().includes('pembangunan')) {
      prefix = (systemConfig.receipt_prefix_bangun || '').trim();
      startStr = (systemConfig.receipt_start_bangun || '').trim();
    } else {
      prefix = (systemConfig.receipt_prefix_umum || '').trim();
      startStr = (systemConfig.receipt_start_umum || '').trim();
    }
    list = cachedIncome || [];
  }

  let startNo = parseInt(startStr, 10);
  if (isNaN(startNo)) startNo = 1;
  let digitLength = startStr.length > 0 ? startStr.length : 3;

  let highest = 0;
  list.forEach(tx => {
    let rNo = tx.receipt_no || '';
    if (rNo.startsWith(prefix)) {
      let numPart = rNo.substring(prefix.length);
      let n = parseInt(numPart, 10);
      if (!isNaN(n) && n > highest) highest = n;
    }
  });

  let nextNo = highest >= startNo ? highest + 1 : startNo;
  let nextStr = String(nextNo).padStart(digitLength, '0');
  
  const newNo = prefix + nextStr;
  return newNo;
}

console.log("Income Pembangunan:", generateReceiptNo('income', 'Pembangunan'));
console.log("Income Umum:", generateReceiptNo('income', 'Perpuluhan'));
