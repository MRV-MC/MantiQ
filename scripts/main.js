// Навигация
const nav = document.getElementById("nav");
const burger = document.getElementById("navBurger");
if (burger && nav) {
  burger.addEventListener("click", () => nav.classList.toggle("nav--open"));
  nav.querySelectorAll(".nav__link").forEach((link) =>
    link.addEventListener("click", () => nav.classList.remove("nav--open"))
  );
}

// Tilt для hero-card
const heroCard = document.querySelector(".hero-card");
const heroOrbs = document.querySelectorAll(".hero__orb");
if (heroCard) {
  heroCard.addEventListener("mousemove", (event) => {
    const rect = heroCard.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    heroCard.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
    heroOrbs.forEach((orb, index) => {
      const depth = (index + 1) * 6;
      orb.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
    });
  });
  heroCard.addEventListener("mouseleave", () => {
    heroCard.style.transform = "";
    heroOrbs.forEach((orb) => (orb.style.transform = ""));
  });
}

const body = document.body;
const bookingModal = document.getElementById("bookingModal");
const bookingForm = document.getElementById("bookingForm");
const bookingEvent = document.getElementById("bookingEvent");
const bookingAmount = document.getElementById("bookingAmount");
const bookingEventLabel = document.getElementById("bookingEventLabel");

const detailsModal = document.getElementById("detailsModal");
const detailsTitle = document.getElementById("detailsModalTitle");
const detailsDesc = document.getElementById("detailsModalDesc");
const detailsImage = document.getElementById("detailsModalImage");

const aboutModal = document.getElementById("aboutImageModal");
const aboutModalImage = document.getElementById("aboutModalImage");

const setBodyLock = (lock) => {
  if (lock) body.classList.add("modal-open");
  else body.classList.remove("modal-open");
};

const openBooking = (eventTitle, amount) => {
  if (!bookingModal) return;
  bookingModal.classList.add("modal--open");
  setBodyLock(true);
  if (bookingEvent) bookingEvent.value = eventTitle || "";
  if (bookingEventLabel) bookingEventLabel.textContent = eventTitle || "Событие";
  if (bookingAmount) bookingAmount.value = amount || "";
};

const closeBooking = () => {
  if (bookingModal) bookingModal.classList.remove("modal--open");
  setBodyLock(false);
};

const openDetails = (eventTitle, desc, image) => {
  if (!detailsModal) return;
  detailsModal.classList.add("modal--open");
  setBodyLock(true);
  if (detailsTitle) detailsTitle.textContent = eventTitle || "Событие";
  if (detailsDesc) detailsDesc.textContent = desc || "";
  if (detailsImage) {
    detailsImage.src = image || "/images/event-placeholder.jpg";
    detailsImage.alt = eventTitle || "Событие";
  }
};

const closeDetails = () => {
  if (detailsModal) detailsModal.classList.remove("modal--open");
  setBodyLock(false);
};

// Открытие формы
document.querySelectorAll("[data-open-modal]").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    openBooking(btn.getAttribute("data-event") || "", btn.getAttribute("data-amount") || "");
  });
});

// Открытие описания
document.querySelectorAll("[data-open-details]").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    openDetails(
      btn.getAttribute("data-event") || "",
      btn.getAttribute("data-desc") || "",
      btn.getAttribute("data-image") || "/images/event-placeholder.jpg"
    );
  });
});

// Записаться из описания
document.querySelectorAll("#detailsModal .modal__submit").forEach((btn) => {
  btn.addEventListener("click", () => {
    const title = detailsTitle ? detailsTitle.textContent : "";
    const amount = bookingAmount ? bookingAmount.value : "";
    closeDetails();
    openBooking(title, amount);
  });
});

// Закрытие
document.querySelectorAll("[data-modal-close]").forEach((btn) => {
  btn.addEventListener("click", () => {
    closeBooking();
    closeDetails();
    if (aboutModal) aboutModal.classList.remove("modal--open");
    setBodyLock(false);
  });
});

[bookingModal, detailsModal, aboutModal].forEach((modalEl) => {
  if (!modalEl) return;
  modalEl.addEventListener("click", (e) => {
    if (e.target === modalEl) {
      modalEl.classList.remove("modal--open");
      setBodyLock(false);
    }
  });
});

// Отправка формы
if (bookingForm) {
  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(bookingForm);
    const payload = Object.fromEntries(formData.entries());

    fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((resp) => resp.json())
      .then((data) => {
        if (data.success) {
          if (data.confirmationUrl) {
            window.location.href = data.confirmationUrl;
          } else {
            alert("Заявка отправлена. Свяжемся для оплаты.");
            bookingForm.reset();
            closeBooking();
          }
        } else {
          alert("Ошибка при отправке заявки. Попробуйте позже.");
        }
      })
      .catch(() => alert("Ошибка сети. Попробуйте позже."));
  });
}

// Лайтбокс "О нас"
document.querySelectorAll(".about__image img").forEach((img) => {
  img.addEventListener("click", () => {
    if (!aboutModal || !aboutModalImage) return;
    aboutModal.classList.add("modal--open");
    setBodyLock(true);
    aboutModalImage.src = img.src;
    aboutModalImage.alt = img.alt || "Изображение";
  });
});
