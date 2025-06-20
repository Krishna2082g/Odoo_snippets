odoo.define('web_snippet_demo.product_comparison', function (require) {
    'use strict';

    const publicWidget = require('web.public.widget');
    const ajax = require('web.ajax');

    publicWidget.registry.ProductComparison = publicWidget.Widget.extend({
        selector: '.s_comparison_block',

        start: async function () {
            await this.fillProductOptions();

            const product1Select = this.el.querySelector('#product1Select');
            const product2Select = this.el.querySelector('#product2Select');

            if (product1Select) {
                product1Select.addEventListener('change', (e) => {
                    this.displayProductDetails(
                        e.target.value,
                        this.el.querySelector('#product1Image'),
                        this.el.querySelector('#product1Details')
                    );
                });
            }

            if (product2Select) {
                product2Select.addEventListener('change', (e) => {
                    this.displayProductDetails(
                        e.target.value,
                        this.el.querySelector('#product2Image'),
                        this.el.querySelector('#product2Details')
                    );
                });
            }
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
                    // Wrap description inside a <ul> if it isn't already
                    let descriptionHTML = product.description || '<li>No specifications provided.</li>';

                    // Make sure description is inside <ul> for proper styling and centering
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
