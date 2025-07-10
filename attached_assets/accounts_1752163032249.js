/**
 * Main Banking Dashboard Script
 * --------------------------------
 * Handles:
 * - DOMContentLoaded initialization
 * - Tab switching
 * - Modal interactions
 * - Copy to clipboard functionality
 * - Recent transactions display
 * - Real-time crypto prices
 * - Pay Bills functionality with dynamic bill loading
 * --------------------------------
 */

document.addEventListener("DOMContentLoaded", () => {
  console.log("[Init] DOM fully loaded, initializing...");
  loadRecentTransactions();
  loadCryptoPrices();
});

/* ------------------------------
   1. Tab Switching
--------------------------------*/
function openTab(tabName) {
  console.log(`[Tab] Opening tab: ${tabName}`);
  const tabs = document.querySelectorAll(".tab");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach(tab => tab.classList.remove("active"));
  contents.forEach(content => content.classList.remove("active"));

  const activeTabButton = document.querySelector(`.tab[onclick="openTab('${tabName}')"]`);
  if (activeTabButton) activeTabButton.classList.add("active");

  const activeContent = document.getElementById(tabName);
  if (activeContent) activeContent.classList.add("active");
}

/* ------------------------------
   2. Modals: Account Details
--------------------------------*/
function openModal(action, account = null) {
  console.log(`[Modal] Opening modal for: ${action}`);
  const modal = document.getElementById("modal");
  const modalBody = document.getElementById("modal-body");
  modal.style.display = "block";

  const details = account ?? {
    accountName: "John Doe",
    accountNumber: "1234567890",
    bankName: "Everstead Bank"
  };

  modalBody.innerHTML = `
    <h2>${action.charAt(0).toUpperCase() + action.slice(1)} Action</h2>
    <div class="account-details">
      <p><strong>Account Name:</strong> 
        <span id="account-name">${details.accountName}</span> 
        <button class="copy-btn" onclick="copyToClipboard('account-name')">📋</button>
      </p>
      <p><strong>Account Number:</strong> 
        <span id="account-number">${details.accountNumber}</span> 
        <button class="copy-btn" onclick="copyToClipboard('account-number')">📋</button>
      </p>
      <p><strong>Bank Name:</strong> 
        <span id="bank-name">${details.bankName}</span> 
        <button class="copy-btn" onclick="copyToClipboard('bank-name')">📋</button>
      </p>
    </div>
    <div class="form-placeholder"></div>
  `;
}

function closeMainModal() {
  console.log("[Modal] Closing main modal");
  document.getElementById("modal").style.display = "none";
}

/* ------------------------------
   3. Copy to Clipboard
--------------------------------*/
function copyToClipboard(elementId) {
  console.log(`[Clipboard] Copying: ${elementId}`);
  const text = document.getElementById(elementId)?.innerText;
  if (!text) {
    console.warn(`[Clipboard] Element ${elementId} not found or empty.`);
    return;
  }
  navigator.clipboard.writeText(text)
    .then(() => {
      const spanElement = document.getElementById(elementId);
      if (!spanElement) return;
      const button = spanElement.nextElementSibling;
      if (button && button.classList.contains("copy-btn")) {
        const originalText = button.textContent;
        button.textContent = '✔️';
        setTimeout(() => {
          button.textContent = originalText;
        }, 1500);
      }
    })
    .catch(err => console.error('[Clipboard] Failed to copy:', err));
}

/* ------------------------------
   4. Simulated Transactions
--------------------------------*/
function loadRecentTransactions() {
  console.log("[Transactions] Loading recent transactions");
  const tbody = document.getElementById("transactions-body");
  if (!tbody) {
    console.warn("[Transactions] transactions-body tbody not found.");
    return;
  }
  const transactions = [
    { date: '2025-06-01', desc: 'Coffee Shop', amount: '-$5.50', status: 'Completed' },
    { date: '2025-05-30', desc: 'Salary', amount: '+$3,000.00', status: 'Completed' },
    { date: '2025-05-29', desc: 'Transfer to Savings', amount: '-$500.00', status: 'Completed' }
  ];
  tbody.innerHTML = ''; // Clear any existing rows
  transactions.forEach(tx => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${tx.date}</td><td>${tx.desc}</td><td>${tx.amount}</td><td>${tx.status}</td>`;
    tbody.appendChild(tr);
  });
}

/* ------------------------------
   5. Real-time Crypto Prices
--------------------------------*/
function loadCryptoPrices() {
  console.log("[Crypto] Loading BTC price...");
  const btcBalance = 1.2345;
  const btcUsdSpan = document.getElementById("btc-usd");
  const btcBalanceSpan = document.getElementById("btc-balance");

  if (!btcUsdSpan || !btcBalanceSpan) {
    console.warn("[Crypto] BTC display elements not found.");
    return;
  }

  btcUsdSpan.textContent = "Loading...";
  btcBalanceSpan.textContent = `${btcBalance} BTC`;

  fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd")
    .then(response => response.json())
    .then(data => {
      const btcUsd = data.bitcoin?.usd * btcBalance;
      if (btcUsd === undefined) {
        throw new Error("BTC price data missing");
      }
      btcUsdSpan.textContent = `$${btcUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    })
    .catch(err => {
      btcUsdSpan.textContent = "Error loading price";
      console.error("[Crypto] Error loading price:", err);
    });
}

