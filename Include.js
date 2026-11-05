/* assets/js/include.js
   Gives you two functions: loadHeader() and loadFooter() */

async function loadPart(id, url) {
  const el = document.getElementById(id);
  if (!el) return;
  try {
    const res = await fetch(url);
    el.innerHTML = await res.text();
  } catch (e) {
    console.error('Could not load ' + url, e);
  }
}

async function loadHeader() {
  await loadPart('site-header', '/partials/header.html');

  // navbar shadow on scroll
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  // country selector
  document.querySelectorAll('.country-option').forEach((opt) => {
    opt.addEventListener('click', function (e) {
      e.preventDefault();
      document.getElementById('current-flag').textContent = this.dataset.flag;
      document.getElementById('current-country').textContent = this.dataset.country;
      const href = this.getAttribute('href');
      setTimeout(() => (window.location.href = href), 200);
    });
  });
}

async function loadFooter() {
  await loadPart('site-footer', '/partials/footer.html');
}
