odoo.define('web_snippet_demo.product_comparison', function (require) {
    'use strict';

    const publicWidget = require('web.public.widget');
    const ajax = require('web.ajax');

    publicWidget.registry.ProductComparison = publicWidget.Widget.extend({
        selector: '.s_comparison_block',

        /**
         * Lifecycle hook: called automatically when the widget starts
         */
        async start() {
            await this._super(...arguments);
            await this.fillProductOptions();

            this._bindProductChange('#product1Select', '#product1Image', '#product1Details');
            this._bindProductChange('#product2Select', '#product2Image', '#product2Details');
        },

        /**
         * Create a placeholder for when no product is selected
         */
        createPlaceholder(imageEl) {
            if (!imageEl) return null;

            let placeholder = imageEl.parentElement.querySelector('.please-select-placeholder');
            if (!placeholder) {
                placeholder = document.createElement('div');
                placeholder.className = 'please-select-placeholder text-center text-muted mb-3';
                placeholder.style.cssText = `
                    max-height:200px;
                    line-height:200px;
                    border: 1px dashed #ccc;
                    border-radius: 8px;
                `;
                placeholder.textContent = 'Please select the product';
                imageEl.parentElement.insertBefore(placeholder, imageEl);
            }

            placeholder.style.display = 'block';
            imageEl.classList.add('d-none');
            return placeholder;
        },

        /**
         * Binds change event to a select box for product updates
         */
        _bindProductChange(selectSelector, imageSelector, detailSelector) {
            const selectEl = this.el.querySelector(selectSelector);
            const imageEl = this.el.querySelector(imageSelector);
            const detailEl = this.el.querySelector(detailSelector);
            const placeholder = this.createPlaceholder(imageEl);

            if (selectEl) {
                selectEl.addEventListener('change', (e) => {
                    const val = e.target.value;
                    if (!val) {
                        placeholder.style.display = 'block';
                        imageEl.classList.add('d-none');
                        imageEl.src = '';
                        detailEl.innerHTML = '<p><strong>Specs:</strong></p>';
                    } else {
                        placeholder.style.display = 'none';
                        imageEl.classList.remove('d-none');
                        this.displayProductDetails(val, imageEl, detailEl);
                    }
                });
            }
        },

        /**
         * Populate dropdowns with products fetched via RPC
         */
        async fillProductOptions() {
            try {
                const products = await ajax.jsonRpc('/product_comparison/products', 'call', {});
                const select1 = this.el.querySelector('#product1Select');
                const select2 = this.el.querySelector('#product2Select');

                if (select1 && select2) {
                    products.forEach(product => {
                        const opt1 = new Option(product.name, product.id);
                        const opt2 = new Option(product.name, product.id);
                        select1.add(opt1);
                        select2.add(opt2);
                    });
                }
            } catch (err) {
                console.error('Error fetching product list:', err);
            }
        },

        /**
         * Display selected product's image and description
         */
        async displayProductDetails(productId, imageEl, detailsEl) {
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
