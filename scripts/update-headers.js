const fs = require('fs');

const baseHeader = `    <header class="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[1200px] z-50 bg-white/95 backdrop-blur-md rounded-2xl shadow-md border border-gray-200">
        <div class="h-20 max-w-[1200px] mx-auto px-6 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full shadow-sm flex items-center justify-center bg-white border border-gray-200 overflow-hidden">
                    <img alt="Logo" class="w-full h-full object-cover" src="logo.jpg">
                </div>
                <span class="font-headline-md text-[20px] font-bold text-indigo-700">QuoteFlow AI</span>
            </div>
            
            <nav class="hidden md:flex items-center gap-3">
                <a href="QuoteFlow_AI_Quotation_Builder.html" data-path="quote-input" class="flex items-center gap-2.5 px-5 py-2.5 rounded-full transition-all duration-200 {{link1_class}}" style="text-decoration:none;">
                    <span class="material-symbols-outlined text-[20px]">edit_note</span>
                    <span class="font-label-md text-xs uppercase tracking-wider">1. INPUT</span>
                </a>
                <a href="Step_2_Review_Details.html" data-path="quote-details" class="flex items-center gap-2.5 px-5 py-2.5 rounded-full transition-all duration-200 {{link2_class}}" style="text-decoration:none;">
                    <span class="material-symbols-outlined text-[20px]">list_alt</span>
                    <span class="font-label-md text-xs uppercase tracking-wider">2. DETAILS</span>
                </a>
                <a href="Step_3_Summary_PDF.html" data-path="quote-summary" class="flex items-center gap-2.5 px-5 py-2.5 rounded-full transition-all duration-200 {{link3_class}}" style="text-decoration:none;">
                    <span class="material-symbols-outlined text-[20px]">verified</span>
                    <span class="font-label-md text-xs uppercase tracking-wider">3. SUMMARY</span>
                </a>
            </nav>

            <div class="flex items-center gap-3 md:gap-4">
                <button class="md:hidden w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 shadow-sm flex items-center justify-center text-gray-600 hover:text-indigo-600 transition-colors border border-gray-200 active:scale-95" onclick="document.getElementById('mobile-menu').classList.toggle('hidden')" title="Menu">
                    <span class="material-symbols-outlined text-[20px]">menu</span>
                </button>
                <button class="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 shadow-sm flex items-center justify-center text-gray-600 hover:text-indigo-600 transition-colors border border-gray-200 active:scale-95" title="Help">
                    <span class="material-symbols-outlined text-[20px]">help</span>
                </button>
                <div class="relative group">
                    <div class="w-10 h-10 rounded-full shadow-sm p-0.5 bg-white border border-gray-200 cursor-pointer hover:border-indigo-300 transition-colors" id="profile-dropdown-trigger" title="Profile Menu">
                        <img id="user-profile-img" alt="Profile" class="w-full h-full rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbsDX4AjsNXcIxK0Ftt6os3qIdAQiKoIbbGQn5Vu7ItqsCyhBTxThQeWoUv9Klx-4Ov9Dqm1OX9pp_-ysLluz2RkDOcebveqxBuhMIbXZCOG-4SJwB_975WIDBhreeZxeVC3Vd4Aoi97063w-ZwrEWYOita4M3GO2B69jXd62tU6hEYqsrr1nj273zw_xjjmXMMZKTi5c0dKyoRrvpYbTwrbOzhglgaxtffuJT8HkLAJV1dJacT8d3">
                    </div>
                    <div class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right group-hover:translate-y-0 translate-y-2 z-50">
                        <div class="py-2 flex flex-col">
                            <a href="dashboard.html" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors" style="text-decoration:none;">
                                <span class="material-symbols-outlined text-[20px]">dashboard</span> Dashboard
                            </a>
                            <a href="profile.html" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors" style="text-decoration:none;">
                                <span class="material-symbols-outlined text-[20px]">person</span> Profile & Settings
                            </a>
                            <div class="h-[1px] bg-gray-100 my-1 mx-4"></div>
                            <button onclick="logoutUser()" class="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left">
                                <span class="material-symbols-outlined text-[20px]">logout</span> Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="mobile-menu" class="hidden md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md rounded-b-2xl p-4 flex flex-col gap-2">
            <a href="QuoteFlow_AI_Quotation_Builder.html" class="flex items-center gap-2.5 px-4 py-2 rounded-xl {{link1_class}}" style="text-decoration:none;">
                <span class="material-symbols-outlined text-[20px]">edit_note</span>
                <span class="font-label-md text-xs uppercase tracking-wider">1. INPUT</span>
            </a>
            <a href="Step_2_Review_Details.html" class="flex items-center gap-2.5 px-4 py-2 rounded-xl {{link2_class}}" style="text-decoration:none;">
                <span class="material-symbols-outlined text-[20px]">list_alt</span>
                <span class="font-label-md text-xs uppercase tracking-wider">2. DETAILS</span>
            </a>
            <a href="Step_3_Summary_PDF.html" class="flex items-center gap-2.5 px-4 py-2 rounded-xl {{link3_class}}" style="text-decoration:none;">
                <span class="material-symbols-outlined text-[20px]">verified</span>
                <span class="font-label-md text-xs uppercase tracking-wider">3. SUMMARY</span>
            </a>
        </div>
    </header>`;

const activeClass = "font-bold text-white bg-gray-900 shadow-sm";
const inactiveClass = "font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100";

const files = [
    { name: 'QuoteFlow_AI_Quotation_Builder.html', active: 1 },
    { name: 'Step_1_Input_Request.html', active: 1 },
    { name: 'Step_2_Review_Details.html', active: 2 },
    { name: 'Step_3_Summary_PDF.html', active: 3 },
    { name: 'dashboard.html', active: 0 },
    { name: 'profile.html', active: 0 }
];

for (const file of files) {
    if (!fs.existsSync(file.name)) continue;
    let content = fs.readFileSync(file.name, 'utf8');
    
    let currentHeader = baseHeader
        .replace(/\{\{link1_class\}\}/g, file.active === 1 ? activeClass : inactiveClass)
        .replace(/\{\{link2_class\}\}/g, file.active === 2 ? activeClass : inactiveClass)
        .replace(/\{\{link3_class\}\}/g, file.active === 3 ? activeClass : inactiveClass);
        
    content = content.replace(/<header[^>]*>([\s\S]*?)<\/header>/i, currentHeader);
    fs.writeFileSync(file.name, content);
    console.log(`Updated ${file.name}`);
}
