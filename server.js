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

// Handle form submission
app.post('/send', upload.array('files', 10), (req, res) => {
    const { naam, plaats, observatie_tekst } = req.body;
    const files = req.files;

    // Set up nodemailer transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'ruben.otter3@gmail.com',
            pass: 'hgcb cgzf ciar iuwk' // Use the generated app password here
        }
    });

    // Create email options
    const mailOptions = {
        from: 'ruben.otter3@gmail.com',
        to: 'ruben.otter3@gmail.com',
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
        res.status(200).send('Message sent successfully');
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

