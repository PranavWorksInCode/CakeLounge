document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const dropdownBtn = document.querySelector('.dropdown-btn');
    const dropdownContent = document.querySelector('.dropdown-content');
    const menuModal = document.getElementById('menu-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const productLinks = document.querySelectorAll('.dropdown-content a');
    const modalTitle = document.getElementById('modal-title');
    const modalPrice = document.getElementById('modal-price');

    // Sidebar Toggle
    function toggleSidebar() {
        if (sidebar) sidebar.classList.toggle('active');
    }

    if (menuBtn) menuBtn.addEventListener('click', toggleSidebar);
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', toggleSidebar);

    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (sidebar && sidebar.classList.contains('active') &&
            !sidebar.contains(e.target) &&
            menuBtn && !menuBtn.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });

    // Dropdown Toggle
    if (dropdownBtn) {
        dropdownBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (dropdownContent) dropdownContent.classList.toggle('show');
        });
    }

    // Menu Modal Logic
    function openModal(productName) {
        if (menuModal) {
            menuModal.style.display = 'block';
            if (sidebar) sidebar.classList.remove('active');

            // Set product details
            if (modalTitle) modalTitle.textContent = productName;

            // Mock price based on product name length for demo
            const price = (productName.length * 0.5 + 3).toFixed(2);
            if (modalPrice) modalPrice.textContent = `$${price}`;
        }
    }

    function closeModal() {
        if (menuModal) {
            menuModal.style.display = 'none';
        }
    }



    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (menuModal && e.target == menuModal) {
            closeModal();
        }
    });

    // Scroll Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');
    animatedElements.forEach(el => observer.observe(el));
});
