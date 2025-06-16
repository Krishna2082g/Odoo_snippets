odoo.define('web_snippet_demo.product_comparison', function (require) {
    'use strict';

    const publicWidget = require('web.public.widget');
    const ajax = require('web.ajax');

    publicWidget.registry.ProductComparison = publicWidget.Widget.extend({
        selector: '.s_comparison_block',

        start: async function () {
            await this.fillProductOptions();

            // Get elements for product 1
            const product1Select = this.el.querySelector('#product1Select');
            const product1Image = this.el.querySelector('#product1Image');
            const product1Details = this.el.querySelector('#product1Details');
            const product1Placeholder = this.createPlaceholder(product1Image);

            // Get elements for product 2
            const product2Select = this.el.querySelector('#product2Select');
            const product2Image = this.el.querySelector('#product2Image');
            const product2Details = this.el.querySelector('#product2Details');
            const product2Placeholder = this.createPlaceholder(product2Image);

            // Product 1 change listener
            if (product1Select) {
                product1Select.addEventListener('change', (e) => {
                    const val = e.target.value;
                    if (!val) {
                        // No product selected: show placeholder, hide image and clear details
                        product1Placeholder.style.display = 'block';
                        product1Image.classList.add('d-none');
                        product1Image.src = '';
                        product1Details.innerHTML = '<p><strong>Specs:</strong></p>';
                    } else {
                        product1Placeholder.style.display = 'none';
                        product1Image.classList.remove('d-none');
                        this.displayProductDetails(val, product1Image, product1Details);
                    }
                });
            }

            // Product 2 change listener
            if (product2Select) {
                product2Select.addEventListener('change', (e) => {
                    const val = e.target.value;
                    if (!val) {
                        // No product selected: show placeholder, hide image and clear details
                        product2Placeholder.style.display = 'block';
                        product2Image.classList.add('d-none');
                        product2Image.src = '';
                        product2Details.innerHTML = '<p><strong>Specs:</strong></p>';
                    } else {
                        product2Placeholder.style.display = 'none';
                        product2Image.classList.remove('d-none');
                        this.displayProductDetails(val, product2Image, product2Details);
                    }
                });
            }
        },

        // Utility to create a placeholder div next to the image element if not present
        createPlaceholder: function (imageEl) {
            if (!imageEl) return null;
            let placeholder = imageEl.parentElement.querySelector('.please-select-placeholder');
            if (!placeholder) {
                placeholder = document.createElement('div');
                placeholder.className = 'please-select-placeholder text-center text-muted mb-3';
                placeholder.style.cssText = 'max-height:200px; line-height:200px; border: 1px dashed #ccc; border-radius: 8px;';
                placeholder.textContent = 'Please select the product';
                imageEl.parentElement.insertBefore(placeholder, imageEl);
            }
            // Initially show placeholder and hide image
            placeholder.style.display = 'block';
            imageEl.classList.add('d-none');
            return placeholder;
        },

        fillProductOptions: async function () {
            try {
                const products = await ajax.jsonRpc('/product_comparison/products', 'call', {});
                const select1 = this.el.querySelector('#product1Select');
                const select2 = this.el.querySelector('#product2Select');

                if (select1 && select2) {
                    for (const product of products) {
                        const option1 = new Option(product.name, product.id);
                        const option2 = new Option(product.name, product.id);
                        select1.add(option1);
                        select2.add(option2);
                    }
                }
            } catch (err) {
                console.error('Error fetching product list:', err);
            }
        },

        displayProductDetails: async function (productId, imageEl, detailsEl) {
            if (!productId) return;
            try {
                const product = await ajax.jsonRpc('/product_comparison/product_detail', 'call', {
                    product_id: parseInt(productId)
                });

                if (imageEl) {
                    imageEl.src = product.image_128
                        ? `data:image/png;base64,${product.image_128}`
                        : '/web/static/src/img/placeholder.png';
                }

                if (detailsEl) {
                    let descriptionHTML = product.description || '<li>No specifications provided.</li>';
                    if (!descriptionHTML.trim().startsWith('<ul')) {
                        descriptionHTML = `<ul>${descriptionHTML}</ul>`;
                    }
                    detailsEl.innerHTML = `
                        <div class="specs-list">
                            <h4>${product.name}</h4>
                            ${descriptionHTML}
                        </div>
                    `;
                }
            } catch (err) {
                console.error('Error fetching product detail:', err);
            }
        }

    });
});
