const categories = ["すべて", "勉強", "学校生活", "進路", "趣味"];
const initialPosts = [
  {id:1, category:"勉強", title:"英単語を毎日覚えるためにやっていること", content:"私は通学時間に10個ずつ英単語を覚えるようにしています！短い時間でも毎日続けると意外と覚えられます。みんなのおすすめの勉強方法も知りたいです。", author:"Study Note", date:"2026-11-25"},
  {id:2, category:"学校生活", title:"文化祭のアイデアを募集しています！", content:"今年の文化祭でクラス展示をすることになりました。みんなが楽しめる展示や企画のアイデアがあればぜひ教えてください！", author:"文化祭係", date:"2026-11-24"},
  {id:3, category:"進路", title:"大学の学部選び、何を基準にしましたか？", content:"興味のある分野がいくつかあって、学部を決められず悩んでいます。先輩たちは何を基準に選びましたか？", author:"匿名", date:"2026-11-23"},
  {id:4, category:"趣味", title:"おすすめの読書・音楽を共有しよう", content:"最近読んだ本や聴いている音楽で、おすすめがあれば教えてください。ジャンルは何でもOKです！", author:"M", date:"2026-11-22"},
  {id:5, category:"勉強", title:"数学のテスト前、どうやって復習していますか？", content:"公式を覚えるだけでは問題が解けなくて困っています。効率的な復習方法や問題集があれば教えてください。", author:"匿名", date:"2026-11-21"},
  {id:6, category:"学校生活", title:"放課後の時間を有効活用したい", content:"部活がない日の放課後、みんなはどんなことをしていますか？勉強でも趣味でも、時間の使い方を共有したいです。", author:"放課後", date:"2026-11-20"}
];

const postGrid = document.getElementById("post-grid");
const categoryList = document.getElementById("category-list");
const searchInput = document.getElementById("search-input");
const emptyState = document.getElementById("empty-state");
const dialog = document.getElementById("post-dialog");
const postForm = document.getElementById("post-form");

let selectedCategory = "すべて";
let posts = loadPosts();

function loadPosts() {
  try {
    const saved = localStorage.getItem("campuslink-posts");
    return saved ? JSON.parse(saved) : initialPosts;
  } catch (error) {
    console.warn("Saved posts could not be read; using sample posts.", error);
    return initialPosts;
  }
}
function savePosts() {
  try { localStorage.setItem("campuslink-posts", JSON.stringify(posts)); }
  catch (error) { alert("ブラウザーに投稿を保存できませんでした。"); }
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[char]));
}
function renderCategories() {
  categoryList.innerHTML = categories.map(category => `
    <button class="category-button ${selectedCategory === category ? "active" : ""}"
      type="button" data-category="${escapeHTML(category)}">${category}</button>`).join("");
  categoryList.querySelectorAll("[data-category]").forEach(button => {
    button.addEventListener("click", () => {
      selectedCategory = button.dataset.category;
      renderCategories();
      renderPosts();
    });
  });
}
function renderPosts() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = posts.filter(post => {
    const categoryMatch = selectedCategory === "すべて" || post.category === selectedCategory;
    const textMatch = `${post.title} ${post.content} ${post.author}`.toLowerCase().includes(query);
    return categoryMatch && textMatch;
  });
  postGrid.innerHTML = filtered.map(post => `
    <article class="post-card">
      <div class="post-meta"><span class="category-tag">${escapeHTML(post.category)}</span><time class="post-date">${escapeHTML(post.date)}</time></div>
      <h3>${escapeHTML(post.title)}</h3>
      <p>${escapeHTML(post.content)}</p>
      <div class="post-footer"><span>投稿者：${escapeHTML(post.author || "匿名")}</span><span class="read-more">CampusLink</span></div>
    </article>`).join("");
  emptyState.classList.toggle("hidden", filtered.length !== 0);
}
function openDialog() {
  dialog.showModal();
}
document.getElementById("open-post-form").addEventListener("click", openDialog);
document.getElementById("open-post-form-2").addEventListener("click", openDialog);
document.getElementById("close-dialog").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", event => {
  if (event.target === dialog) dialog.close();
});
searchInput.addEventListener("input", renderPosts);
postForm.addEventListener("submit", event => {
  event.preventDefault();
  const formData = new FormData(postForm);
  const title = formData.get("title").trim();
  const content = formData.get("content").trim();
  if (!title || !content) return;
  const newPost = {
    id: Date.now(),
    title,
    category: formData.get("category"),
    content,
    author: formData.get("author").trim() || "匿名",
    date: new Date().toISOString().slice(0,10)
  };
  posts.unshift(newPost);
  savePosts();
  selectedCategory = "すべて";
  searchInput.value = "";
  renderCategories();
  renderPosts();
  postForm.reset();
  postForm.elements.author.value = "匿名";
  dialog.close();
});
renderCategories();
renderPosts();
