const normalizeUrl = (url) => {
    return url.trim().replace(/\/+$/, "");
};

module.exports = normalizeUrl;