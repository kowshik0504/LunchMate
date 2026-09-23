const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
    if (!filePath.endsWith('.jsx') && !filePath.endsWith('.js')) return;
    let code = fs.readFileSync(filePath, 'utf8');
    let original = code;
    
    code = code.replace(/â€¢/g, '•');
    code = code.replace(/ðŸ”’/g, '🔒');
    code = code.replace(/â­/g, '⭐');
    code = code.replace(/⭐\s*/g, '⭐ '); // Normalize spaces after star
    code = code.replace(/âœ…/g, '✅');
    code = code.replace(/âš/g, '⚠️');
    code = code.replace(/â‚¹/g, '₹');
    code = code.replace(/ï¿½/g, '₹');
    code = code.replace(//g, '•');
    
    // Quick specific fixes for the screenshots:
    code = code.replace(/Adyar, Chennai \? \+91 98401 22334/g, 'Adyar, Chennai • +91 98401 22334');
    code = code.replace(/Guindy, Chennai \? Trips Today:/g, 'Guindy, Chennai • Trips Today:');
    code = code.replace(/Velachery, Chennai \? Trips Today:/g, 'Velachery, Chennai • Trips Today:');
    
    if (code !== original) {
        fs.writeFileSync(filePath, code, 'utf8');
        console.log('Fixed:', filePath);
    }
}

function walk(dir) {
    let files = fs.readdirSync(dir);
    for (let f of files) {
        let fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else {
            fixFile(fullPath);
        }
    }
}

walk('src');
console.log('Done');
