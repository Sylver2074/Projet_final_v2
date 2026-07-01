const express = require('express');
const path = require('path');
const cors = require('cors');
const { execFile } = require('child_process');
const { isIP } = require('net');

const app = express();
const frontendPath = path.join(__dirname, '..', '..', 'frontend');

app.use(cors());
app.use(express.json());
app.use(express.static(frontendPath));

function isAllowedNetworkTarget(target) {
  const hostnamePattern = /^(?=.{1,253}$)(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.(?!-)[A-Za-z0-9-]{1,63}(?<!-))*\.?$/;

  return isIP(target) || hostnamePattern.test(target);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}

app.get('/api/health', (req, res) => {
  const isDatabaseConfigured = !!process.env.DATABASE_URL;
  const isJwtConfigured = !!process.env.JWT_SECRET;

  if (!isDatabaseConfigured || !isJwtConfigured) {
    return res.status(503).json({
      status: 'DOWN',
      error: "Configuration de sécurité manquante : variables d'environnement non détectées",
    });
  }

  return res.status(200).json({
    status: 'UP',
    timestamp: new Date(),
    vault_status: 'CONNECTED_TO_RUNTIME_SECRETS',
  });
});

app.get('/api/debug-ping', (req, res) => {
  const targetIp = String(req.query.ip || '127.0.0.1').trim();

  if (!isAllowedNetworkTarget(targetIp)) {
    return res.status(400).json({
      error: 'Cible réseau invalide',
    });
  }

  return execFile('ping', ['-c', '1', '--', targetIp], { timeout: 5000 }, (error, stdout) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ output: stdout });
  });
});

app.get('/api/welcome', (req, res) => {
  const name = req.query.name || 'Invité';
  res.type('html').send(`<h1>Bienvenue ${escapeHtml(name)}</h1>`);
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Le serveur écoute activement sur le port ${PORT}`);
  });
}

module.exports = app;
