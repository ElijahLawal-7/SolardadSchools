const functions = require("firebase-functions");
const fetch = require("node-fetch");

// Reverse Proxy for /portal
exports.portal = functions.https.onRequest(async (req, res) => {
  // Capture the path from the request (e.g., "/portal/academic")
  const path = req.path.replace(/^\/portal/, "");

  // Construct the external URL
  const externalUrl = `https://nersapp.africa/org/solardad${path}`;

  try {
    // Fetch the content from the external URL
    const response = await fetch(externalUrl);

    // Check if the response is successful
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    // Get the content type from the response
    const contentType = response.headers.get("content-type") || "text/html";

    // Send the content back to the client
    res.set("Content-Type", contentType);
    const data = await response.text();
    res.send(data);
  } catch (error) {
    // Handle errors (e.g., external site is down)
    console.error("Error fetching external content:", error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

// Reverse Proxy for /blog
exports.blog = functions.https.onRequest(async (req, res) => {
  // Capture the path from the request (e.g., "/blog/posts")
  const path = req.path.replace(/^\/blog/, "");

  // Construct the external URL
  const externalUrl = `https://solytest.blogspot.com${path}`;

  try {
    // Fetch the content from the external URL
    const response = await fetch(externalUrl);

    // Check if the response is successful
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    // Get the content type from the response
    const contentType = response.headers.get("content-type") || "text/html";

    // Send the content back to the client
    res.set("Content-Type", contentType);
    const data = await response.text();
    res.send(data);
  } catch (error) {
    // Handle errors (e.g., external site is down)
    console.error("Error fetching external content:", error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});