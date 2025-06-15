from odoo import http
from odoo.http import request
import logging

_logger = logging.getLogger(__name__)

class ProductComparisonController(http.Controller):

    @http.route('/product_comparison/products', type='json', auth='public', website=True, csrf=False)
    def get_products(self):
        _logger.info("==> get_products() called")
        products = request.env['product.template'].sudo().search([('sale_ok', '=', True)], limit=50)
        return [{'id': p.id, 'name': p.name} for p in products]

    @http.route('/product_comparison/product_detail', type='json', auth='public', website=True, csrf=False)
    def get_product_detail(self, product_id):
        _logger.info(f"==> get_product_detail({product_id}) called")
        try:
            product = request.env['product.template'].sudo().browse(int(product_id))
            if not product.exists():
                return {'error': 'Product not found'}

            return {
                'name': product.name,
                'list_price': product.list_price,
                'currency': product.currency_id.symbol,
                'description_sale': product.description_sale or '',
                'image_128': product.image_128 or '',
                'product_type': product.type,
                'invoicing_policy': product.invoice_policy,
                'cost': product.standard_price,
                'internal_reference': product.default_code or '',
                'product_category': product.categ_id.complete_name or '',
                'can_be_sold': product.sale_ok,
                'can_be_purchased': product.purchase_ok,
            }

        except Exception as e:
            _logger.error(f"Error fetching product detail: {e}")
            return {'error': 'Server error'}
