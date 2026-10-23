
const express = require("express");
const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");

const router = express.Router();

// GET: Get appointments with patient and doctor details
router.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patient", "name phone")
      .populate("doctor", "name specialization")
      .sort({ appointmentDate: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST: Book an appointment
router.post("/", async (req, res) => {
  try {
    const { patient, doctor, appointmentDate, appointmentTime } = req.body;

    if (
      !mongoose.isValidObjectId(patient) ||
      !mongoose.isValidObjectId(doctor)
    ) {
      return res.status(400).json({
        message: "Valid patient and doctor IDs are required",
      });
    }

    if (!appointmentDate || !appointmentTime) {
      return res.status(400).json({
        message: "Appointment date and time are required",
      });
    }

    const date = new Date(appointmentDate);

if (Number.isNaN(date.getTime())) {
  return res.status(400).json({
    message: "Invalid appointment date",
  });
}

const conflict = await Appointment.findOne({
  doctor,
  appointmentDate: {
    $gte: new Date(`${appointmentDate}T00:00:00`),
    $lt: new Date(`${appointmentDate}T23:59:59.999`),
  },
  appointmentTime,
  status: { $ne: "Cancelled" },
});

if (conflict) {
  return res.status(409).json({
    message: "This doctor already has an appointment at that date and time",
  });
}

const appointment = await Appointment.create({
  ...req.body,
  appointmentDate: date,
});

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("patient", "name phone")
      .populate("doctor", "name specialization");

    res.status(201).json(populatedAppointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH: Change appointment status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Scheduled", "Completed", "Cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid appointment status" });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE: Delete an appointment
router.delete("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
