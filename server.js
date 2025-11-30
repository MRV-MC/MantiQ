require("dotenv").config();
const path = require("path");
const express = require("express");
const { PrismaClient, Prisma } = require("@prisma/client");
const { createPayment } = require("./services/payments");

const app = express();
const prisma = new PrismaClient();
const ADMIN_KEY = process.env.ADMIN_KEY || "secret123";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.render("index", {
    title: "MantiQ — магические мероприятия нового поколения",
    description:
      "Живые эзотерические встречи с интерактивами: свечи, таро, астрология и ритуалы в атмосфере MantiQ.",
  });
});

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

app.get("/admin", async (req, res) => {
  const key = req.query.key;
  if (key !== ADMIN_KEY) {
    return res.status(401).send("Access denied");
  }

  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
  });

  res.render("admin", { bookings });
});

module.exports = app;
