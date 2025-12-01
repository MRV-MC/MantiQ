require("dotenv").config();
const path = require("path");
const express = require("express");
const { PrismaClient, Prisma } = require("@prisma/client");
const { createPayment } = require("./services/payments");
const multer = require("multer");
const fs = require("fs");

const app = express();
const prisma = new PrismaClient();
const ADMIN_KEY = process.env.ADMIN_KEY || "secret123";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.render("index", {
    title: "MantiQ — магические мероприятия нового поколения",
    description:
      "Живые эзотерические встречи с интерактивами: свечи, таро, астрология и ритуалы в атмосфере MantiQ.",
  });
});

const requireAdminKey = (req, res, next) => {
  const key = req.query.key || req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) {
    return res.status(401).send("Access denied");
  }
  next();
};

app.post("/api/bookings", async (req, res) => {
  try {
    const { eventTitle, lastName, firstName, middleName, phone, amount } = req.body;
    if (!eventTitle || !lastName || !firstName || !phone) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    const booking = await prisma.booking.create({
      data: {
        eventTitle,
        lastName,
        firstName,
        middleName: middleName || null,
        phone,
      },
    });

    // создаём платёж (пока заглушка)
    const payment = await createPayment({
      amount: Number(amount) || 0,
      description: `Оплата события: ${eventTitle}`,
      metadata: { bookingId: booking.id },
    });

    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: new Prisma.Decimal(Number(amount) || 0),
        status: payment.status || "pending",
        providerId: payment.providerId || null,
        confirmationUrl: payment.confirmationUrl || null,
      },
    });

    res.json({ success: true, data: booking, confirmationUrl: payment.confirmationUrl });
  } catch (error) {
    console.error("Booking error", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

app.get("/admin", requireAdminKey, async (req, res) => {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
  });

  res.render("admin", { bookings, adminKey: req.query.key || ADMIN_KEY });
});

app.get("/api/admin/bookings", requireAdminKey, async (req, res) => {
  const sort = req.query.sort || "createdAt";
  const order = req.query.order === "asc" ? "asc" : "desc";
  const bookings = await prisma.booking.findMany({
    orderBy: { [sort]: order },
  });
  res.json({ success: true, data: bookings });
});

app.get("/api/admin/content", requireAdminKey, async (req, res) => {
  const hero = await prisma.heroContent.findFirst({ where: { id: 1 } });
  const about = await prisma.aboutContent.findFirst({ where: { id: 1 } });
  const events = await prisma.event.findMany({ orderBy: { createdAt: "desc" } });
  res.json({ success: true, data: { hero, about, events } });
});

app.post("/api/admin/hero", requireAdminKey, async (req, res) => {
  try {
    const { image } = req.body;
    const hero = await prisma.heroContent.upsert({
      where: { id: 1 },
      create: { id: 1, image },
      update: { image },
    });
    res.json({ success: true, data: hero });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

app.post("/api/admin/about", requireAdminKey, async (req, res) => {
  try {
    const { highlight, body1, body2, body3, image1, image2, image3, image4 } = req.body;
    const about = await prisma.aboutContent.upsert({
      where: { id: 1 },
      create: { id: 1, highlight, body1, body2, body3, image1, image2, image3, image4 },
      update: { highlight, body1, body2, body3, image1, image2, image3, image4 },
    });
    res.json({ success: true, data: about });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

app.post("/api/admin/events", requireAdminKey, async (req, res) => {
  try {
    const { id, title, dateMeta, description, amount = 0, image, details, tags } = req.body;
    const data = { title, dateMeta, description, amount: Number(amount) || 0, image, details, tags };
    let event;
    if (id) {
      event = await prisma.event.update({ where: { id: Number(id) }, data });
    } else {
      event = await prisma.event.create({ data });
    }
    res.json({ success: true, data: event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Uploads
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({ storage });

app.post("/api/admin/upload", requireAdminKey, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: "No file uploaded" });
  }
  const url = `/uploads/${req.file.filename}`;
  res.json({ success: true, url });
});

module.exports = app;
