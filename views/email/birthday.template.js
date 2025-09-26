const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const templatePath = path.join(__dirname, 'birthday.ejs');

function renderBirthdayTemplate(vars) {
    const tpl = fs.readFileSync(templatePath, 'utf8');
    return ejs.render(tpl, vars);
}

module.exports = { renderBirthdayTemplate };
