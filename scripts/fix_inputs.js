const fs = require('fs');

try {
let file1 = 'Step_2_Review_Details.html';
let content1 = fs.readFileSync(file1, 'utf8');
content1 = content1.replace(
  '<input class="w-full bg-gray-50 text-gray-900 text-sm rounded-xl py-3 pl-4 pr-4 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all shadow-inner" placeholder="" type="tel">',
  '<input class="w-full bg-gray-50 text-gray-900 text-sm rounded-xl py-3 pl-4 pr-4 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all shadow-inner" placeholder="" type="tel" maxlength="10" oninput="this.value = this.value.replace(/[^0-9]/g, \'\').slice(0, 10)">'
);
content1 = content1.replace(
  '<input class="w-full bg-gray-50 text-gray-900 text-sm rounded-xl py-3 pl-4 pr-10 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all shadow-inner uppercase tracking-widest font-mono" type="text" value="">',
  '<input class="w-full bg-gray-50 text-gray-900 text-sm rounded-xl py-3 pl-4 pr-10 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all shadow-inner uppercase tracking-widest font-mono" type="text" value="" maxlength="15" oninput="this.value = this.value.replace(/[^A-Za-z0-9]/g, \'\').toUpperCase().slice(0, 15)">'
);
fs.writeFileSync(file1, content1);
console.log('Fixed Step_2_Review_Details.html');
} catch (e) {
  console.error(e);
}

try {
let file2 = 'profile.html';
let content2 = fs.readFileSync(file2, 'utf8');
content2 = content2.replace(
  '<input type="text" id="set-company-phone" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none shadow-sm hover:border-gray-300" placeholder="+1 (555) 000-0000">',
  '<input type="text" id="set-company-phone" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none shadow-sm hover:border-gray-300" placeholder="+1 (555) 000-0000" maxlength="10" oninput="this.value = this.value.replace(/[^0-9]/g, \'\').slice(0, 10)">'
);
fs.writeFileSync(file2, content2);
console.log('Fixed profile.html');
} catch (e) {
  console.error(e);
}
