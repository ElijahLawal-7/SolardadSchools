// Blogger API Configuration
const apiKey = "AIzaSyDr43eC6fFXL2Of2YhiE7kQ5GYZrakZuVM"; // Replace with your API key
const blogId = "7252068489867396796"; // Replace with your Blogger Blog ID

// Function to extract and truncate excerpts from post content
function getExcerpt(content, maxLength = 100) {
  // Strip HTML tags
  const plainText = content.replace(/<\/?[^>]+(>|$)/g, "");

  // Truncate to the desired length
  return plainText.length > maxLength
    ? plainText.substring(0, maxLength) + "..."
    : plainText;
}

// Function to extract image from post content
function extractImageFromContent(content) {
  const imgRegex = /<img[^>]+src="([^">]+)"/;
  const match = content.match(imgRegex);
  return match ? match[1] : "placeholder.jpg"; // Use a placeholder if no image is found
}

// Fetch posts tagged as 'featured' and 'recent', or fallback for untagged/other tags
// Function to fetch all posts (no tag filtering)
// Function to fetch all posts (ignoring specific tags)
async function fetchAllPosts() {
  const url = `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts?key=${apiKey}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

async function renderNews() {
  const container = document.getElementById("news-container");

  try {
    // Fetch all posts
    const allPosts = await fetchAllPosts();

    if (!allPosts.length) {
      console.warn("No posts fetched.");
      container.innerHTML = "<p>No posts available.</p>";
      return;
    }

    // Categorize posts
    const featuredPosts = [];
    const otherPosts = [];

    allPosts.forEach(post => {
      const tags = post.labels || [];
      if (tags.includes("Featured")) {
        featuredPosts.push(post); // Categorize as Featured
      } else {
        otherPosts.push(post); // Categorize as Other (Recent/Fallback)
      }
    });

    // Sort posts by date (most recent first)
    const sortByDate = posts =>
      posts.sort(
        (a, b) => new Date(b.published).getTime() - new Date(a.published).getTime()
      );

    const sortedOtherPosts = sortByDate(otherPosts).slice(0, 2); // Top 2 recent/other posts
    const sortedFeaturedPosts = sortByDate(featuredPosts).slice(0, 2); // Top 2 featured posts

    // Combine posts: other posts first, followed by featured posts
    const combinedPosts = [...sortedOtherPosts, ...sortedFeaturedPosts];

    console.log("Final combined posts:", combinedPosts); // Debugging

    // Clear the container and render the posts
    container.innerHTML = ""; // Clear previous content
    if (!combinedPosts.length) {
      container.innerHTML = "<p>No posts to display.</p>";
      return;
    }

    combinedPosts.forEach(post => {
      const card = document.createElement("div");
      card.classList.add("news-card");

      // Extract image from content
      const imageUrl = extractImageFromContent(post.content || "");

      card.innerHTML = `
        <img src="${imageUrl}" alt="${post.title}">
        <div class="content">
          <h3 class="title">${post.title}</h3>
          <p class="date">${new Date(post.published).toLocaleDateString()}</p>
          <p class="excerpt">${getExcerpt(post.content || "No content available.")}</p>
          <a href="${post.url}" target="_blank">Read More</a>
        </div>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error rendering news:", error);
    container.innerHTML = "<p>Error loading posts. Please check the console for details.</p>";
  }
}

// Initialize news rendering
renderNews();

