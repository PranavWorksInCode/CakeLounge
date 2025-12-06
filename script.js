document.addEventListener('DOMContentLoaded', () => {
    // --- Existing UI Logic ---
    const menuBtn = document.querySelector('.mobile-menu-btn'); // Fixed selector
    const sidebar = document.getElementById('sidebar');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const dropdownBtn = document.querySelector('.dropdown-btn');
    const dropdownContent = document.querySelector('.dropdown-content');
    const menuModal = document.getElementById('menu-modal');
    const closeModalBtn = document.querySelector('.close-modal');
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
    // Dropdown Toggle (Mobile or fallback)
    if (dropdownBtn) {
        dropdownBtn.addEventListener('click', (e) => {
            const href = dropdownBtn.getAttribute('href');
            if (href === '#' || !href) {
                e.preventDefault();
                if (dropdownContent) dropdownContent.classList.toggle('show');
            }
            // If href is a real link, let it navigate
        });
    }

    // Menu Modal Logic
    // We'll modify this to use "Add to Cart" instead of just opening
    window.openModal = function (productName, price) {
        if (menuModal) {
            menuModal.style.display = 'block';
            if (sidebar) sidebar.classList.remove('active');

            if (modalTitle) modalTitle.textContent = productName;
            if (modalPrice) modalPrice.textContent = price || '$0.00';

            // Update the button in the modal to add to cart
            const modalBtn = menuModal.querySelector('.btn-primary');
            if (modalBtn) {
                modalBtn.textContent = 'Add to Cart';
                modalBtn.onclick = (e) => {
                    e.preventDefault();
                    addToCart(productName, parseFloat(price.replace('$', '')) || 0);
                    closeModal();
                    openCart();
                };
            }
        }
    };

    function closeModal() {
        if (menuModal) {
            menuModal.style.display = 'none';
        }
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

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


    // --- Shopping Cart Logic ---

    // 1. Inject Cart Icon into Navbar (Sidebar injection removed)
    const navLinks = document.querySelector('.nav-links');
    if (navLinks && !document.getElementById('cart-btn')) {
        const cartIconHTML = `
        <div class="cart-icon-container" id="cart-btn">
            <svg class="cart-icon" viewBox="0 0 24 24">
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
            <span class="cart-badge" id="cart-count">0</span>
        </div>
        `;
        navLinks.insertAdjacentHTML('beforeend', cartIconHTML);
    }

    // 3. State Management
    let cart = JSON.parse(localStorage.getItem('bakeryCart')) || [];

    const cartBtn = document.getElementById('cart-btn');
    const cartCountEl = document.getElementById('cart-count');

    function saveCart() {
        localStorage.setItem('bakeryCart', JSON.stringify(cart));
        renderCart();
    }

    window.addToCart = function (name, price, quantity = 1) {
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ name, price, quantity: quantity });
        }
        saveCart();
        alert(`${quantity} x ${name} added to cart!`); // Simple feedback
    };

    window.removeFromCart = function (name) {
        cart = cart.filter(item => item.name !== name);
        saveCart();
    };

    window.updateQuantity = function (name, change) {
        const item = cart.find(item => item.name === name);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                removeFromCart(name);
            } else {
                saveCart();
            }
        }
    };

    function renderCart() {
        // Only update the badge count
        let count = 0;
        cart.forEach(item => count += item.quantity);
        if (cartCountEl) cartCountEl.textContent = count;
    }

    function openCart() {
        window.location.href = 'cart.html';
    }

    if (cartBtn) cartBtn.addEventListener('click', openCart);

    // Initial Render
    renderCart();

    // Checkout Page Logic
    const checkoutItems = document.getElementById('checkout-items');
    const checkoutTotal = document.getElementById('checkout-total-amount');
    const checkoutForm = document.getElementById('checkout-form');

    // Cart Page Logic
    const fullCartItems = document.getElementById('full-cart-items');
    const fullCartTotal = document.getElementById('full-cart-total');

    if (checkoutItems && checkoutForm) {
        // We are on checkout page
        let total = 0;
        cart.forEach(item => {
            total += item.price * item.quantity;
            const div = document.createElement('div');
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.style.marginBottom = '10px';
            div.innerHTML = `
                <span>${item.name} x ${item.quantity}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            `;
            checkoutItems.appendChild(div);
        });
        checkoutTotal.textContent = `$${total.toFixed(2)}`;

        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Order placed successfully! Thank you for your purchase.');
            cart = [];
            saveCart();
            window.location.href = 'index.html';
        });
    } else if (fullCartItems && fullCartTotal) {
        // We are on cart page
        function renderFullCart() {
            fullCartItems.innerHTML = '';
            let total = 0;

            if (cart.length === 0) {
                fullCartItems.innerHTML = '<p style="text-align:center; padding: 20px;">Your cart is empty.</p>';
            } else {
                cart.forEach(item => {
                    total += item.price * item.quantity;

                    const itemEl = document.createElement('div');
                    itemEl.className = 'cart-item';
                    itemEl.style.display = 'flex';
                    itemEl.style.alignItems = 'center';
                    itemEl.style.padding = '15px 0';
                    itemEl.style.borderBottom = '1px solid #eee';

                    itemEl.innerHTML = `
                        <div class="cart-item-details" style="flex: 1;">
                            <span class="cart-item-title" style="font-size: 1.1rem; font-weight: bold;">${item.name}</span>
                            <span class="cart-item-price" style="color: var(--color-gold);">$${item.price.toFixed(2)}</span>
                        </div>
                        <div class="cart-item-controls" style="display: flex; align-items: center; gap: 10px;">
                            <button class="qty-btn" onclick="updateQuantity('${item.name}', -1)">-</button>
                            <span class="qty-display">${item.quantity}</span>
                            <button class="qty-btn" onclick="updateQuantity('${item.name}', 1)">+</button>
                            <span class="remove-item" onclick="removeFromCart('${item.name}')" style="margin-left: 15px; cursor: pointer; color: #999;">Remove</span>
                        </div>
                        <div style="margin-left: 20px; font-weight: bold;">
                            $${(item.price * item.quantity).toFixed(2)}
                        </div>
                    `;
                    fullCartItems.appendChild(itemEl);
                });
            }
            fullCartTotal.textContent = `$${total.toFixed(2)}`;
        }

        // Override saveCart to also re-render full cart if on that page
        const originalSaveCart = saveCart;
        saveCart = function () {
            localStorage.setItem('bakeryCart', JSON.stringify(cart));
            renderCart(); // Update sidebar/icon
            renderFullCart(); // Update page
        };

        renderFullCart();
    }

    // --- Product Pop-out Modal Logic ---
    const productModal = document.getElementById('product-modal');
    if (productModal) {
        const modalCloseBtn = productModal.querySelector('.close-modal-btn');
        const modalTitle = productModal.querySelector('.modal-product-title');
        const modalImagePlaceholder = productModal.querySelector('.modal-image-placeholder');
        const modalFlavorSelect = productModal.querySelector('.modal-flavor-select');
        const modalDescription = productModal.querySelector('.modal-flavor-description');
        const modalPrice = productModal.querySelector('.modal-dynamic-price');
        const modalAddToCartBtn = productModal.querySelector('.modal-add-to-cart-btn');
        const modalQuantityInput = productModal.querySelector('#modal-quantity'); // New Quantity Input

        const flavorDescriptions = {
            'vanilla': 'Classic vanilla sponge with smooth buttercream frosting.',
            'chocolate': 'Rich chocolate ganache with moist sponge and dark chocolate shavings.',
            'red-velvet': 'Velvety texture with premium cream cheese frosting.',
            'fruit': 'Fresh seasonal fruits with light cream and vanilla sponge.'
        };

        // Close Modal Functions
        function closeProductModal() {
            productModal.classList.remove('show');
            setTimeout(() => {
                productModal.style.display = 'none';
            }, 300); // Wait for transition
        }

        if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProductModal);
        window.addEventListener('click', (e) => {
            if (e.target === productModal) closeProductModal();
        });

        // Flavor Change Logic
        if (modalFlavorSelect) {
            modalFlavorSelect.addEventListener('change', (e) => {
                const modifier = parseFloat(e.target.selectedOptions[0].dataset.modifier);
                const basePrice = parseFloat(productModal.dataset.basePrice || 0);
                const newPrice = basePrice + modifier;

                if (modalPrice) modalPrice.textContent = `$${newPrice.toFixed(2)}`;

                // Change image color based on flavor (mock)
                const flavor = e.target.value;
                if (modalImagePlaceholder) {
                    if (flavor === 'chocolate') modalImagePlaceholder.style.backgroundColor = '#5D4037';
                    else if (flavor === 'red-velvet') modalImagePlaceholder.style.backgroundColor = '#C62828';
                    else if (flavor === 'fruit') modalImagePlaceholder.style.backgroundColor = '#FFB74D';
                    else modalImagePlaceholder.style.backgroundColor = '#f0e6d2'; // Vanilla
                }

                // Update Description
                if (modalDescription && flavorDescriptions[flavor]) {
                    modalDescription.textContent = flavorDescriptions[flavor];
                }
            });
        }

        // Add to Cart Logic
        if (modalAddToCartBtn) {
            modalAddToCartBtn.addEventListener('click', (e) => {
                e.preventDefault();

                const title = productModal.dataset.productTitle;
                const basePrice = parseFloat(productModal.dataset.basePrice || 0);

                let flavor = '';
                let modifier = 0;

                if (modalFlavorSelect) {
                    flavor = ' - ' + modalFlavorSelect.options[modalFlavorSelect.selectedIndex].text.split(' (')[0];
                    modifier = parseFloat(modalFlavorSelect.selectedOptions[0].dataset.modifier);
                }

                const finalPrice = basePrice + modifier;
                const itemName = `${title}${flavor}`;

                // Get Quantity
                let quantity = 1;
                if (modalQuantityInput) {
                    quantity = parseInt(modalQuantityInput.value) || 1;
                }

                addToCart(itemName, finalPrice, quantity);
                closeProductModal();
            });
        }
    }

    // Attach "Add to Cart" or Modal Open to existing product cards
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        // Check if this is an expandable card (has product-details) - now used for Modal
        const details = card.querySelector('.product-details');

        if (details && productModal) {
            // Pop-out Modal Logic
            card.addEventListener('click', (e) => {
                // Prevent opening if clicking on controls (though card controls are removed now)
                if (e.target.closest('button') || e.target.closest('select')) return;

                const title = card.querySelector('h3')?.textContent;
                const basePrice = parseFloat(card.dataset.basePrice);

                // Populate Modal
                const modalTitle = productModal.querySelector('.modal-product-title');
                const modalPrice = productModal.querySelector('.modal-dynamic-price');
                const modalFlavorSelect = productModal.querySelector('.modal-flavor-select');
                const modalDescription = productModal.querySelector('.modal-flavor-description');
                const modalImagePlaceholder = productModal.querySelector('.modal-image-placeholder');

                const flavorDescriptions = {
                    'vanilla': 'Classic vanilla sponge with smooth buttercream frosting.',
                    'chocolate': 'Rich chocolate ganache with moist sponge and dark chocolate shavings.',
                    'red-velvet': 'Velvety texture with premium cream cheese frosting.',
                    'fruit': 'Fresh seasonal fruits with light cream and vanilla sponge.'
                };

                if (modalTitle) modalTitle.textContent = title;
                if (modalPrice) modalPrice.textContent = `$${basePrice.toFixed(2)}`;

                if (modalFlavorSelect) {
                    modalFlavorSelect.value = 'vanilla'; // Reset to default
                }

                if (modalDescription) modalDescription.textContent = flavorDescriptions['vanilla'];
                if (modalImagePlaceholder) modalImagePlaceholder.style.backgroundColor = '#f0e6d2'; // Reset color

                // Store base price on the modal for calculations
                productModal.dataset.basePrice = basePrice;
                productModal.dataset.productTitle = title;

                // Show Modal
                productModal.style.display = 'flex';
                // Small timeout to allow display:flex to apply before opacity transition
                setTimeout(() => {
                    productModal.classList.add('show');
                }, 10);
            });

        } else {
            // Legacy/Standard Card Logic (for other pages)
            // If the card has data-base-price, it's likely a modal card that just had its details removed.
            // We should NOT add a button to it if it's meant to trigger the modal.
            if (card.hasAttribute('data-base-price')) {
                // It's a modal card, but we removed .product-details.
                // We should attach the modal click listener here as well if it wasn't attached above.
                // Since 'details' is null, the above block didn't run.
                // Let's attach the modal listener here.

                card.addEventListener('click', (e) => {
                    if (e.target.closest('button') || e.target.closest('select')) return;

                    const title = card.querySelector('h3')?.textContent;
                    const basePrice = parseFloat(card.dataset.basePrice);

                    // Populate Modal
                    const modalTitle = productModal.querySelector('.modal-product-title');
                    const modalPrice = productModal.querySelector('.modal-dynamic-price');
                    const modalFlavorSelect = productModal.querySelector('.modal-flavor-select');
                    const modalDescription = productModal.querySelector('.modal-flavor-description');
                    const modalImagePlaceholder = productModal.querySelector('.modal-image-placeholder');
                    const modalQuantityInput = productModal.querySelector('#modal-quantity'); // New Quantity Input

                    const flavorDescriptions = {
                        'vanilla': 'Classic vanilla sponge with smooth buttercream frosting.',
                        'chocolate': 'Rich chocolate ganache with moist sponge and dark chocolate shavings.',
                        'red-velvet': 'Velvety texture with premium cream cheese frosting.',
                        'fruit': 'Fresh seasonal fruits with light cream and vanilla sponge.'
                    };

                    if (modalTitle) modalTitle.textContent = title;
                    if (modalPrice) modalPrice.textContent = `$${basePrice.toFixed(2)}`;

                    if (modalFlavorSelect) {
                        modalFlavorSelect.value = 'vanilla'; // Reset to default
                    }

                    if (modalQuantityInput) {
                        modalQuantityInput.value = 1; // Reset quantity
                    }

                    if (modalDescription) modalDescription.textContent = flavorDescriptions['vanilla'];
                    if (modalImagePlaceholder) modalImagePlaceholder.style.backgroundColor = '#f0e6d2'; // Reset color

                    // Store base price on the modal for calculations
                    productModal.dataset.basePrice = basePrice;
                    productModal.dataset.productTitle = title;

                    // Show Modal
                    productModal.style.display = 'flex';
                    setTimeout(() => {
                        productModal.classList.add('show');
                    }, 10);
                });

                return; // Skip adding legacy button
            }

            const title = card.querySelector('h3')?.textContent;
            const priceText = card.querySelector('.price')?.textContent;
            // Extract price roughly
            const priceMatch = priceText?.match(/\$?(\d+\.?\d*)/);
            const price = priceMatch ? parseFloat(priceMatch[1]) : 10.00; // Default fallback

            let btn = card.querySelector('.btn-primary');
            if (!btn) {
                // If no button, create one
                btn = document.createElement('button');
                btn.className = 'btn-primary';
                btn.textContent = 'Add to Cart';
                btn.style.marginTop = '10px';
                btn.style.width = '100%';
                const info = card.querySelector('.product-info');
                if (info) info.appendChild(btn);
            } else {
                // If button exists (like in index.html modals or similar), update text
                if (btn.tagName === 'A') {
                    // It's a link, let's replace it with a button or prevent default
                    const newBtn = document.createElement('button');
                    newBtn.className = btn.className;
                    newBtn.textContent = 'Add to Cart';
                    btn.parentNode.replaceChild(newBtn, btn);
                    btn = newBtn;
                }
            }

            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addToCart(title, price);
                });
            }
        }
    });
});
