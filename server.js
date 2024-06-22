const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Set up body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set up multer for file handling
const upload = multer({ dest: 'uploads/' });

// Serve static files (HTML, CSS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Define routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/submitted', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'submitted.html'));
});

// Handle form submission
app.post('/send', upload.array('files', 10), (req, res) => {
    const { naam, plaats, observatie_tekst } = req.body;
    const files = req.files;

    // Set up nodemailer transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: "enkeltjeandersland@gmail.com",
            pass: "baua lbms kkld lzjx" // Use the generated app password here
        }
    });

    // Create email options
    const mailOptions = {
        from: "enkeltjeandersland@gmail.com",
        to: "enkeltjeandersland@gmail.com",
        subject: `Contact Form Submission from ${naam}`,
        text: `Plaats: ${plaats}\nObservatie Tekst: ${observatie_tekst}`,
        attachments: files.map(file => ({
            filename: file.originalname,
            path: file.path
        }))
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send(error.toString());
        }
        // Delete uploaded files after sending the email
        files.forEach(file => {
            fs.unlink(file.path, err => {
                if (err) console.error(`Failed to delete file: ${file.path}`, err);
            });
        });
        //res.status(200).send("Message send succesfully.");
        res.redirect('/submitted');
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

