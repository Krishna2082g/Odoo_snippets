# controllers/product_comparison.py

from odoo import http
from odoo.http import request

class ProductComparisonController(http.Controller):

    @http.route('/product_comparison/products', type='json', auth='public')
    def get_products(self):
        products = request.env['product.product'].sudo().search([], limit=50)
        return [{'id': p.id, 'name': p.name} for p in products]

    @http.route('/product_comparison/product_detail', type='json', auth='public')
    def get_product_detail(self, product_id):
        product = request.env['product.product'].sudo().browse(int(product_id))
        return {
            'name': product.name,
            'list_price': product.list_price,
            'description_sale': product.description_sale,
            'currency': product.currency_id.name if product.currency_id else '',
            'image_128': product.image_128.decode() if product.image_128 else '',
        }
