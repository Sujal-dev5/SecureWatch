const validateWebsite = (req, res, next) => {
  const { name, url } = req.body;

  // Required fields
  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({
      message: "Website name is required",
    });
  }

  if (typeof url !== "string" || !url.trim()) {
    return res.status(400).json({
      message: "Website URL is required",
    });
  }

  const trimmedName = name.trim();
  const trimmedUrl = url.trim();

  // Name length validation
  if (trimmedName.length > 100) {
    return res.status(400).json({
      message: "Website name must not exceed 100 characters",
    });
  }

  // URL length validation
  if (trimmedUrl.length > 2048) {
    return res.status(400).json({
      message: "Website URL is too long",
    });
  }

  // URL validation
  let parsedUrl;

  try {
    parsedUrl = new URL(trimmedUrl);
  } catch {
    return res.status(400).json({
      message: "Invalid website URL",
    });
  }

  // Only HTTP and HTTPS are allowed
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return res.status(400).json({
      message: "Only HTTP and HTTPS URLs are allowed",
    });
  }

  // Hostname must exist
  if (!parsedUrl.hostname) {
    return res.status(400).json({
      message: "Invalid website hostname",
    });
  }

  //add because of xss test case failed
  // Block HTML/script characters in URL
  let decodedUrl;

  try {
    decodedUrl = decodeURIComponent(trimmedUrl);
  } catch {
    return res.status(400).json({
      message: "Invalid website URL encoding",
    });
  }

  if (/[<>]/.test(decodedUrl)) {
    return res.status(400).json({
      message: "HTML/script content is not allowed in website URL",
    });
  }

  // Store sanitized values for the controller
  req.body.name = trimmedName;
  req.body.url = parsedUrl.toString();

  next();
};

module.exports = validateWebsite;