/* ------------------------------
   6. Pay Bills: Modal Handling
--------------------------------*/
const openPayBillsModal = () => {
  console.log("[Pay Bills] Opening pay bills modal");
  const modal = document.getElementById('pay-bills-modal');
  if (modal) {
    modal.style.display = 'block';
    // Show utilities after modal is visible
    showBillCategory('utilities');
  }
};


const closePayBillsModal = () => {
  console.log("[Pay Bills] Closing pay bills modal");
  const modal = document.getElementById('pay-bills-modal');
  if (modal) modal.style.display = 'none';
};

/* ------------------------------
   7. Pay Bills: Bill Categories
--------------------------------*/
function showBillCategory(categoryId) {
  console.log(`[Pay Bills] Showing category: ${categoryId}`);
  const categories = document.querySelectorAll('.bill-category');
  categories.forEach(cat => cat.classList.remove('active'));

  const tabs = document.querySelectorAll('.bill-tab');
  tabs.forEach(tab => tab.classList.remove('active'));

  const selectedCategory = document.getElementById(categoryId);
  if (selectedCategory) selectedCategory.classList.add('active');

  const clickedTab = Array.from(tabs).find(tab => tab.textContent.toLowerCase() === categoryId);
  if (clickedTab) clickedTab.classList.add('active');

  renderBills(categoryId);
}

/* ------------------------------
   8. Pay Bills: Payment Flow
--------------------------------*/
// Open the payment modal and reset to step 1
function openPaymentForm(billName) {
  console.log(`[Pay Bills] Opening payment form for: ${billName}`);

  const paymentModal = document.getElementById('payment-modal');
  if (!paymentModal) {
    console.error('Payment modal not found!');
    return;
  }

  paymentModal.style.display = 'block';

  // Reset steps visibility
  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const paymentSuccess = document.getElementById('paymentSuccess');

  if (step1 && step2 && paymentSuccess) {
    step1.style.display = 'block';
    step2.style.display = 'none';
    paymentSuccess.style.display = 'none';
  }

  // Clear previous inputs and errors
  const paymentCodeInput = document.getElementById('paymentCodeInput');
  if (paymentCodeInput) paymentCodeInput.value = '';

  const errorMsg = document.getElementById('errorMsg');
  if (errorMsg) errorMsg.textContent = '';

  // Populate company name in step1 and step2
  const companyName = document.getElementById('companyName');
  if (companyName) companyName.textContent = billName;

  // Optionally set payment amount here or later
  const paymentAmount = document.getElementById('paymentAmount');
  if (paymentAmount) paymentAmount.textContent = '100.00'; // example amount
}

// Close modal when clicking the close "×" span
const closeModal = document.getElementById('closeModal');
if (closeModal) {
  closeModal.addEventListener('click', () => {
    const paymentModal = document.getElementById('payment-modal');
    if (paymentModal) paymentModal.style.display = 'none';
  });
}

// Validate button: hide step1, show step2 with details
const validateBtn = document.getElementById('validateCodeBtn');
if (validateBtn) {
  validateBtn.addEventListener('click', () => {
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const errorMsg = document.getElementById('errorMsg');

    // Simple validation example (check code not empty)
    const paymentCodeInput = document.getElementById('paymentCodeInput');
    if (!paymentCodeInput || paymentCodeInput.value.trim() === '') {
      if (errorMsg) errorMsg.textContent = 'Please enter a valid code.';
      return;
    }

    if (step1 && step2) {
      step1.style.display = 'none';
      step2.style.display = 'block';
    }
  });
}

