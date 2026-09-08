import { findAlumniByNis, createAlumni, getAllAlumni as getAllAlumniModel } from "../models/Alumni.js";

export const findOrCreateAlumni = async (req, res) => {
  try {
    const { nis, nama, jurusan, tahunLulus, email, noHp } = req.body;

    let alumni = await findAlumniByNis(nis);
    if (!alumni) {
      alumni = await createAlumni({ nis, nama, jurusan, tahunLulus, email, noHp });
    }

    res.status(200).json(alumni);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllAlumni = async (req, res) => {
  try {
    const alumni = await getAllAlumniModel();
    res.json(alumni);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
