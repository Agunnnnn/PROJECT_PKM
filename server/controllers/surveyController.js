import { findAlumniByNis, createAlumni } from "../models/Alumni.js";
import {
  createSurveyEntry,
  getAllSurveyWithAlumni,
  getStatusCount,
  getRelevansiCount,
  countAlumni,
  countSurvey,
} from "../models/Survey.js";

export const createSurvey = async (req, res) => {
  try {
    const {
      nis,
      nama,
      jurusan,
      tahunLulus,
      email,
      noHp,
      statusSaatIni,
      namaPerusahaan,
      bidangKerja,
      relevansiJurusan,
      lamaTungguKerja,
      namaKampus,
      saranUntukSekolah,
    } = req.body;

    // Cari atau buat data alumni dulu
    let alumni = await findAlumniByNis(nis);
    if (!alumni) {
      alumni = await createAlumni({ nis, nama, jurusan, tahunLulus, email, noHp });
    }

    const survey = await createSurveyEntry({
      alumniId: alumni.id,
      statusSaatIni,
      namaPerusahaan,
      bidangKerja,
      relevansiJurusan,
      lamaTungguKerja,
      namaKampus,
      saranUntukSekolah,
    });

    res.status(201).json(survey);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllSurvey = async (req, res) => {
  try {
    const surveys = await getAllSurveyWithAlumni();
    res.json(surveys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const statusCount = await getStatusCount();
    const relevansiCount = await getRelevansiCount();
    const totalAlumni = await countAlumni();
    const totalSurvey = await countSurvey();

    res.json({ totalAlumni, totalSurvey, statusCount, relevansiCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
