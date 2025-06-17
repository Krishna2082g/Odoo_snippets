odoo.define('web_snippet_demo.product_comparison', function (require) {
    'use strict';

    const publicWidget = require('web.public.widget');
    const ajax = require('web.ajax');

    publicWidget.registry.ProductComparison = publicWidget.Widget.extend({
        selector: '.s_comparison_block',

        init: function (parent, options) {
            this._super.apply(this, arguments);
            this.options = options || {};
        },

        willStart: async function () {
            return this._super.apply(this, arguments);
        },

        async start() {
            await this._super(...arguments);

            await this.fillProductOptions('#product1Select');
            await this.fillProductOptions('#product2Select');

            this._bindProductChange('#product1Select', '#product1Image', '#product1Details');
            this._bindProductChange('#product2Select', '#product2Image', '#product2Details');

            // Create Add Product button
            const addButton = document.createElement('button');
            addButton.className = 'btn btn-outline-primary btn-sm mt-3';
            addButton.style.padding = '4px 10px';
            addButton.style.fontSize = '0.875rem';
            addButton.textContent = '+ Add Product';

            // Append button below the row container
            const containerRow = this.el.querySelector('.container .row');
            const buttonWrapper = document.createElement('div');
            buttonWrapper.className = 'text-center mt-2';
            buttonWrapper.appendChild(addButton);
            containerRow.parentElement.appendChild(buttonWrapper);

            // Add product box on click
            addButton.addEventListener('click', () => this.addDynamicProductBox());
        },

        createPlaceholder(imageEl) {
            if (!imageEl) return null;
            let placeholder = imageEl.parentElement.querySelector('.please-select-placeholder');
            if (!placeholder) {
                placeholder = document.createElement('div');
                placeholder.className = 'please-select-placeholder text-center text-muted mb-3';
                placeholder.style.cssText = `
                    max-height: 200px;
                    line-height: 200px;
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

        _bindProductChangeFromElements(selectEl, imageEl, detailEl) {
            const placeholder = this.createPlaceholder(imageEl);
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
        },

        async fillProductOptions(selector) {
            try {
                const products = await ajax.jsonRpc('/product_comparison/products', 'call', {});
                const select = this.el.querySelector(selector);
                if (select) {
                    // Clear existing except first option
                    select.length = 1;
                    products.forEach(product => {
                        const opt = new Option(product.name, product.id);
                        select.add(opt);
                    });
                }
            } catch (err) {
                console.error('Error fetching product list:', err);
            }
        },

        async fillProductOptionsFromEl(selectEl) {
            try {
                const products = await ajax.jsonRpc('/product_comparison/products', 'call', {});
                if (selectEl) {
                    // Clear existing except first option
                    selectEl.length = 1;
                    products.forEach(product => {
                        const opt = new Option(product.name, product.id);
                        selectEl.add(opt);
                    });
                }
            } catch (err) {
                console.error('Error fetching product list:', err);
            }
        },

        async displayProductDetails(productId, imageEl, detailsEl) {
            try {
                const product = await ajax.jsonRpc('/product_comparison/product_detail', 'call', {
                    product_id: parseInt(productId)
                });

                imageEl.src = product.image_128
                    ? `data:image/png;base64,${product.image_128}`
                    : '/web/static/src/img/placeholder.png';

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
            } catch (err) {
                console.error('Error fetching product detail:', err);
            }
        },

        async addDynamicProductBox() {
            const row = this.el.querySelector('.row');
            const box = document.createElement('div');
            box.className = 'col-md-5 mx-3 my-2 comparison-box box-otherbrand';

            const count = this.el.querySelectorAll('.comparison-box').length + 1;
            box.innerHTML = `
                <h4 class="mb-3 fw-semibold">Product ${count}</h4>
                <select class="form-select mb-3 shadow-sm dynamic-product-select">
                    <option value="">Select Product</option>
                </select>
                <img src="/web/static/src/img/placeholder.png" alt="Product ${count} Image" class="img-fluid rounded shadow-sm border mb-3 product-image" style="max-height:200px;" loading="lazy" />
                <div class="text-start small specs-list product-details">
                    <p><strong></strong></p>
                </div>
            `;

            row.appendChild(box);

            const selectEl = box.querySelector('.dynamic-product-select');
            const imageEl = box.querySelector('.product-image');
            const detailEl = box.querySelector('.product-details');

            await this.fillProductOptionsFromEl(selectEl);
            this._bindProductChangeFromElements(selectEl, imageEl, detailEl);
        },

        destroy: function () {
            this._super.apply(this, arguments);
        },
    });
});
