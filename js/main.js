/**
 * Luxtril - Interactive Scripts
 * Particle background, countdown timer, notifications, form handlers
 */

document.addEventListener('DOMContentLoaded', () => {
  initParticleBackground();
  initCountdown();
  initSubscriptionForm();
  initPolicyToc();
  initAccountDeletionForm();
});

// Toast notification helper
function showToast(message, isSuccess = true) {
  let toast = document.getElementById('toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'toast-msg';
    document.body.appendChild(toast);
  }
  
  toast.innerHTML = `
    <span style="font-size: 1.2rem;">${isSuccess ? '✨' : '⚠️'}</span>
    <span>${message}</span>
  `;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// Global copy helper
window.copyToClipboard = function(text, label = 'Copied to clipboard!') {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(label);
    }).catch(() => {
      fallbackCopy(text, label);
    });
  } else {
    fallbackCopy(text, label);
  }
};

function fallbackCopy(text, label) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(label);
  } catch (err) {
    alert('Copy: ' + text);
  }
  document.body.removeChild(textArea);
}

/* ==========================================================================
   AMBIENT GOLD PARTICLE BACKGROUND
   ========================================================================== */
function initParticleBackground() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  const particleCount = Math.min(Math.floor(window.innerWidth / 18), 70);

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.6 + 0.4,
      alpha: Math.random() * 0.7 + 0.2,
      speedX: (Math.random() - 0.5) * 0.25,
      speedY: -(Math.random() * 0.4 + 0.1),
      maxAlpha: Math.random() * 0.8 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.005
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let p of particles) {
      p.x += p.speedX;
      p.y += p.speedY;
      p.alpha += p.pulseSpeed;

      if (p.alpha > p.maxAlpha || p.alpha < 0.1) {
        p.pulseSpeed = -p.pulseSpeed;
      }

      if (p.y < 0) {
        p.y = height;
        p.x = Math.random() * width;
      }
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(243, 202, 85, ${Math.max(0, p.alpha)})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(212, 175, 55, 0.4)';
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  draw();
}

/* ==========================================================================
   COUNTDOWN TIMER
   ========================================================================== */
function initCountdown() {
  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-mins');
  const secsEl = document.getElementById('cd-secs');

  if (!daysEl) return;

  // Target launch date: 30 days from now or fixed future date
  let launchDate = new Date();
  launchDate.setDate(launchDate.getDate() + 28);
  launchDate.setHours(12, 0, 0, 0);

  function updateTimer() {
    const now = new Date().getTime();
    const distance = launchDate.getTime() - now;

    if (distance < 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minsEl.textContent = '00';
      secsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minsEl.textContent = String(minutes).padStart(2, '0');
    secsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/* ==========================================================================
   SUBSCRIPTION / NOTIFY ME FORM
   ========================================================================== */
function initSubscriptionForm() {
  const form = document.getElementById('notify-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = form.querySelector('input[type="email"]');
    const email = emailInput ? emailInput.value.trim() : '';

    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.', false);
      return;
    }

    // Save to localStorage for demo persistence
    try {
      const subscribers = JSON.parse(localStorage.getItem('luxtril_subscribers') || '[]');
      if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem('luxtril_subscribers', JSON.stringify(subscribers));
      }
    } catch (e) {}

    showToast(`Thank you! We'll notify ${email} at launch!`, true);
    emailInput.value = '';
  });
}

/* ==========================================================================
   PRIVACY POLICY TABLE OF CONTENTS ACTIVE TRACKING
   ========================================================================== */
function initPolicyToc() {
  const sections = document.querySelectorAll('.policy-section');
  const navLinks = document.querySelectorAll('.toc-nav a');

  if (!sections.length || !navLinks.length) return;

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 140;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (currentId && link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   ACCOUNT DELETION REQUEST FORM
   ========================================================================== */
function initAccountDeletionForm() {
  const form = document.getElementById('account-deletion-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('del-email')?.value.trim();
    const phone = document.getElementById('del-phone')?.value.trim();
    const reason = document.getElementById('del-reason')?.value.trim();

    if (!email) {
      showToast('Please provide your registered account email.', false);
      return;
    }

    const subject = encodeURIComponent(`Luxtril Account & Data Deletion Request - ${email}`);
    const body = encodeURIComponent(
      `Hello Luxtril Privacy Team,\n\nI hereby request the permanent deletion of my Luxtril account and all associated personal data.\n\nAccount Details:\n- Registered Email: ${email}\n- Phone: ${phone || 'N/A'}\n- Reason / Notes: ${reason || 'User requested account closure'}\n\nPlease confirm when deletion is complete.\n\nThank you.`
    );

    window.location.href = `mailto:privacy@luxtril.com?subject=${subject}&body=${body}`;

    showToast('Deletion request created! Opening your mail client...', true);
  });
}
