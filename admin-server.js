import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'admin'))); // Serve frontend UI

// Setup Multer for file uploads (store in memory for immediate processing)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const DATA_DIR = path.join(__dirname, 'public', 'data', 'proje');
const RAPOR_DIR = path.join(__dirname, 'public', 'data', 'rapor');
const ENV_PATH = path.join(__dirname, '.env.local');

// Ensure directories exist
[DATA_DIR, RAPOR_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Defined Required Schemas for validation
const SCHEMAS = {
    parsel360: ['OBJECTID', 'Name', 'ilce', 'parsel', 'Pafta', 'Nitelik', 'Mahalle', 'Ada', 'Alan', 'Shape_Length', 'Shape_Area', 'firma_adi', 'teslim_tarihi', 'toplam_konut', 'proje_tipi', 'ada-parsel', 'proje_nitelik', 'rayic_2025', 'rayic_sokak_adi'],
    distance_matrix: ['ada-parsel', 'poi_id', 'poi_adi', 'kategori', 'alt_kategori', 'mesafe_m', 'mesafe_km', 'sure_sn', 'sure_dk'],
    service_area: ['ID', 'CENTER_LON', 'CENTER_LAT', 'AA_MINS', 'AA_MODE', 'TOTAL_POP', 'ada-parsel'],
    trip_layer: ['start_name', 'start_coords', 'trips']
};

// Helper: Schema Validator
function validateSchema(incomingKeys, expectedKeys, filename) {
    const missingKeys = expectedKeys.filter(k => !incomingKeys.includes(k));
    const extraKeys = incomingKeys.filter(k => !expectedKeys.includes(k));

    if (missingKeys.length > 0 || extraKeys.length > 0) {
        let errorMsg = `⚠️ Şema Uyuşmazlığı (${filename}):\n`;
        if (missingKeys.length > 0) errorMsg += `- Eksik Alanlar: [${missingKeys.join(', ')}]\n`;
        if (extraKeys.length > 0) errorMsg += `- Fazladan/Hatalı Alan Adları: [${extraKeys.join(', ')}]`;
        throw new Error(errorMsg);
    }
}

// Helper: Append GeoJSON Features
function appendGeoJSON(filename, newGeoJSONBuffer, schemaType) {
    const filePath = path.join(DATA_DIR, filename);
    let oldData = { type: 'FeatureCollection', features: [] };

    if (fs.existsSync(filePath)) {
        try {
            oldData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (e) { console.error('Error parsing old geojson:', filename); }
    }

    let newData;
    try {
        newData = JSON.parse(newGeoJSONBuffer.toString('utf8'));
    } catch (e) {
        throw new Error(`Geçersiz JSON formatı: ${filename}`);
    }

    const expectedSchema = SCHEMAS[schemaType];

    if (newData && Array.isArray(newData.features)) {
        if (newData.features.length > 0) {
            validateSchema(Object.keys(newData.features[0].properties || {}), expectedSchema, filename);
        }
        oldData.features.push(...newData.features);
    } else if (newData && newData.type === 'Feature') {
        validateSchema(Object.keys(newData.properties || {}), expectedSchema, filename);
        oldData.features.push(newData);
    }

    fs.writeFileSync(filePath, JSON.stringify(oldData, null, 2));
    return true;
}

// Helper: Append GeoJSON Features and Inject ada-parsel
function appendGeoJSONWithParcel(filename, newGeoJSONBuffer, adaParsel, schemaType) {
    const filePath = path.join(DATA_DIR, filename);
    let oldData = { type: 'FeatureCollection', features: [] };

    if (fs.existsSync(filePath)) {
        try {
            oldData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (e) { console.error('Error parsing old geojson:', filename); }
    }

    let newData;
    try {
        newData = JSON.parse(newGeoJSONBuffer.toString('utf8'));
    } catch (e) {
        throw new Error(`Geçersiz JSON formatı: ${filename}`);
    }

    const formattedAdaParsel = adaParsel.replace('_', '-');
    const expectedSchema = SCHEMAS[schemaType];

    if (newData && Array.isArray(newData.features)) {
        if (newData.features.length > 0) {
            newData.features[0].properties = newData.features[0].properties || {};
            newData.features[0].properties['ada-parsel'] = formattedAdaParsel;
            validateSchema(Object.keys(newData.features[0].properties), expectedSchema, filename);
        }

        newData.features.forEach(f => {
            f.properties = f.properties || {};
            f.properties['ada-parsel'] = formattedAdaParsel;
            oldData.features.push(f);
        });
    } else if (newData && newData.type === 'Feature') {
        newData.properties = newData.properties || {};
        newData.properties['ada-parsel'] = formattedAdaParsel;
        validateSchema(Object.keys(newData.properties), expectedSchema, filename);
        oldData.features.push(newData);
    }

    fs.writeFileSync(filePath, JSON.stringify(oldData, null, 2));
    return true;
}

// Helper: Append Trip JSON
function appendTripJSON(filename, newTripBuffer, adaParsel) {
    const filePath = path.join(DATA_DIR, filename);
    let oldData = { parsels: {} };

    if (fs.existsSync(filePath)) {
        try {
            oldData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (e) { console.error('Error parsing old trips:', filename); }
    }

    let newData;
    try {
        newData = JSON.parse(newTripBuffer.toString('utf8'));
    } catch (e) {
        throw new Error(`Geçersiz JSON formatı: ${filename}`);
    }

    // Assuming new data also has .parsels structure, or it just has .trips
    if (!oldData.parsels) oldData.parsels = {};

    // Normalize adaParsel (e.g. 1105_8 to 1105-8)
    const formattedAdaParsel = adaParsel.replace('_', '-');

    let tripsToStore;
    if (Array.isArray(newData)) {
        tripsToStore = newData;
    } else if (newData.parsels && newData.parsels[formattedAdaParsel] && Array.isArray(newData.parsels[formattedAdaParsel].trips)) {
        tripsToStore = newData.parsels[formattedAdaParsel].trips;
    } else if (newData.parsels && newData.parsels[formattedAdaParsel]) {
        tripsToStore = newData.parsels[formattedAdaParsel];
    } else if (newData.trips && Array.isArray(newData.trips)) {
        tripsToStore = newData.trips;
    } else if (newData.routes && Array.isArray(newData.routes)) {
        tripsToStore = newData.routes;
    } else {
        // Fallback: Just wrap the whole uploaded object
        tripsToStore = newData;
    }

    const tripNode = { trips: Array.isArray(tripsToStore) ? tripsToStore : tripsToStore.trips || tripsToStore };

    // Validate schema of the new trip node against trip_layer schema
    // Since expected struct is { start_name, start_coords, trips }
    // Users might just upload trips arrays. Let's build a dummy envelope or allow minimal trips if only trips array provided
    if (!tripNode.start_name) tripNode.start_name = `Proje ${formattedAdaParsel}`;
    if (!tripNode.start_coords) tripNode.start_coords = [0, 0]; // Dummy coords to pass schema for pure trip arrays

    validateSchema(Object.keys(tripNode), SCHEMAS.trip_layer, filename);

    oldData.parsels[formattedAdaParsel] = tripNode;

    fs.writeFileSync(filePath, JSON.stringify(oldData, null, 2));
    return true;
}

// Helper: Append User to .env
function appendUserToEnv(adaParsel, firmaAdi, sifre, projeAdi) {
    // Standardize to use _ (underscore) in env variables
    const envKey = `USER_${adaParsel.replace('-', '_')}`;
    const envLine = `${envKey}="${firmaAdi}|${sifre}|${projeAdi}"\n`;

    try {
        fs.appendFileSync(ENV_PATH, envLine);
    } catch (e) {
        console.error('Error writing to .env.local', e);
        throw new Error('.env dosyasına yazılamadı.');
    }
}

app.post('/api/project', upload.fields([
    { name: 'parsel360_file', maxCount: 1 },
    { name: 'distance_matrix_file', maxCount: 1 },
    { name: 'trip_layer_file', maxCount: 1 },
    { name: 'service_area_file', maxCount: 1 },
    { name: 'report_file', maxCount: 1 }
]), async (req, res) => {
    try {
        const { firmaAdi, sifre, projeAdi, adaParsel } = req.body;

        if (!firmaAdi || !sifre || !adaParsel) {
            return res.status(400).json({ error: 'Firma Adı, Şifre ve Ada/Parsel zorunludur.' });
        }

        const files = req.files;
        const formattedAdaParsel = adaParsel.replace('_', '-');

        // 1. Append .env
        appendUserToEnv(adaParsel, firmaAdi, sifre, projeAdi || 'Yeni Proje');

        // 2. Process Files
        if (files['parsel360_file']) {
            appendGeoJSON('parsel360.geojson', files['parsel360_file'][0].buffer, 'parsel360');
        }

        if (files['distance_matrix_file']) {
            appendGeoJSON('olanak_poi.geojson', files['distance_matrix_file'][0].buffer, 'distance_matrix');
        }

        if (files['trip_layer_file']) {
            appendTripJSON('trip_layers.json', files['trip_layer_file'][0].buffer, adaParsel);
        }

        if (files['service_area_file']) {
            appendGeoJSONWithParcel('service_areas.geojson', files['service_area_file'][0].buffer, adaParsel, 'service_area');
        }

        // 3. Process Report (Save as [ada-parsel].[extension])
        if (files['report_file']) {
            const reportFile = files['report_file'][0];
            const ext = path.extname(reportFile.originalname) || '.pdf';
            const reportFileName = `${formattedAdaParsel}${ext}`;
            const reportPath = path.join(RAPOR_DIR, reportFileName);
            fs.writeFileSync(reportPath, reportFile.buffer);
        }

        res.json({ success: true, message: 'Proje başarıyla oluşturuldu ve veriler eklendi.' });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message || 'Sistemsel bir hata oluştu.' });
    }
});

app.listen(port, () => {
    console.log(`=========================================`);
    console.log(`🚀 Parsel360 Yerel Admin Paneli Başlatıldı`);
    console.log(`👉 http://localhost:${port}/ adresine gidin`);
    console.log(`=========================================`);
});
