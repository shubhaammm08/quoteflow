const fs = require('fs');
const file = 'profile.html';
let html = fs.readFileSync(file, 'utf8');

// 1. Add ID to Quote Number Prefix
html = html.replace(
  '<input type="text" class="w-24 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none font-mono" placeholder="QT-">',
  '<input type="text" id="set-quote-prefix" class="w-24 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none font-mono" placeholder="QT-">'
);

// 2. Add classes and data-colors to Brand Colors
html = html.replace(
    '<div class="w-10 h-10 rounded-full bg-indigo-600 shadow-sm border-2 border-white ring-2 ring-gray-200 cursor-pointer"></div>',
    '<div class="brand-color-option w-10 h-10 rounded-full bg-indigo-600 shadow-sm border-2 border-white ring-2 ring-gray-200 cursor-pointer" data-color="indigo-600"></div>'
).replace(
    '<div class="w-10 h-10 rounded-full bg-emerald-600 cursor-pointer opacity-50 hover:opacity-100 transition-opacity"></div>',
    '<div class="brand-color-option w-10 h-10 rounded-full bg-emerald-600 cursor-pointer opacity-50 hover:opacity-100 transition-opacity border-2 border-transparent ring-0" data-color="emerald-600"></div>'
).replace(
    '<div class="w-10 h-10 rounded-full bg-blue-600 cursor-pointer opacity-50 hover:opacity-100 transition-opacity"></div>',
    '<div class="brand-color-option w-10 h-10 rounded-full bg-blue-600 cursor-pointer opacity-50 hover:opacity-100 transition-opacity border-2 border-transparent ring-0" data-color="blue-600"></div>'
).replace(
    '<div class="w-10 h-10 rounded-full bg-gray-900 cursor-pointer opacity-50 hover:opacity-100 transition-opacity"></div>',
    '<div class="brand-color-option w-10 h-10 rounded-full bg-gray-900 cursor-pointer opacity-50 hover:opacity-100 transition-opacity border-2 border-transparent ring-0" data-color="gray-900"></div>'
);

// Add a hidden input for brand color inside the settings form
html = html.replace(
    '<form id="settings-form" class="flex flex-col gap-5 mt-2">',
    '<form id="settings-form" class="flex flex-col gap-5 mt-2">\n<input type="hidden" id="set-brand-color" value="indigo-600">'
);

// 3. Update load logic to include quotePrefix and brandColor
const loadOld = `                            document.getElementById('set-company-name').value = settings.companyName || '';
                            document.getElementById('set-company-address').value = settings.address || '';
                            document.getElementById('set-company-email').value = settings.email || '';
                            document.getElementById('set-company-phone').value = settings.phone || '';`;
const loadNew = `                            document.getElementById('set-company-name').value = settings.companyName || '';
                            document.getElementById('set-company-address').value = settings.address || '';
                            document.getElementById('set-company-email').value = settings.email || '';
                            document.getElementById('set-company-phone').value = settings.phone || '';
                            if (document.getElementById('set-quote-prefix')) document.getElementById('set-quote-prefix').value = settings.quotePrefix || 'QT-';
                            if (settings.brandColor) {
                                document.getElementById('set-brand-color').value = settings.brandColor;
                                document.querySelectorAll('.brand-color-option').forEach(el => {
                                    if (el.dataset.color === settings.brandColor) {
                                        el.classList.add('ring-2', 'ring-gray-200', 'border-white');
                                        el.classList.remove('opacity-50', 'border-transparent', 'ring-0');
                                    } else {
                                        el.classList.remove('ring-2', 'ring-gray-200', 'border-white');
                                        el.classList.add('opacity-50', 'border-transparent', 'ring-0');
                                    }
                                });
                            }`;
html = html.replace(loadOld, loadNew);

// 4. Update save logic to include quotePrefix and brandColor
const saveOld = `                        const settingsData = {
                            companyName: document.getElementById('set-company-name').value,
                            address: document.getElementById('set-company-address').value,
                            email: document.getElementById('set-company-email').value,
                            phone: document.getElementById('set-company-phone').value,
                        };`;
const saveNew = `                        const settingsData = {
                            companyName: document.getElementById('set-company-name').value,
                            address: document.getElementById('set-company-address').value,
                            email: document.getElementById('set-company-email').value,
                            phone: document.getElementById('set-company-phone').value,
                            quotePrefix: document.getElementById('set-quote-prefix') ? document.getElementById('set-quote-prefix').value : 'QT-',
                            brandColor: document.getElementById('set-brand-color') ? document.getElementById('set-brand-color').value : 'indigo-600',
                        };`;
html = html.replace(saveOld, saveNew);

// 5. Add event listeners for color selection
const domLoadedStart = `        document.addEventListener('DOMContentLoaded', () => {`;
const colorListeners = `        document.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('.brand-color-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    document.querySelectorAll('.brand-color-option').forEach(el => {
                        el.classList.remove('ring-2', 'ring-gray-200', 'border-white');
                        el.classList.add('opacity-50', 'border-transparent', 'ring-0');
                    });
                    e.target.classList.add('ring-2', 'ring-gray-200', 'border-white');
                    e.target.classList.remove('opacity-50', 'border-transparent', 'ring-0');
                    document.getElementById('set-brand-color').value = e.target.dataset.color;
                });
            });`;
html = html.replace(domLoadedStart, colorListeners);

fs.writeFileSync(file, html);
console.log('Fixed profile.html with brand kit saving');
