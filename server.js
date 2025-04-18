const express = require('express');
const multer = require('multer');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const upload = multer({ dest: 'public/uploads/' });

const submissions = [];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public', {
    index: false
}));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/xss-test', (req, res) => {
    const userInput = req.query.input || '';
    
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-XSS-Protection', '0'); 
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>XSS Test</title>
        </head>
        <body>
            <h1>XSS Test Page</h1>
            <div id="user-input-container">
                ${userInput}
            </div>
            <a href="/">Back to form</a>
        </body>
        </html>
    `);
});

app.post('/upload', upload.single('file'), (req, res) => {
    const { name, email, comment } = req.body;
    if (!req.file && !name && !email && !comment) {
        return res.status(400).send('No file or form data provided.');
    }
    
    const submission = { name, email, comment, file: req.file ? req.file.filename : null };
    submissions.push(submission);
    
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-XSS-Protection', '0'); 
    
    let response = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Form Submission</title>
        </head>
        <body>
            <h2>Form submitted successfully!</h2>
            <div>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <div><strong>Comment:</strong> ${comment}</div>
            </div>
    `;
    
    if (req.file) {
        const filename = req.file.filename;
        response += `
            <p><strong>File Uploaded:</strong> 
            <a href="/execute/${filename}">Execute this file</a>
            </p>
        `;
    }
    
    
    response += '<h3>Previous Submissions:</h3><ul>';
    submissions.forEach((sub) => {
        response += `
            <li>
                <div><strong>Name:</strong> ${sub.name}</div>
                <div><strong>Email:</strong> ${sub.email}</div>
                <div><strong>Comment:</strong> ${sub.comment}</div>
            </li>
            <hr>
        `;
    });
    
    response += `
            </ul>
            <p><a href="/">Back to form</a></p>
            
            <!-- For demonstration purposes only -->
            <script>
                console.log("Page loaded - XSS demonstration");
            </script>
        </body>
        </html>
    `;
    
    res.send(response);
});

app.get('/execute/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'public/uploads', filename);
    
    console.log(`Attempting to execute: ${filePath}`);

    exec(`node "${filePath}"`, (err, stdout, stderr) => {
        if (err) {
            console.error(`Execution error: ${stderr}`);
            return res.status(500).send(`Error executing file: ${stderr}`);
        }
        res.send(`Executed file. Output: ${stdout}`);
    });
});

app.listen(3000, () => {
    console.log('XSS Vulnerable server running on http://localhost:3000');
    console.log('Test XSS at: http://localhost:3000/xss-test?input=<script>alert("XSS")</script>');
});

// 6b5936e194da3713fc88e2c5e74a55b2