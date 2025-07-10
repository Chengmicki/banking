// Always start at top on load/refresh
window.scrollTo(0, 0);
window.onbeforeunload = () => window.scrollTo(0, 0);

// Count-up Animation function (reusable)
function animateCountUp(element, value) {
  const duration = 1500;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const current = value * progress;
    element.textContent = `$${current.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Sidebar toggle
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar    = document.getElementById('sidebar');

  menuToggle.addEventListener('click', e => {
    e.stopPropagation();
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isExpanded));
    sidebar.classList.toggle('show');
    document.body.classList.toggle('sidebar-open');
  });

  // Close sidebar when clicking outside
  document.body.addEventListener('click', e => {
    if (
      document.body.classList.contains('sidebar-open') &&
      !sidebar.contains(e.target) &&
      e.target !== menuToggle
    ) {
      sidebar.classList.remove('show');
      document.body.classList.remove('sidebar-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Animate Balances count-up
  document.querySelectorAll('.card p').forEach(el => {
    const raw   = el.textContent.replace(/[^0-9\.-]/g, '');
    const value = parseFloat(raw);
    if (!isNaN(value)) animateCountUp(el, value);
  });

  // Animate Transactions (fade/slide)
  document.querySelectorAll('.transactions li').forEach((item, idx) => {
    item.style.opacity   = 0;
    item.style.transform = 'translateY(20px)';
    setTimeout(() => {
      item.style.transition  = 'opacity 0.6s ease, transform 0.6s ease';
      item.style.opacity     = 1;
      item.style.transform   = 'translateY(0)';
    }, 300 + idx * 150);
  });

  // Animate Quick Action Buttons
  document.querySelectorAll('.quick-actions button').forEach((btn, idx) => {
    btn.style.opacity   = 0;
    btn.style.transform = 'scale(0.8)';
    setTimeout(() => {
      btn.style.transition  = 'opacity 0.5s ease, transform 0.5s ease';
      btn.style.opacity     = 1;
      btn.style.transform   = 'scale(1)';
    }, 300 + idx * 200);
  });

  // Notification Dropdown setup
  const notificationButton   = document.getElementById('notification-button');
  const notificationDropdown = document.getElementById('notification-dropdown');
  const notificationList     = document.getElementById('notification-list');
  const notificationCount    = document.getElementById('notification-count');

  // Sample notifications (backend can replace this array)
  let notifications = [
    { id: 1, text: 'Your payment of $250 was successful.', date: 'May 28' },
    { id: 2, text: 'New login from unknown device.',   date: 'May 27' },
    { id: 3, text: 'Credit card statement available.',  date: 'May 26' },
    { id: 4, text: 'Loan payment due in 3 days.',       date: 'May 25' }
  ];

  function updateNotifications(notifs) {
    const latest = notifs.slice(0, 3); // last 3
    notificationList.innerHTML = '';   // clear old

    latest.forEach(n => {
      const li         = document.createElement('li');
      const msgSpan    = document.createElement('span');
      const dateSpan   = document.createElement('span');
      msgSpan.className  = 'message';
      dateSpan.className = 'date';
      msgSpan.textContent  = n.text;
      dateSpan.textContent = n.date;
      li.appendChild(msgSpan);
      li.appendChild(dateSpan);
      notificationList.appendChild(li);
    });

    // update badge
    const count = notifs.length;
    notificationCount.textContent = count > 99 ? '99+' : count;
    notificationCount.style.display = count > 0 ? 'inline-block' : 'none';
  }

  // initial render
  updateNotifications(notifications);

  // Toggle dropdown
  notificationButton.addEventListener('click', e => {
    e.stopPropagation();
    const expanded = notificationButton.getAttribute('aria-expanded') === 'true';
    notificationDropdown.hidden = expanded;
    notificationButton.setAttribute('aria-expanded', String(!expanded));
  });

  // Close dropdown on outside click
  document.addEventListener('click', e => {
    if (
      !notificationDropdown.contains(e.target) &&
      e.target !== notificationButton
    ) {
      notificationDropdown.hidden = true;
      notificationButton.setAttribute('aria-expanded', 'false');
    }
  });

  // Expose for backend simulation
  window.addNotification = notif => {
    notifications.unshift(notif);
    updateNotifications(notifications);
  };
});

// Card hover effects
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transition  = 'transform 0.3s ease, box-shadow 0.3s ease';
    card.style.transform   = 'scale(1.03)';
    card.style.boxShadow   = '0 0.8em 1.2em rgba(0,102,204,0.2)';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform   = 'scale(1)';
    card.style.boxShadow   = '0 0.2em 0.4em rgba(0,0,0,0.05)';
  });
});

// Preloader hide on full load
window.addEventListener('load', () => {
  window.scrollTo(0, 0); // ensure top on load
  const preloader = document.getElementById('preloader');
  if (preloader) {
    preloader.classList.add('hidden');
    setTimeout(() => preloader.remove(), 600);
  }
});



// Verification modal controls
function openVerificationModal() {
  document.getElementById('verificationModal').hidden = false;
}
function closeVerificationModal() {
  document.getElementById('verificationModal').hidden = true;
}
function upgradeLevel() {
  alert('Redirecting to upgrade page...');
  // window.location.href = "/upgrade"; // Uncomment and customize
}

// Optional: load verification from backend/API and update badge & modal text
// function getIcon(level) {
//   const icons = {
//     Basic: "🔰",
//     Verified: "🛡️",
//     Gold: "💳",
//     Platinum: "💎"
//   };
//   return icons[level] || "🛡️";
// }
// Example fetch code here...
















