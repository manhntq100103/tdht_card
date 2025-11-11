const form = document.getElementById("profileForm");
const imageInput = document.getElementById("imageInput");
const nameInput = document.getElementById("nameInput");
const titleInput = document.getElementById("titleInput");
const messageInput = document.getElementById("messageInput");
const profileCard = document.getElementById("profileCard");
const cardContainer = document.getElementById("cardContainer");
const btnContainer = document.getElementById("btnContainer");
const cardImage = document.getElementById("cardImage");
const cardName = document.getElementById("cardName");
const cardTitle = document.getElementById("cardTitle");
const cardMessage = document.getElementById("cardMessage");
const downloadBtn = document.getElementById("downloadBtn");

const imageError = document.getElementById("imageError");
const nameError = document.getElementById("nameError");
const titleError = document.getElementById("titleError");
const messageError = document.getElementById("messageError");

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

// Clear error messages on input
imageInput.addEventListener("change", () => {
  imageError.classList.remove("show");
  imageError.textContent = "";
});

nameInput.addEventListener("input", () => {
  nameError.classList.remove("show");
  nameError.textContent = "";
});

titleInput.addEventListener("input", () => {
  titleError.classList.remove("show");
  titleError.textContent = "";
});

messageInput.addEventListener("input", () => {
  messageError.classList.remove("show");
  messageError.textContent = "";
});

// Handle form submission
form.addEventListener("submit", (e) => {
  e.preventDefault();

  // Reset error messages
  imageError.classList.remove("show");
  nameError.classList.remove("show");
  titleError.classList.remove("show");
  messageError.classList.remove("show");
  imageError.textContent = "";
  nameError.textContent = "";
  titleError.textContent = "";
  messageError.textContent = "";

  // Validate file
  const file = imageInput.files[0];
  if (!file) {
    imageError.textContent = "Vui lòng chọn một ảnh.";
    imageError.classList.add("show");
    return;
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    imageError.textContent =
      "Chỉ chấp nhận các định dạng ảnh (JPEG, PNG, GIF, WebP).";
    imageError.classList.add("show");
    return;
  }

  if (file.size > MAX_FILE_SIZE) {
    imageError.textContent = "Dung lượng ảnh không được vượt quá 10MB.";
    imageError.classList.add("show");
    return;
  }

  // Validate name
  const name = nameInput.value.trim();
  if (!name) {
    nameError.textContent = "Vui lòng nhập tên.";
    nameError.classList.add("show");
    return;
  }

  // Validate title
  const title = titleInput.value.trim();
  if (!title) {
    titleError.textContent = "Vui lòng nhập chức vụ.";
    titleError.classList.add("show");
    return;
  }

  // Display card
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      // Cắt ảnh thành hình vuông ở giữa
      const size = Math.min(img.width, img.height);
      const startX = (img.width - size) / 2;
      const startY = (img.height - size) / 2;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, startX, startY, size, size, 0, 0, size, size);

      // Gán kết quả đã cắt vào cardImage
      cardImage.src = canvas.toDataURL("image/jpeg");
      cardName.textContent = name;
      cardTitle.textContent = title;
      cardMessage.textContent = messageInput.value.trim();
      cardContainer.classList.add("show");
      btnContainer.classList.add("show");

      // Reset form
      form.reset();
    };
    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
});


const html2canvas = window.html2canvas; // Declare the html2canvas variable

// Download button
downloadBtn.addEventListener("click", () => {
  const name = cardName.textContent || "profile-card";
  const card = document.getElementById("profileCard");

  // 🧩 Tạo wrapper tạm thời để render chính xác vùng bo góc
  const wrapper = document.createElement("div");
  wrapper.style.display = "inline-block";
  wrapper.style.borderRadius = "16px";
  wrapper.style.background = getComputedStyle(card).backgroundColor || "#fff";
  wrapper.style.boxShadow = getComputedStyle(card).boxShadow;
  wrapper.style.overflow = "hidden";

  // Clone nội dung của card vào wrapper
  const clonedCard = card.cloneNode(true);
  wrapper.appendChild(clonedCard);

  // Đưa wrapper ra ngoài vùng nhìn thấy nhưng vẫn trong DOM
  wrapper.style.position = "fixed";
  wrapper.style.left = "-9999px";
  document.body.appendChild(wrapper);

  // Dùng html2canvas để chụp chính wrapper
  html2canvas(wrapper, {
    backgroundColor: null,
    scale: 2,
    useCORS: true,
  })
    .then((canvas) => {
      document.body.removeChild(wrapper); // Xóa wrapper tạm

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${name}-card.png`;
      link.click();
    })
    .catch((err) => {
      document.body.removeChild(wrapper);
      console.error("Lỗi khi tải xuống:", err);
      downloadCardAsImage();
    });
});

// Fallback canvas
function downloadCardAsImage() {
  const name = cardName.textContent || "profile-card";

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const width = 500;
  const height = 600;
  canvas.width = width;
  canvas.height = height;

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Gradient header
  const gradient = ctx.createLinearGradient(0, 0, width, 120);
  gradient.addColorStop(0, "#667eea");
  gradient.addColorStop(1, "#764ba2");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, 120);

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = cardImage.src;
  img.onload = () => {
    const radius = 60;
    const centerX = width / 2;
    const centerY = 120 + radius;

    const circleSize = 2 * radius;

    // Tỉ lệ để cover (giữ ratio) giống object-fit: cover
    const scale = Math.max(circleSize / img.width, circleSize / img.height);
    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;
    const dx = centerX - drawWidth / 2;
    const dy = centerY - drawHeight / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
    ctx.restore();

    // Border
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Text (name, title, message)
    ctx.fillStyle = "#333333";
    ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, 'Segoe UI'";
    ctx.textAlign = "center";
    ctx.fillText(cardName.textContent, centerX, 240);

    ctx.fillStyle = "#667eea";
    ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, 'Segoe UI'";
    ctx.fillText(cardTitle.textContent.toUpperCase(), centerX, 270);

    if (cardMessage.textContent) {
      ctx.fillStyle = "#666666";
      ctx.font = "14px -apple-system, BlinkMacSystemFont, 'Segoe UI'";
      ctx.fillText(cardMessage.textContent, centerX, 300);
    }

    downloadCanvasAsImage(canvas, `${name}-card.png`);
  };
}

function downloadCanvasAsImage(canvas, filename) {
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = filename;
  link.click();
}
