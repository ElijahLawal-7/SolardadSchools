// Blogger API Configuration
const apiKey = "AIzaSyDr43eC6fFXL2Of2YhiE7kQ5GYZrakZuVM"; // Replace with your API key
const blogId = "7252068489867396796"; // Replace with your Blogger Blog ID

// Global variables for post management
let allPosts = [];
let currentPost = null;
const siteUrl = window.location.origin;

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

// Function to format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

// Function to calculate read time
function calculateReadTime(content) {
  const wordsPerMinute = 200;
  const words = content.replace(/<\/?[^>]+(>|$)/g, "").split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

// Function to generate post slug for URL
function generatePostSlug(title) {
  return title.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

// Function to generate post ID
function generatePostId(post) {
  return post.id || post.title.replace(/\s+/g, '-').toLowerCase();
}

// Fetch posts tagged as 'featured' and 'recent', or fallback for untagged/other tags
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

// Function to open full post view (like in main blog)
function openFullPost(postId) {
  const post = allPosts.find(p => generatePostId(p) === postId);
  if (!post) return;
  
  currentPost = post;
  const fullPostView = document.getElementById('full-post-view');
  
  // Update browser history
  const postSlug = generatePostSlug(post.title);
  history.pushState({postId}, post.title, `#${postSlug}`);
  
  // Populate post header
  document.getElementById('post-category-badge').textContent = 
    post.labels && post.labels.length > 0 ? post.labels[0] : 'General';
  document.getElementById('post-title-full').textContent = post.title;
  document.getElementById('author-name').textContent = 
    post.author?.displayName || 'Solardad Schools';
  document.getElementById('author-avatar').textContent = 
    (post.author?.displayName || 'Solardad Schools').charAt(0).toUpperCase();
  document.getElementById('post-date-full').textContent = formatDate(post.published);
  document.getElementById('read-time').textContent = calculateReadTime(post.content || '');
  
  // Set featured image
  const featuredImage = document.getElementById('post-featured-image');
  const imageUrl = extractImageFromContent(post.content || "");
  if (imageUrl && imageUrl !== "placeholder.jpg") {
    featuredImage.innerHTML = `<img src="${imageUrl}" alt="${post.title}">`;
  } else {
    featuredImage.innerHTML = '<i class="fas fa-image"></i>';
  }
  
  // Process and set content
  let processedContent = post.content || '';
  // Enhance images, videos, and iframes with proper styling
  processedContent = processedContent.replace(/<img([^>]*)>/g, 
    '<img$1 style="width: 100%; height: auto; border-radius: 12px; margin: 25px 0; box-shadow: 0 8px 20px rgba(0,0,0,0.1);">');
  processedContent = processedContent.replace(/<video([^>]*)>/g, 
    '<video$1 style="width: 100%; height: auto; border-radius: 12px; margin: 25px 0;" controls>');
  processedContent = processedContent.replace(/<iframe([^>]*)>/g, 
    '<iframe$1 style="width: 100%; height: 350px; border-radius: 12px; margin: 25px 0; border: none;">');
  
  document.getElementById('post-content-full').innerHTML = processedContent;
  
  // Set share link
  const postUrl = `${siteUrl}#${postSlug}`;
  document.getElementById('share-link-input').value = postUrl;
  
  // Show modal
  fullPostView.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  // Update page title
  document.title = `${post.title} - Solardad Schools`;
}

// Function to close full post view
function closeFullPost() {
  const fullPostView = document.getElementById('full-post-view');
  fullPostView.classList.remove('active');
  document.body.style.overflow = 'auto';
  
  // Restore original URL and title
  history.pushState(null, 'Solardad Schools', window.location.pathname);
  document.title = 'Solardad Schools';
  
  currentPost = null;
}

// Share functions
function shareToSocial(platform) {
  if (!currentPost) return;
  
  const postSlug = generatePostSlug(currentPost.title);
  const postUrl = `${siteUrl}#${postSlug}`;
  const title = currentPost.title;
  let shareUrl = '';
  
  switch (platform) {
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}&quote=${encodeURIComponent(title)}`;
      break;
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(title)}&hashtags=SolardadSchools,Education,Okene`;
      break;
    case 'linkedin':
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
      break;
    case 'whatsapp':
      shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' - ' + postUrl)}`;
      break;
  }
  
  if (shareUrl) {
    window.open(shareUrl, '_blank', 'width=600,height=500,scrollbars=yes,resizable=yes');
  }
}

function copyPostLink() {
  const linkInput = document.getElementById('share-link-input');
  const copyBtn = document.querySelector('.copy-link-btn');
  
  linkInput.select();
  linkInput.setSelectionRange(0, 99999);
  
  navigator.clipboard.writeText(linkInput.value).then(() => {
    const originalHTML = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="fas fa-check"></i> <span>Copied!</span>';
    copyBtn.classList.add('copy-success');
    
    setTimeout(() => {
      copyBtn.innerHTML = originalHTML;
      copyBtn.classList.remove('copy-success');
    }, 2000);
  }).catch(() => {
    // Fallback for older browsers
    linkInput.select();
    document.execCommand('copy');
    const originalHTML = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="fas fa-check"></i> <span>Copied!</span>';
    copyBtn.classList.add('copy-success');
    
    setTimeout(() => {
      copyBtn.innerHTML = originalHTML;
      copyBtn.classList.remove('copy-success');
    }, 2000);
  });
}

// Main render function
async function renderNews() {
  const container = document.getElementById("news-container");

  try {
    // Fetch all posts
    allPosts = await fetchAllPosts();

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
      const postId = generatePostId(post);

      card.innerHTML = `
        <img src="${imageUrl}" alt="${post.title}">
        <div class="content">
          <h3 class="title">${post.title}</h3>
          <p class="date">${new Date(post.published).toLocaleDateString()}</p>
          <p class="excerpt">${getExcerpt(post.content || "No content available.")}</p>
          <a href="#" onclick="openFullPost('${postId}'); return false;">Read More</a>
        </div>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error rendering news:", error);
    container.innerHTML = "<p>Error loading posts. Please check the console for details.</p>";
  }
}

// Event listeners and initialization
document.addEventListener('DOMContentLoaded', function() {
  // Handle browser back/forward navigation
  window.addEventListener('popstate', function(event) {
    if (event.state && event.state.postId) {
      openFullPost(event.state.postId);
    } else {
      closeFullPost();
    }
  });

  // Handle escape key to close modal
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('full-post-view').classList.contains('active')) {
      closeFullPost();
    }
  });

  // Check URL for post on load
  function checkUrlForPost() {
    const hash = window.location.hash.substring(1);
    if (hash && allPosts.length > 0) {
      const post = allPosts.find(p => generatePostSlug(p.title) === hash);
      if (post) {
        setTimeout(() => openFullPost(generatePostId(post)), 500);
      }
    }
  }

  // Initialize after posts are loaded
  renderNews().then(() => {
    checkUrlForPost();
  });
});

// Initialize news rendering
renderNews();