// Proceed button: hide step2, show success animation, then auto-close modal
const proceedBtn = document.getElementById('proceedBtn');
if (proceedBtn) {
  proceedBtn.addEventListener('click', () => {
    const step2 = document.getElementById('step2');
    const paymentSuccess = document.getElementById('paymentSuccess');
    const paymentModal = document.getElementById('payment-modal');

    if (step2 && paymentSuccess) {
      step2.style.display = 'none';

      // Reset and trigger SVG animation for the green tick
      const checkCircle = paymentSuccess.querySelector('.checkmark__circle');
      const checkPath = paymentSuccess.querySelector('.checkmark__check');

      if (checkCircle && checkPath) {
        checkCircle.style.strokeDashoffset = 157;
        checkPath.style.strokeDashoffset = 50;

        // Force reflow to restart animation
        void checkCircle.offsetWidth;

        checkCircle.style.animation = 'circle-animate 0.6s ease-out forwards';
        checkPath.style.animation = 'check-animate 0.4s ease forwards';
        checkPath.style.animationDelay = '0.6s';
      }

      paymentSuccess.style.display = 'block';
    }

    // Auto-close modal after 2 seconds and record transaction (commented placeholder)
    setTimeout(() => {
      if (paymentModal) paymentModal.style.display = 'none';

      // TODO: Record transaction here — integrate backend API
      // fetch('/api/record-transaction', { method: 'POST', body: JSON.stringify({ /* details */ }) })
    }, 2000);
  });
}

// Cancel button inside step2 to return to step1
const cancelBtn = document.getElementById('cancelBtn');
if (cancelBtn) {
  cancelBtn.addEventListener('click', () => {
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    if (step1 && step2) {
      step2.style.display = 'none';
      step1.style.display = 'block';
    }
  });
}


 

/* ------------------------------
   9. Global Click Handlers
--------------------------------*/
window.onclick = (event) => {
  const payBillsModal = document.getElementById('pay-bills-modal');
  const mainModal = document.getElementById('modal');
  if (event.target === payBillsModal) closePayBillsModal();
  if (event.target === mainModal) closeMainModal();
};

/* ------------------------------
 10. Pay Bills: Dynamic Bill Management
--------------------------------*/
(() => {
  console.log("[Pay Bills] Initializing dynamic bill management");
  const payBillsModal = document.getElementById('pay-bills-modal');
  const paymentModal = document.getElementById('payment-modal');
  const billListContainer = document.getElementById('bill-list-container');
  const modalCompany = document.getElementById('modal-company');
  const modalAccount = document.getElementById('modal-account');
  const modalAmount = document.getElementById('modal-amount');
  const confirmPaymentBtn = document.getElementById('confirm-payment');
  const cancelPaymentBtn = document.getElementById('cancel-payment');
  const closePayBillsBtn = document.getElementById('close-pay-bills');
  const openPayBillsBtn = document.getElementById('open-pay-bills-btn');
const closeBtn = document.getElementById("closeBuyModalBtn");
const buyModal = document.getElementById("newBuyCryptoModal");
const sellModal = document.getElementById("newSellCryptoModal");



  const billsData = {
    utilities: [
      { id: 1, company: 'Ion Electricity', account: '12345678', amount: '$120.00' },
      { id: 2, company: 'Gabes Water Supplier', account: '87654321', amount: '$45.00' }
    ],
    communication: [
      { id: 3, company: 'Internet Provider', account: '11223344', amount: '$60.00' },
      { id: 4, company: 'Mobile Carrier', account: '44332211', amount: '$75.00' }
    ],
    housing: [
      { id: 5, company: 'Mortgage Company', account: '99887766', amount: '$1,200.00' }
    ],
    transportation: [
      { id: 6, company: 'Gas Station', account: '55667788', amount: '$100.00' }
    ],
    financial: [
      { id: 7, company: 'Credit Card', account: '33445566', amount: '$300.00' }
    ]
  };

  function renderBills(category) {
    if (!billListContainer) {
      console.warn("[Pay Bills] bill-list-container not found");
      return;
    }
    billListContainer.innerHTML = "";
    const bills = billsData[category] || [];
    if (bills.length === 0) {
      billListContainer.innerHTML = `<p>No bills found for category "${category}".</p>`;
      return;
    }
    bills.forEach(bill => {
      const div = document.createElement("div");
      div.classList.add("bill");
      div.innerHTML = `
        <h4>${bill.company}</h4>
        <p>Account: ${bill.account}</p>
        <p>Amount Due: ${bill.amount}</p>
        <button class="pay-now-btn" data-bill-id="${bill.id}">Pay Now</button>
      `;
      billListContainer.appendChild(div);

      // Attach click handler for Pay Now button
      div.querySelector(".pay-now-btn").addEventListener("click", (e) => {
        const billId = e.target.getAttribute("data-bill-id");
        openPaymentModal(billId);
      });
    });
  }

  function openPaymentModal(billId) {
    console.log(`[Pay Bills] Opening payment modal for bill ID: ${billId}`);

    const bill = Object.values(billsData)
      .flat()
      .find(b => b.id === parseInt(billId));

    if (!bill) {
      console.warn(`[Pay Bills] Bill with ID ${billId} not found`);
      return;
    }

    if (!paymentModal || !modalCompany || !modalAccount || !modalAmount) {
      console.warn("[Pay Bills] Payment modal elements not found");
      return;
    }

    modalCompany.textContent = bill.company;
    modalAccount.textContent = bill.account;
    modalAmount.textContent = bill.amount;

    paymentModal.style.display = "block";
  }

  function closePaymentModal() {
    console.log("[Pay Bills] Closing payment modal");
    if (paymentModal) paymentModal.style.display = "none";
  }

  function confirmPayment() {
    console.log("[Pay Bills] Confirming payment");

    // Simulate payment processing here
    alert(`Payment to ${modalCompany.textContent} confirmed!`);

    closePaymentModal();
    closePayBillsModal();
  }

  // Event listeners
  if (confirmPaymentBtn) confirmPaymentBtn.addEventListener("click", confirmPayment);
  if (cancelPaymentBtn) cancelPaymentBtn.addEventListener("click", closePaymentModal);
  if (openPayBillsBtn) openPayBillsBtn.addEventListener("click", openPayBillsModal);

  // Initialize default category on modal open
  if (openPayBillsBtn) {
    openPayBillsBtn.addEventListener("click", () => showBillCategory("utilities"));
  }

})();
// Mock conversion rate API call (replace with your real API call)
 

  // Mock account balances (replace with your backend data)
  const accountBalances = {
    checking: 5000,
    savings: 10000,
    credit: 2000
  };

  // =================== Global Variables ===================
