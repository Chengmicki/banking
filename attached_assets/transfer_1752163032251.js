// Always start at top when page loads
window.addEventListener('load', () => window.scrollTo(0, 0));

// Count-up helper: Animate number counting up to a value in given element
function animateCountUp(el, value) {
  const duration = 1500, startTime = performance.now();
  function update(now) {
    const prog = Math.min((now - startTime) / duration, 1);
    el.textContent = `$${(value * prog).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (prog < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function simulateTransfer(amount) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const random = Math.random();

      if (random > 0.8) {  // 20% failure chance
        if (random > 0.9) {
          reject('Insufficient funds');
        } else {
          reject('Transfer failed. Please try again.');
        }
      } else {
        resolve('Transfer successful!');
      }
    }, 500);
  });
}


// Focus trap for modal accessibility
function trapFocus(modal) {
  const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusable.length === 0) return;
  let first = focusable[0], last = focusable[focusable.length - 1];

  modal.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    } else if (e.key === 'Escape') {
      // Close modal on Escape key
      if (!modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
        // Reset pin modal inputs if it's the pin modal
        if (modal.id === 'pin-modal') {
          const pinInput = modal.querySelector('#pin-input');
          const pinError = modal.querySelector('#pin-error');
          pinInput.value = '';
          pinError.textContent = '';
        }
      }
    }
  });
}

// Close review modal utility
function closeModal() {
  const modal = document.getElementById('review-modal');
  modal.classList.add('hidden');
  document.body.removeEventListener('click', outsideClickListener);
}

// Outside click listener variable (global to allow add/remove)
let outsideClickListener;

// --- 1. Existing Notification utility to show messages ---
function showNotification(type, message) {
  const notif = document.getElementById('transfer-notification');
  const successIcon = notif.querySelector('.success-icon');
  const errorIcon = notif.querySelector('.error-icon');
  const msgEl = document.getElementById('notification-message');

  notif.className = 'notification show ' + type; // show + type class
  msgEl.textContent = message;

  if (type === 'success') {
    successIcon.style.display = 'block';
    errorIcon.style.display = 'none';
  } else {
    successIcon.style.display = 'none';
    errorIcon.style.display = 'block';
  }

  // Hide after 4 seconds
  setTimeout(() => {
    notif.classList.remove('show');
  }, 4000);
}

// --- 2. New function: showSuccessNotification with animation reset for checkmark SVG ---
function showSuccessNotification(message) {
  const notif = document.getElementById('transfer-notification');
  const checkCircle = notif.querySelector('.check-circle');
  const checkCheck = notif.querySelector('.check-check');
  const successIcon = notif.querySelector('.success-icon');
  const errorIcon = notif.querySelector('.error-icon');
  const msg = document.getElementById('notification-message');

  // Update message text
  msg.textContent = message;

  // Show success icon, hide error icon
  successIcon.style.display = 'block';
  errorIcon.style.display = 'none';

  // Make notification visible and add success class
  notif.className = 'notification show success';

  // Reset the animation by removing and re-adding the CSS animation property
  checkCircle.style.animation = 'none';
  checkCheck.style.animation = 'none';

  // Trigger reflow to restart animation
  void checkCircle.offsetWidth;
  void checkCheck.offsetWidth;

  // Reapply animation CSS rules (ensure these CSS keyframes exist in your CSS)
  checkCircle.style.animation = 'dash-circle 0.6s forwards ease-in-out';
  checkCheck.style.animation = 'dash-check 0.4s 0.6s forwards ease-in-out';

  // Hide notification after 4 seconds
  setTimeout(() => {
    notif.classList.remove('show');
  }, 4000);
}

document.addEventListener('DOMContentLoaded', () => {
  // Cache DOM elements
  const form       = document.getElementById('transfer-form');
  const fromAcc    = document.getElementById('from-account');
  const toAcc      = document.getElementById('to-account');
  const extDetails = document.getElementById('external-details');
  const extAcc     = document.getElementById('external-account');
  const amount     = document.getElementById('transfer-amount');
  const typeRadios = document.getElementsByName('type');
  const schedOpts  = document.getElementById('schedule-options');
  const schedDate  = document.getElementById('schedule-date');
  const recurChk   = document.getElementById('recurring');
  const recurFreq  = document.getElementById('recurrence-frequency');
  const notes      = document.getElementById('transfer-notes');
  const reviewBtn  = document.getElementById('review-transfer');
  const modal      = document.getElementById('review-modal');
  const confirmBtn = document.getElementById('confirm-transfer');
  const cancelBtn  = document.getElementById('cancel-transfer');
  const feedback   = document.getElementById('transfer-feedback');
  const recentList = document.querySelector('.recent-transfers');
  const pinModal   = document.getElementById('pin-modal');
  const pinInput   = document.getElementById('pin-input');
  const pinError   = document.getElementById('pin-error');
  const pinCancel  = document.getElementById('pin-cancel');
  const pinConfirm = document.getElementById('pin-confirm');

  // Load draft from localStorage and populate fields if present
  const draft = JSON.parse(localStorage.getItem('transferDraft') || '{}');
  if (draft.from) fromAcc.value = draft.from;
  if (draft.to)   toAcc.value   = draft.to;
  if (draft.ext)  extAcc.value  = draft.ext;
  if (draft.amt)  amount.value  = draft.amt;
  if (draft.type) {
    const radio = Array.from(typeRadios).find(r => r.value === draft.type);
    if (radio) radio.checked = true;
  }
  if (draft.date) { schedDate.value = draft.date; schedOpts.classList.remove('hidden'); }
  if (draft.recur) { recurChk.checked = true; recurFreq.classList.remove('hidden'); }
  if (draft.freq)  recurFreq.value = draft.freq;
  if (draft.notes) notes.value = draft.notes;

  // Save draft on input change for these fields
  [fromAcc, toAcc, extAcc, amount, schedDate, recurFreq, notes].forEach(el => {
    el.addEventListener('input', () => {
      const d = {
        from: fromAcc.value,
        to: toAcc.value,
        ext: extAcc.value,
        amt: amount.value,
        type: document.querySelector('input[name="type"]:checked')?.value,
        date: schedDate.value,
        recur: recurChk.checked,
        freq: recurFreq.value,
        notes: notes.value
      };
      localStorage.setItem('transferDraft', JSON.stringify(d));
    });
  });

  // Toggle external account details visibility when "to-account" changes
  toAcc.addEventListener('change', () => {
    extDetails.classList.toggle('hidden', toAcc.value !== 'external-bank');
  });

  // Toggle schedule options visibility depending on selected transfer type
  Array.from(typeRadios).forEach(radio => {
    radio.addEventListener('change', () => {
      schedOpts.classList.toggle('hidden', radio.value !== 'scheduled');
    });
  });

  // Toggle recurring frequency input visibility
  recurChk.addEventListener('change', () => {
    recurFreq.classList.toggle('hidden', !recurChk.checked);
  });

  // Validation helper functions
  function showError(id, msg) {
    document.getElementById('error-' + id).textContent = msg;
  }
  function clearError(id) {
    document.getElementById('error-' + id).textContent = '';
  }

  function validateForm() {
    let ok = true;

    if (!fromAcc.value) {
      showError('from-account', 'Required');
      ok = false;
    } else clearError('from-account');

    if (!toAcc.value) {
      showError('to-account', 'Required');
      ok = false;
    } else clearError('to-account');

    if (toAcc.value === 'external-bank' && !extAcc.value) {
      showError('external-account', 'Required');
      ok = false;
    } else clearError('external-account');

    if (!parseFloat(amount.value)) {
      showError('amount', 'Enter valid amount');
      ok = false;
    } else clearError('amount');

    if (!schedOpts.classList.contains('hidden') && !schedDate.value) {
      showError('schedule-date', 'Select date');
      ok = false;
    } else clearError('schedule-date');

    if (recurChk.checked && !recurFreq.value) {
      showError('recurrence-frequency', 'Choose frequency');
      ok = false;
    } else clearError('recurrence-frequency');

    return ok;
  }

  // Review button: Validate form, show review modal, trap focus, add outside click listener
  reviewBtn.addEventListener('click', () => {
    if (!validateForm()) return;

    document.getElementById('review-from').textContent = fromAcc.options[fromAcc.selectedIndex].text;
    document.getElementById('review-to').textContent =
      toAcc.options[toAcc.selectedIndex].text + (toAcc.value === 'external-bank' ? ` - ${extAcc.value}` : '');
    document.getElementById('review-amount').textContent = '$' + parseFloat(amount.value).toFixed(2);
    document.getElementById('review-date').textContent = schedDate.value || 'Now';
    document.getElementById('review-recurrence').textContent = recurChk.checked ? recurFreq.value : 'None';
    document.getElementById('review-notes').textContent = notes.value || '-';

    modal.classList.remove('hidden');
    trapFocus(modal);

    setTimeout(() => {
      outsideClickListener = e => {
        if (!modal.querySelector('.modal-content').contains(e.target)) closeModal();
      };
      document.body.addEventListener('click', outsideClickListener);
    }, 0);
  });

  // Confirm transfer button: hide review modal, show PIN modal, trap focus
  confirmBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    pinModal.classList.remove('hidden');
    pinInput.focus();
    trapFocus(pinModal);
  });

  // Cancel PIN modal: hide and reset inputs
  pinCancel.addEventListener('click', () => {
    pinModal.classList.add('hidden');
    pinInput.value = '';
    pinError.textContent = '';
  });

  // PIN Confirm button: validate PIN, simulate transfer success/failure, show notification, update UI
  pinConfirm.addEventListener('click', () => {
  const pin = pinInput.value.trim();

  if (!/^\d{4}$/.test(pin)) {
    pinError.textContent = 'PIN must be exactly 4 digits.';
    return;
  }

  pinModal.classList.add('hidden');
  pinInput.value = '';
  pinError.textContent = '';

  // Call simulateTransfer with the amount, handle success/failure
  simulateTransfer(parseFloat(amount.value))
    .then(message => {
      showSuccessNotification(message);

      // Add to recent transfers list
      const li = document.createElement('li');
      li.textContent = `📤 $${parseFloat(amount.value).toFixed(2)} → ${toAcc.options[toAcc.selectedIndex].text}`;
      recentList.prepend(li);

      // Reset form and UI
      form.reset();
      extDetails.classList.add('hidden');
      schedOpts.classList.add('hidden');
      recurFreq.classList.add('hidden');
      localStorage.removeItem('transferDraft');

      feedback.textContent = '';
    })
    .catch(errorMsg => {
      if (errorMsg === 'Insufficient funds') {
        showNotification('error', 'Insufficient funds. Please check your balance.');
      } else {
        showNotification('error', errorMsg || 'Transfer failed. Please try again.');
      }
    });
  });
  });