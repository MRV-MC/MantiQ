(() => {
  const params = new URLSearchParams(window.location.search);
  const adminKey = params.get("key");
  const headers = { "Content-Type": "application/json" };
  if (adminKey) headers["x-admin-key"] = adminKey;

  const heroForm = document.getElementById("heroForm");
  const aboutForm = document.getElementById("aboutForm");
  const eventsForm = document.getElementById("eventsForm");
  const bookingsTable = document.getElementById("bookingsTable");
  const bookingsBody = document.getElementById("bookingsBody");
  const toggleBookings = document.getElementById("toggleBookings");

  const setValue = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.value = value || "";
  };

  const loadContent = () => {
    fetch("/api/admin/content", { headers })
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) return;
        const { hero, about, events } = data.data;
        if (hero) setValue("heroImage", hero.image);
        if (about) {
          setValue("aboutHighlight", about.highlight);
          setValue("aboutBody1", about.body1);
          setValue("aboutBody2", about.body2);
          setValue("aboutBody3", about.body3);
          setValue("aboutImage1", about.image1);
          setValue("aboutImage2", about.image2);
          setValue("aboutImage3", about.image3);
          setValue("aboutImage4", about.image4);
        }
        if (events && events.length) {
          const last = events[0];
          setValue("eventId", last.id);
          setValue("eventTitle", last.title);
          setValue("eventDate", last.dateMeta);
          setValue("eventDesc", last.description);
          setValue("eventDetails", last.details);
          setValue("eventAmount", last.amount);
          setValue("eventImage", last.image);
          setValue("eventTags", last.tags);
        }
      })
      .catch(console.error);
  };

  if (heroForm) {
    heroForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const payload = { image: document.getElementById("heroImage")?.value || "" };
      fetch("/api/admin/hero", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      }).then(() => alert("Hero сохранен (серверный функционал нужен для файлов)"));
    });
  }

  if (aboutForm) {
    aboutForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const payload = {
        highlight: document.getElementById("aboutHighlight")?.value,
        body1: document.getElementById("aboutBody1")?.value,
        body2: document.getElementById("aboutBody2")?.value,
        body3: document.getElementById("aboutBody3")?.value,
        image1: document.getElementById("aboutImage1")?.value,
        image2: document.getElementById("aboutImage2")?.value,
        image3: document.getElementById("aboutImage3")?.value,
        image4: document.getElementById("aboutImage4")?.value,
      };
      fetch("/api/admin/about", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      }).then(() => alert("About сохранен (серверный функционал нужен для файлов)"));
    });
  }

  if (eventsForm) {
    eventsForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const payload = {
        id: document.getElementById("eventId")?.value || undefined,
        title: document.getElementById("eventTitle")?.value,
        dateMeta: document.getElementById("eventDate")?.value,
        description: document.getElementById("eventDesc")?.value,
        details: document.getElementById("eventDetails")?.value,
        amount: document.getElementById("eventAmount")?.value,
        image: document.getElementById("eventImage")?.value,
        tags: document.getElementById("eventTags")?.value,
      };
      fetch("/api/admin/events", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      }).then(() => alert("Событие сохранено (для загрузки файлов нужен серверный код)"));
    });
  }

  loadContent();

  const sortBookings = (field, order = "desc") => {
    fetch(`/api/admin/bookings?sort=${field}&order=${order}`, { headers })
      .then((r) => r.json())
      .then((data) => {
        if (!data.success || !bookingsBody) return;
        bookingsBody.innerHTML = "";
        data.data.forEach((b) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${b.id}</td>
            <td>${b.eventTitle}</td>
            <td>${b.lastName}</td>
            <td>${b.firstName}</td>
            <td>${b.middleName || ""}</td>
            <td>${b.phone}</td>
            <td>${b.status}</td>
            <td>${new Date(b.createdAt).toISOString()}</td>
          `;
          bookingsBody.appendChild(tr);
        });
      })
      .catch(console.error);
  };

  if (bookingsTable) {
    bookingsTable.querySelectorAll("th[data-sort]").forEach((th) => {
      th.addEventListener("click", () => {
        const field = th.getAttribute("data-sort");
        const order = th.dataset.order === "asc" ? "desc" : "asc";
        th.dataset.order = order;
        sortBookings(field, order);
      });
    });
  }

  if (toggleBookings && bookingsTable) {
    toggleBookings.addEventListener("click", () => {
      bookingsTable.classList.toggle("hidden");
    });
  }

  // Populate select of current events (simple, using last loaded)
  const eventSelect = document.getElementById("eventSelect");
  if (eventSelect) {
    fetch("/api/admin/content", { headers })
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) return;
        const { events } = data.data;
        eventSelect.innerHTML = '<option value="">Новое событие</option>';
        events.forEach((ev) => {
          const opt = document.createElement("option");
          opt.value = ev.id;
          opt.textContent = `${ev.title} (${ev.dateMeta})`;
          eventSelect.appendChild(opt);
        });
        eventSelect.addEventListener("change", () => {
          const id = eventSelect.value;
          if (!id) {
            eventsForm.reset();
            return;
          }
          const ev = events.find((x) => String(x.id) === String(id));
          if (!ev) return;
          setValue("eventId", ev.id);
          setValue("eventTitle", ev.title);
          setValue("eventDate", ev.dateMeta);
          setValue("eventDesc", ev.description);
          setValue("eventDetails", ev.details);
          setValue("eventAmount", ev.amount);
          setValue("eventImage", ev.image);
          setValue("eventTags", ev.tags);
        });
      })
      .catch(console.error);
  }
})();
