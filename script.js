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

let cropper;
const previewContainer = document.querySelector(".image-preview-container");
const previewImage = document.getElementById("previewImage");
const cropBtn = document.getElementById("cropBtn");

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

// imageInput.addEventListener("change", () => {
//   imageError.classList.remove("show");
//   imageError.textContent = "";
// });
imageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (evt) {
    previewImage.src = evt.target.result;
    previewContainer.style.display = "block";

    // Hủy cropper cũ nếu có
    if (cropper) {
      cropper.destroy();
    }

    // Khởi tạo cropper mới
    cropper = new Cropper(previewImage, {
      aspectRatio: 1, // Tỉ lệ vuông
      viewMode: 1,
      dragMode: "move",
      autoCropArea: 1,
    });
  };
  reader.readAsDataURL(file);
});

// Khi người dùng nhấn "Cắt ảnh"
cropBtn.addEventListener("click", () => {
  if (!cropper) return;

  const canvas = cropper.getCroppedCanvas({
    width: 400,
    height: 400,
  });

  // Hiển thị ảnh đã crop lên card
  cardImage.src = canvas.toDataURL("image/jpeg");

  // Ẩn vùng crop
  previewContainer.style.display = "none";

  // Giải phóng cropper
  cropper.destroy();
  cropper = null;
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

  // Reset lỗi cũ
  imageError.textContent = "";
  nameError.textContent = "";
  titleError.textContent = "";
  messageError.textContent = "";

  // 🧠 Kiểm tra xem đã có ảnh crop chưa
  if (!cardImage.src) {
    imageError.textContent = "Vui lòng chọn và cắt ảnh trước khi tạo.";
    imageError.classList.add("show");
    return;
  }

  // 🧾 Validate dữ liệu text
  const nameValue = nameInput.value.trim();
  const titleValue = titleInput.value.trim();
  const messageValue = messageInput.value.trim();

  if (!nameValue) {
    nameError.textContent = "Vui lòng nhập tên.";
    nameError.classList.add("show");
    return;
  }

  if (!titleValue) {
    titleError.textContent = "Vui lòng nhập chức vụ.";
    titleError.classList.add("show");
    return;
  }

  if (!messageValue) {
    messageError.textContent = "Vui lòng nhập lời nhắn.";
    messageError.classList.add("show");
    return;
  }

  // 🪄 Cập nhật thông tin lên card
  cardName.textContent = nameValue;
  cardTitle.textContent = titleValue;
  cardMessage.textContent = messageValue;

  cardContainer.classList.add("show");
  btnContainer.classList.add("show");
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
