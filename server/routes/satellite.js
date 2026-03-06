const express = require('express');
const router = express.Router();
const axios = require('axios');
const NodeCache = require('node-cache');

const satCache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache for satellite data

// GET elevation data from OpenTopography
router.get('/elevation', async (req, res) => {
  const { lat_min, lat_max, lng_min, lng_max, dataset = 'SRTMGL1' } = req.query;

  if (!lat_min || !lat_max || !lng_min || !lng_max) {
    return res.status(400).json({ error: 'Bounding box required: lat_min, lat_max, lng_min, lng_max' });
  }

  const cacheKey = `elevation_${lat_min}_${lat_max}_${lng_min}_${lng_max}_${dataset}`;
  const cached = satCache.get(cacheKey);
  if (cached) return res.json({ ...cached, from_cache: true });

  try {
    const apiKey = process.env.OPENTOPO_API_KEY;
    if (!apiKey) {
      return res.json({
        demo_mode: true,
        message: 'Add OPENTOPO_API_KEY to .env for live LiDAR/elevation data',
        bbox: { lat_min, lat_max, lng_min, lng_max },
        dataset,
        api_docs: 'https://opentopography.org/developers'
      });
    }

    const url = `https://portal.opentopography.org/API/globaldem?demtype=${dataset}&west=${lng_min}&east=${lng_max}&south=${lat_min}&north=${lat_max}&outputFormat=GTiff&API_Key=${apiKey}`;

    // Return the URL for client-side fetching (GeoTIFF is binary)
    satCache.set(cacheKey, { url, dataset, bbox: { lat_min, lat_max, lng_min, lng_max } });
    res.json({ url, dataset, bbox: { lat_min, lat_max, lng_min, lng_max } });

  } catch (err) {
    console.error('Elevation API error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Search Copernicus/Sentinel catalog
router.get('/sentinel', async (req, res) => {
  const { lat, lng, date_from, date_to, collection = 'SENTINEL-2' } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'lat and lng required' });
  }

  const cacheKey = `sentinel_${lat}_${lng}_${collection}_${date_from}`;
  const cached = satCache.get(cacheKey);
  if (cached) return res.json({ ...cached, from_cache: true });

  try {
    const dateFilter = date_from
      ? `and ContentDate/Start gt ${date_from}T00:00:00.000Z`
      : "and ContentDate/Start gt 2024-01-01T00:00:00.000Z";

    const url = `https://catalogue.dataspace.copernicus.eu/odata/v1/Products?$filter=Collection/Name eq '${collection}' and OData.CSC.Intersects(area=geography'SRID=4326;POINT(${lng} ${lat})') ${dateFilter}&$orderby=ContentDate/Start desc&$top=5&$expand=Assets`;

    const response = await axios.get(url, { timeout: 10000 });
    const products = response.data.value || [];

    const result = {
      collection,
      location: { lat, lng },
      date_filter: date_from || '2024-01-01',
      products: products.map(p => ({
        id: p.Id,
        name: p.Name,
        date: p.ContentDate?.Start,
        size_mb: Math.round((p.ContentLength || 0) / 1048576),
        footprint: p.Footprint,
        download_url: `https://zipper.dataspace.copernicus.eu/odata/v1/Products(${p.Id})/$value`
      }))
    };

    satCache.set(cacheKey, result);
    res.json(result);

  } catch (err) {
    console.error('Sentinel API error:', err.message);
    // Return helpful demo response on error
    res.json({
      demo_mode: true,
      collection,
      location: { lat, lng },
      message: 'Register at dataspace.copernicus.eu for live Sentinel data access',
      sample_products: [
        { name: `S2A_MSIL2A_${date_from || '20240101'}_${Math.round(lat)}N${Math.round(lng)}E`, collection: 'SENTINEL-2', note: 'Demo entry' }
      ]
    });
  }
});

// Search Open Context for known archaeological sites in area
router.get('/sites', async (req, res) => {
  const { lat, lng, radius_km = 50, search = '' } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'lat and lng required' });
  }

  const cacheKey = `sites_${lat}_${lng}_${radius_km}_${search}`;
  const cached = satCache.get(cacheKey);
  if (cached) return res.json({ ...cached, from_cache: true });

  try {
    const r = parseFloat(radius_km) / 111; // approx degrees
    const bbox = `${parseFloat(lng)-r},${parseFloat(lat)-r},${parseFloat(lng)+r},${parseFloat(lat)+r}`;

    const url = `https://opencontext.org/search/.json?type=subjects&geo-bbox=${bbox}${search ? `&q=${encodeURIComponent(search)}` : ''}`;
    const response = await axios.get(url, { timeout: 8000 });

    const features = response.data.features || [];
    const result = {
      source: 'Open Context',
      location: { lat, lng },
      radius_km,
      total_sites: features.length,
      sites: features.slice(0, 20).map(f => ({
        label: f.properties?.label,
        uri: f.properties?.uri,
        lat: f.geometry?.coordinates?.[1],
        lng: f.geometry?.coordinates?.[0],
        category: f.properties?.['dc-terms:subject']?.[0]?.label
      })).filter(s => s.label)
    };

    satCache.set(cacheKey, result);
    res.json(result);

  } catch (err) {
    console.error('Open Context API error:', err.message);
    res.json({ demo_mode: true, message: 'Open Context API unavailable', sites: [] });
  }
});

module.exports = router;