let btcRate = 50000; // Default BTC price fallback (in USD)
let currentBalance = 10000; // User's available USD balance for buying BTC
let currentBtcBalance = 1.2345; // User's BTC balance

const purchaseFeeRate = 0.05; // 5% fee
const sellFeeRate = 0.05; // 5% fee

// =================== Elements: Buy ===================
const btcUsdSpan = document.getElementById("btc-usd");
const btcBalanceSpan = document.getElementById("btc-balance");

const buyModal = document.getElementById("newBuyCryptoModal");
const newUsdAmountInput = document.getElementById("newUsdAmount");
const buyFeeAmountEl = document.getElementById("newFeeAmount");
const buyBtcAmountEl = document.getElementById("newBtcAmount");
const buyAccountSelect = document.getElementById("newAccountSelect");
const confirmBuyBtn = document.getElementById("confirmBuyBtn");
const closeBuyModalBtn = document.getElementById("closeBuyModalBtn");

const insufficientFundsPopup = document.getElementById("insufficientFundsPopup");

// =================== Elements: Sell ===================
const sellModal = document.getElementById("newSellCryptoModal");
const sellBtcAmountInput = document.getElementById("newSellBtcAmount");
const sellFeeAmountEl = document.getElementById("newSellFeeAmount");
const sellUsdAmountEl = document.getElementById("newSellUsdAmount");
const sellAccountSelect = document.getElementById("newSellAccountSelect");
const confirmSellBtn = document.getElementById("confirmSellBtn");
const closeSellModalBtn = document.getElementById("closeSellModalBtn");

const insufficientFundsSellPopup = document.getElementById("insufficientFundsSellPopup");

// =================== Load Crypto Prices ===================
function loadCryptoPrices() {
  console.log("[Crypto] Loading BTC price...");

  btcBalanceSpan.textContent = `${currentBtcBalance} BTC`;
  btcUsdSpan.textContent = "Loading...";

  fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd")
    .then(response => response.json())
    .then(data => {
      if (!data.bitcoin?.usd) throw new Error("BTC price data missing");
      btcRate = data.bitcoin.usd;
      btcUsdSpan.textContent = `$${(btcRate * currentBtcBalance).toFixed(2)}`;
      
      // Update buy modal if open
      if (buyModal.style.display === 'flex') {
        newUsdAmountInput.dispatchEvent(new Event('input'));
      }
      // Update sell modal if open
      if (sellModal.style.display === 'flex') {
        sellBtcAmountInput.dispatchEvent(new Event('input'));
      }
    })
    .catch(err => {
      console.error("[Crypto] Error loading BTC price:", err);
      btcUsdSpan.textContent = "Error";
    });
}

