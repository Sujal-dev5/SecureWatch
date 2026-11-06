const dns = require("dns").promises;
const net = require("net");
const ipaddr = require("ipaddr.js");

const isUnsafeIP = (ip) => {
    try {
        if (!net.isIP(ip)) {
            return true;
        }

        const address =
            ipaddr.process(ip);

        const range =
            address.range();

        const unsafeRanges = new Set([
            "unspecified",
            "loopback",
            "private",
            "linkLocal",
            "uniqueLocal",
            "carrierGradeNat",
            "reserved",
            "broadcast",
            "multicast",
            "benchmark",
            "documentation",
            "future",
        ]);

        return unsafeRanges.has(range);

    } catch (error) {
        console.warn(
            `Failed to classify IP ${ip}:`,
            error.message
        );

        return true;
    }
};


const validateRuntimeTarget = async (
    targetUrl
) => {

    let parsedUrl;

    try {
        parsedUrl =
            new URL(targetUrl);
    } catch (error) {
        throw new Error(
            "Invalid target URL"
        );
    }


    const hostname =
        parsedUrl.hostname.toLowerCase();


    // --------------------------------------------------
    // Direct IP target
    // --------------------------------------------------

    if (net.isIP(hostname)) {

        if (isUnsafeIP(hostname)) {
            throw new Error(
                "Scan blocked: target resolves to a private or reserved IP address"
            );
        }

        return {
            hostname,
            addresses: [hostname],
        };
    }


    // --------------------------------------------------
    // Resolve hostname
    // --------------------------------------------------

    let addresses;

    try {

        addresses =
            await dns.lookup(
                hostname,
                {
                    all: true,
                    verbatim: true,
                }
            );

    } catch (error) {

        console.error(
            `DNS resolution failed for ${hostname}:`,
            error.message
        );

        throw new Error(
            "Scan blocked: unable to resolve target hostname"
        );
    }


    if (
        !addresses ||
        addresses.length === 0
    ) {
        throw new Error(
            "Scan blocked: target hostname did not resolve to an IP address"
        );
    }


    // --------------------------------------------------
    // Validate EVERY resolved address
    // --------------------------------------------------

    const resolvedIPs =
        addresses.map(
            (entry) => entry.address
        );


    for (
        const ip of resolvedIPs
    ) {

        console.log(
            `Runtime target IP check: ${hostname} -> ${ip}`
        );


        if (isUnsafeIP(ip)) {

            console.warn(
                `Blocked unsafe runtime target: ${hostname} -> ${ip}`
            );

            throw new Error(
                "Scan blocked: target hostname resolves to a private or reserved IP address"
            );
        }
    }


    console.log(
        `Runtime target validation passed: ${hostname}`,
        resolvedIPs
    );


    return {
        hostname,
        addresses: resolvedIPs,
    };
};


module.exports = {
    validateRuntimeTarget,
};