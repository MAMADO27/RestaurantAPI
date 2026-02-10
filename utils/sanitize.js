const sanitize_html = require('sanitize-html');
exports.sanitize_text = (value) => {
    if (!value) return value;
    return sanitize_html(value, {
        allowedTags: [],
        allowedAttributes: {}
    });
};

exports.sanitize_rich_text = (value) => {
    if (!value) return value;
    return sanitize_html(value, {
        allowedTags: sanitize_html.defaults.allowedTags.concat([
            'img', 'h1', 'h2', 'u'
        ]),
        allowedAttributes: {
            a: ['href', 'name', 'target'],
            img: ['src', 'alt']
        },
        allowedSchemes: ['http', 'https', 'data']
    });
};


