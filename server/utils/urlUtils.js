const net = require("net");

const isPrivateOrReservedIP = (hostname) => {
    const ipVersion = net.isIP(hostname);

    if (!ipVersion) {
        return false;
    }

    if (ipVersion === 4) {
        const parts = hostname
            .split(".")
            .map(Number);

        const [a, b] = parts;

        // Loopback: 127.0.0.0/8
        if (a === 127) {
            return true;
        }

        // Private: 10.0.0.0/8
        if (a === 10) {
            return true;
        }

        // Private: 172.16.0.0/12
        if (a === 172 && b >= 16 && b <= 31) {
            return true;
        }

        // Private: 192.168.0.0/16
        if (a === 192 && b === 168) {
            return true;
        }

        // Link-local: 169.254.0.0/16
        if (a === 169 && b === 254) {
            return true;
        }

        // Current network / unspecified
        if (a === 0) {
            return true;
        }

        return false;
    }

    // IPv6
    const normalized = hostname.toLowerCase();

    // IPv6 loopback
    if (normalized === "::1") {
        return true;
    }

    // IPv6 unspecified
    if (normalized === "::") {
        return true;
    }

    // IPv6 private/local ranges
    if (
        normalized.startsWith("fc") ||
        normalized.startsWith("fd") ||
        normalized.startsWith("fe8") ||
        normalized.startsWith("fe9") ||
        normalized.startsWith("fea") ||
        normalized.startsWith("feb")
    ) {
        return true;
    }

    return false;
};


const normalizeUrl = (input) => {
    if (!input || typeof input !== "string") {
        throw new Error("Website URL is required");
    }

    let url = input.trim();

    // Add HTTPS if protocol is missing
    if (!/^https?:\/\//i.test(url)) {
        url = `https://${url}`;
    }

    let parsedUrl;

    try {
        parsedUrl = new URL(url);
    } catch (error) {
        throw new Error("Invalid website URL");
    }

    // Only allow HTTP and HTTPS
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error(
            "Only HTTP and HTTPS URLs are allowed"
        );
    }

    const hostname =
        parsedUrl.hostname.toLowerCase();

    // Block localhost
    if (
        hostname === "localhost" ||
        hostname.endsWith(".localhost")
    ) {
        throw new Error(
            "Localhost and local network targets are not allowed"
        );
    }

    // Block private, loopback and reserved IP addresses
    if (isPrivateOrReservedIP(hostname)) {
        throw new Error(
            "Private or reserved IP addresses are not allowed"
        );
    }

    // Remove credentials from URL
    if (
        parsedUrl.username ||
        parsedUrl.password
    ) {
        throw new Error(
            "URLs containing username or password are not allowed"
        );
    }

    // Remove trailing slash
    parsedUrl.pathname =
        parsedUrl.pathname.replace(/\/+$/, "");

    return parsedUrl.toString();
};


module.exports = {
    normalizeUrl
};