// =================== Buy Modal ===================
function openNewBuyCryptoModal() {
  buyModal.style.display = "flex";
}

function resetBuyForm() {
  newUsdAmountInput.value = '';
  buyFeeAmountEl.textContent = '$0.00';
  buyBtcAmountEl.textContent = '0.00000000 BTC';
  buyAccountSelect.value = '';
  insufficientFundsPopup.style.display = 'none';
}

newUsdAmountInput.addEventListener('input', () => {
  const usdAmount = parseFloat(newUsdAmountInput.value);
  if (isNaN(usdAmount) || usdAmount <= 0) {
    buyFeeAmountEl.textContent = '$0.00';
    buyBtcAmountEl.textContent = '0.00000000 BTC';
    return;
  }

  const fee = usdAmount * purchaseFeeRate;
  buyFeeAmountEl.textContent = `$${fee.toFixed(2)}`;

  const btcAmount = (usdAmount - fee) / btcRate;
  buyBtcAmountEl.textContent = `${btcAmount.toFixed(8)} BTC`;
});

confirmBuyBtn.addEventListener('click', () => {
  const usdAmount = parseFloat(newUsdAmountInput.value);
  if (isNaN(usdAmount) || usdAmount <= 0) return;

  const fee = usdAmount * purchaseFeeRate;
  const totalCost = usdAmount;

  if (currentBalance >= totalCost) {
    currentBalance -= totalCost;
    currentBtcBalance += (usdAmount - fee) / btcRate;

    showToast(`Purchase successful! You bought BTC worth $${usdAmount.toFixed(2)} (Fee: $${fee.toFixed(2)})`);
    resetBuyForm();
    buyModal.style.display = 'none';
    loadCryptoPrices();
  } else {
    closePopup();
    insufficientFundsPopup.style.display = 'block';
  }
});

function closePopup() {
  insufficientFundsPopup.style.display = 'none';
}

closeBuyModalBtn.addEventListener('click', () => {
  buyModal.style.display = 'none';
  closePopup();
});

// =================== Sell Modal ===================
function openNewSellCryptoModal() {
  sellModal.style.display = "flex";
}

function resetSellForm() {
  sellBtcAmountInput.value = '';
  sellFeeAmountEl.textContent = '$0.00';
  sellUsdAmountEl.textContent = '0.00 USD';
  sellAccountSelect.value = '';
  insufficientFundsSellPopup.style.display = 'none';
}

sellBtcAmountInput.addEventListener('input', () => {
  const btcAmount = parseFloat(sellBtcAmountInput.value);
  if (isNaN(btcAmount) || btcAmount <= 0) {
    sellFeeAmountEl.textContent = '$0.00';
    sellUsdAmountEl.textContent = '0.00 USD';
    return;
  }

  const usdAmount = btcAmount * btcRate;
  const fee = usdAmount * sellFeeRate;
  sellFeeAmountEl.textContent = `$${fee.toFixed(2)}`;
  sellUsdAmountEl.textContent = `$${(usdAmount - fee).toFixed(2)} USD`;
});

confirmSellBtn.addEventListener('click', () => {
  const btcAmount = parseFloat(sellBtcAmountInput.value);
  if (isNaN(btcAmount) || btcAmount <= 0) return;

  const usdAmount = btcAmount * btcRate;
  const fee = usdAmount * sellFeeRate;

  if (btcAmount <= currentBtcBalance) {
    currentBtcBalance -= btcAmount;
    currentBalance += (usdAmount - fee);

   showToast (`Sale successful! You sold ${btcAmount.toFixed(8)} BTC for $${(usdAmount - fee).toFixed(2)} (Fee: $${fee.toFixed(2)})`);
    resetSellForm();
    sellModal.style.display = 'none';
    loadCryptoPrices();
  } else {
    closeSellPopup();
    insufficientFundsSellPopup.style.display = 'block';
  }
});

function closeSellPopup() {
  insufficientFundsSellPopup.style.display = 'none';
}

closeSellModalBtn.addEventListener('click', () => {
  sellModal.style.display = 'none';
  closeSellPopup();
});

// =================== Initialization ===================
window.addEventListener('load', () => {
  loadCryptoPrices();
});

function openModalswap() {
  const notification = document.getElementById("swapNotification");
  notification.style.display = "block";
}

function closeSwapNotification() {
  const notification = document.getElementById("swapNotification");
  notification.style.display = "none";
}


function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast show';
  setTimeout(() => {
    toast.className = 'toast';
  }, 3000); // Toast visible for 3 seconds
}