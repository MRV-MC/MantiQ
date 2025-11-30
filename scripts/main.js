const nav = document.getElementById("nav");
const burger = document.getElementById("navBurger");

if (burger && nav) {
  burger.addEventListener("click", () => {
    nav.classList.toggle("nav--open");
  });

  nav.querySelectorAll(".nav__link").forEach((link) => {
    link.addEventListener("click", () => nav.classList.remove("nav--open"));
  });
}

const heroCard = document.querySelector(".hero-card");
const heroOrbs = document.querySelectorAll(".hero__orb");

if (heroCard) {
  heroCard.addEventListener("mousemove", (event) => {
    const rect = heroCard.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    heroCard.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${
      -y * 6
    }deg)`;

    heroOrbs.forEach((orb, index) => {
      const depth = (index + 1) * 6;
      orb.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
    });
  });

  heroCard.addEventListener("mouseleave", () => {
    heroCard.style.transform = "";
    heroOrbs.forEach((orb) => {
      orb.style.transform = "";
    });
  });
}

document.documentElement.style.scrollBehavior = "smooth";

const modal = document.getElementById("bookingModal");
const modalForm = document.getElementById("bookingForm");
const modalEvent = document.getElementById("bookingEvent");
const modalEventLabel = document.getElementById("bookingEventLabel");
const detailsModal = document.getElementById("detailsModal");
const detailsTitle = document.getElementById("detailsModalTitle");
const detailsDesc = document.getElementById("detailsModalDesc");

const openModal = (eventTitle) => {
  if (!modal) return;
  modal.classList.add("modal--open");
  if (modalEvent) modalEvent.value = eventTitle || "";
  if (modalEventLabel) modalEventLabel.textContent = eventTitle || "Событие";
};

const closeModal = () => modal && modal.classList.remove("modal--open");
const closeDetails = () => detailsModal && detailsModal.classList.remove("modal--open");

const openDetails = (eventTitle, desc) => {
  if (!detailsModal) return;
  detailsModal.classList.add("modal--open");
  if (detailsTitle) detailsTitle.textContent = eventTitle || "Событие";
  if (detailsDesc) detailsDesc.textContent = desc || "";
};

document.querySelectorAll("[data-open-modal]").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    openModal(btn.getAttribute("data-event") || "");
  });
});

document.querySelectorAll("[data-modal-close]").forEach((btn) => {
  btn.addEventListener("click", () => closeModal());
});

document.querySelectorAll("[data-open-details]").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    openDetails(btn.getAttribute("data-event") || "", btn.getAttribute("data-desc") || "");
  });
});

if (modal) {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
}

if (detailsModal) {
  detailsModal.addEventListener("click", (e) => {
    if (e.target === detailsModal) closeDetails();
  });
}

if (modalForm) {
  modalForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(modalForm);
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
            modalForm.reset();
            closeModal();
          }
        } else {
          alert("Ошибка при отправке заявки. Попробуйте позже.");
        }
      })
      .catch(() => alert("Ошибка сети. Попробуйте позже."));
  });
}
