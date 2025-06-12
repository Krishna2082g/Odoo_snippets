{
    "name": "Website Snippet Demo",
    "category": "Website",
    "summary": "Custom snippets for website",
    "version": "1.0",
    "depends": ["website"],
    "data": [
        "views/custom_snippet_templates.xml",
        "views/custom_snippet.xml",
    ],


    'assets': {
    'web.assets_frontend': [
        'website_snippet_demo/static/src/js/product_comparison.js',
    ],
},

    "installable": True,
    "application": True,
}