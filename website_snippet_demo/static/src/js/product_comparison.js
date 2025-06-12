odoo.define('your_module_name.product_comparison', function (require) {
    'use strict';

    const ajax = require('web.ajax');

    const fillProductOptions = async () => {
        try {
            const products = await ajax.jsonRpc('/product_comparison/products', 'call', {});
            const select1 = document.getElementById('product1Select');
            const select2 = document.getElementById('product2Select');

            for (const product of products) {
                const option1 = new Option(product.name, product.id);
                const option2 = new Option(product.name, product.id);
                select1.add(option1);
                select2.add(option2);
            }
        } catch (err) {
            console.error('Error fetching product list:', err);
        }
    };

    const displayProductDetails = async (productId, imageId, detailsId) => {
        if (!productId) return;
        try {
            const product = await ajax.jsonRpc('/product_comparison/product_detail', 'call', {
                product_id: parseInt(productId)
            });

            // Image
            const image = document.getElementById(imageId);
            image.src = product.image_128 ? `data:image/png;base64,${product.image_128}` : '/web/static/src/img/placeholder.png';

            // Specs
            const details = document.getElementById(detailsId);
            details.innerHTML = `
                <p><strong>Specs:</strong></p>
                <ul class="list-unstyled">
                    <li><strong>Name:</strong> ${product.name}</li>
                    <li><strong>Price:</strong> ${product.list_price} ${product.currency}</li>
                    <li><strong>Description:</strong> ${product.description_sale || 'N/A'}</li>
                </ul>
            `;
        } catch (err) {
            console.error('Error fetching product detail:', err);
        }
    };

    const initComparisonSnippet = () => {
        fillProductOptions();

        const select1 = document.getElementById('product1Select');
        const select2 = document.getElementById('product2Select');

        select1?.addEventListener('change', function () {
            displayProductDetails(this.value, 'product1Image', 'product1Details');
        });

        select2?.addEventListener('change', function () {
            displayProductDetails(this.value, 'product2Image', 'product2Details');
        });
    };

    // Wait for DOM ready
    document.addEventListener('DOMContentLoaded', initComparisonSnippet);
});
