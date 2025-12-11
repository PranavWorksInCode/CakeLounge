
// Initialize Square Payment
async function initializeCard(payments) {
    const card = await payments.card();
    await card.attach('#card-container');
    return card;
}

document.addEventListener('DOMContentLoaded', async () => {
    // Check if we are on the checkout page by looking for the card container
    if (!document.getElementById('card-container')) return;

    // Use your Sandbox Application ID
    const appId = 'sandbox-sq0idb-YOUR_APP_ID'; // REPLACE THIS WITH YOUR APP ID
    const locationId = 'YOUR_LOCATION_ID'; // REPLACE THIS WITH YOUR LOCATION ID

    if (!window.Square) {
        throw new Error('Square.js failed to load properly');
    }

    let payments;
    try {
        payments = window.Square.payments(appId, locationId);
    } catch {
        const errorDiv = document.getElementById('card-container');
        errorDiv.innerHTML = '<p style="color:red">Failed to initialize payment system. Check App ID.</p>';
        return;
    }

    let card;
    try {
        card = await initializeCard(payments);
    } catch (e) {
        console.error('Initializing Card failed', e);
        return;
    }

    const form = document.getElementById('checkout-form');
    // Remove the default submit listener from script.js if possible, or we stop propagation here
    // script.js likely adds a submit listener. We need to handle it first.

    // We can clone the form to remove old event listeners if necessary, but script.js listener calls preventDefault() 
    // and then alerts success. We want to override that.

    // Simplest way: The script.js listener is already attached. 
    // We can overwrite the form's onsubmit property or add a listener that runs BEFORE script.js? 
    // DOM level 2 listeners fire in order. script.js loaded after payment.js but listeners added on DOMContentLoaded.
    // If we handle the SUBMIT button click instead of form submit, we might catch it earlier.

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.addEventListener('click', async (event) => {
        event.preventDefault(); // Stop form submission
        event.stopPropagation();

        // 1. Validate Form (basic)
        const name = document.getElementById('name').value;
        if (!name) { alert('Please enter your name'); return; }

        // 2. Tokenize Card
        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';

            const result = await card.tokenize();
            if (result.status === 'OK') {
                // 3. Send token to backend
                await processPayment(result.token);
            } else {
                let errorMessage = `Tokenization failed with status: ${result.status}`;
                if (result.errors) {
                    errorMessage += ` and errors: ${JSON.stringify(result.errors)}`;
                }
                alert(errorMessage);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Place Order';
            }
        } catch (e) {
            console.error(e);
            alert('Payment processing failed.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Place Order';
        }
    });
});

async function processPayment(token) {
    // Calculate total from cart or DOM
    // For safety, backend should recalculate, but for this demo we'll send it
    const totalEl = document.getElementById('checkout-total-amount');
    const amountString = totalEl.textContent.replace('$', '');
    const amount = parseFloat(amountString);

    if (isNaN(amount) || amount <= 0) {
        alert('Invalid order amount');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/process-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sourceId: token,
                amount: amount,
            }),
        });

        const data = await response.json();

        if (data.success) {
            alert('Payment Successful!');
            // Clear cart
            localStorage.setItem('bakeryCart', '[]');
            window.location.href = 'index.html';
        } else {
            alert('Payment Failed: ' + data.error);
            document.querySelector('button[type="submit"]').disabled = false;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Network error processing payment');
    }
}
