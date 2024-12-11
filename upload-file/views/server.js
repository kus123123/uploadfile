// app.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'filestorage/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Files of this type are not allowed!');
    }
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'filestorage')));

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/upload', upload.array('files', 10), (req, res) => {
  res.redirect('/');
});

app.delete('/delete/:fileName', (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(__dirname, 'filestorage', fileName);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.send(`File "${fileName}" has been deleted.`);
  } else {
    res.status(404).send(`File "${fileName}" not found.`);
  }
});

app.get('/view', (req, res) => {
  const uploadDirectory = path.join(__dirname, 'filestorage');
  fs.readdir(uploadDirectory, (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error reading the upload directory.');
    } else {
      const fileDetails = files.map(fileName => {
        const filePath = path.join(uploadDirectory, fileName);
        const stats = fs.statSync(filePath);
        return {
          name: fileName,
          size: stats.size
        };
      });
      res.json({ files: fileDetails });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});