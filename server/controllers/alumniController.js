import {
    findAlumniByNis,
    createAlumni,
    getAllAlumni as getAllAlumniModel,
    getDistinctJurusan,
    getDistinctTahunByJurusan,
    getAlumniByJurusanTahun,
} from "../models/Alumni.js";

export const findOrCreateAlumni = async (req, res) => {
    try {
        const { nis, nama, jurusan, tahunLulus, email, noHp } = req.body;

        let alumni = await findAlumniByNis(nis);
        if (!alumni) {
            alumni = await createAlumni({
                nis,
                nama,
                jurusan,
                tahunLulus,
                email,
                noHp,
            });
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

// Daftar jurusan unik (buat dropdown pertama)
export const getJurusanList = async (req, res) => {
    try {
        const jurusanList = await getDistinctJurusan();
        res.json(jurusanList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Daftar tahun lulus, difilter berdasarkan jurusan (buat dropdown kedua)
export const getTahunByJurusan = async (req, res) => {
    try {
        const { jurusan } = req.query;
        const tahunList = await getDistinctTahunByJurusan(jurusan);
        res.json(tahunList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Daftar nama alumni, difilter jurusan + tahun (buat dropdown ketiga, sekaligus ambil NIS)
export const searchAlumni = async (req, res) => {
    try {
        const { jurusan, tahunLulus } = req.query;
        const alumni = await getAlumniByJurusanTahun(jurusan, tahunLulus);
        res.json(alumni);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
