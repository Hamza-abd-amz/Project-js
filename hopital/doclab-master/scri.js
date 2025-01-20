// Back to Top Button
const backTopBtn = document.querySelector('.back-top-btn');
window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    backTopBtn.classList.add('active');
  } else {
    backTopBtn.classList.remove('active');
  }
});

// Navbar Toggler
const navToggler = document.querySelectorAll('[data-nav-toggler]');
const overlay = document.querySelector('[data-overlay]');
const navbar = document.querySelector('[data-navbar]');

navToggler.forEach((toggler) => {
  toggler.addEventListener('click', () => {
    navbar.classList.toggle('active');
    overlay.classList.toggle('active');
  });
});

// Form Popup
const form = document.getElementById('appointment-form');
const popup = document.getElementById('confirmation-popup');
const closePopup = document.getElementById('close-popup');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const appointmentDetails = `
    Name: ${formData.get('name')}
    Email: ${formData.get('email')}
    Department: ${formData.get('department')}
    Date: ${formData.get('date')}
    Time: ${formData.get('time')}
  `;
  document.getElementById('appointment-details').innerText = appointmentDetails;
  QRCode.toCanvas(document.getElementById('qrcode'), appointmentDetails);
  popup.classList.remove('hidden');
});

closePopup.addEventListener('click', () => {
  popup.classList.add('hidden');
});
