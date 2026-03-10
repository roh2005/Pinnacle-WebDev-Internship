// DOM Elements
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
const filterBtns = document.querySelectorAll('.filter-btn');
const menuItems = document.querySelectorAll('.menu-item');
const resForm = document.getElementById('reservation-form');
const formSuccess = document.getElementById('form-success');

// Sticky Navbar Background on Scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile Menu Toggle
hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    // Change icon from bars to times
    const icon = hamburger.querySelector('i');
    if (navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-xmark');
    } else {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
    }
});

// Close mobile menu when a link is clicked
const navItems = document.querySelectorAll('.nav-links li a');
navItems.forEach(item => {
    item.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = hamburger.querySelector('i');
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
    });
});

// Menu Filtering Logic (CodSoft Requirement)
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        filterBtns.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');

        menuItems.forEach(item => {
            // Apply a slight fade out effect before hiding
            item.style.opacity = '0';

            setTimeout(() => {
                if (filterValue === 'all' || item.classList.contains(filterValue)) {
                    item.classList.remove('hidden');
                    // Small delay to allow display block to apply before fading in
                    setTimeout(() => {
                        item.style.opacity = '1';
                    }, 50);
                } else {
                    item.classList.add('hidden');
                }
            }, 300); // 300ms matches the CSS transition time
        });
    });
});

// Reservation Form Handling
resForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // In a real app, this is where we would send data to a backend server.
    // For this frontend task, we simulate a successful booking.

    // Get form values for potential use
    const name = document.getElementById('name').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;

    // Disable submit button during "processing"
    const submitBtn = resForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;

    // Simulate API call delay
    setTimeout(() => {
        // Hide form fields
        const formRows = resForm.querySelectorAll('.form-row');
        formRows.forEach(row => row.style.display = 'none');

        // Hide submit button
        submitBtn.style.display = 'none';

        // Show success message
        formSuccess.classList.remove('hidden');

        // Optionally personalize the success message
        formSuccess.innerHTML = `<i class="fa-solid fa-circle-check"></i> Thank you, ${name}! Your reservation for ${date} at ${time} has been confirmed. We look forward to serving you.`;

    }, 1500);
});

// Set minimum date for reservation to today
const dateInput = document.getElementById('date');
if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
}
