document.addEventListener('DOMContentLoaded', () => {

    const STORAGE_KEY = 'QuoteFlow_Data';

    // --- Toast Notification System ---
    const showToast = (message, icon = 'check_circle') => {
        let toastContainer = document.getElementById('quoteflow-toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'quoteflow-toast-container';
            toastContainer.className = 'fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = 'flex items-center gap-3 bg-gray-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-gray-700 text-sm font-medium transform transition-all duration-300 translate-y-4 opacity-0 pointer-events-auto max-w-md';
        toast.innerHTML = `<span class="material-symbols-outlined text-amber-400 text-[20px]">${icon}</span><span>${message}</span>`;
        toastContainer.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.remove('translate-y-4', 'opacity-0');
        });

        setTimeout(() => {
            toast.classList.add('translate-y-2', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    const showMockAlert = (message) => {
        showToast(message, 'info');
    };

    // Global utility to get state
    const getState = () => {
        const defaultState = {
            rawInput: '',
            customerInfo: {
                companyName: '',
                contactPerson: '',
                email: '',
                phone: '',
                billingAddress: '',
                gstin: ''
            },
            items: [],
            quotationInfo: {
                no: '',
                date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                validUntil: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
                currency: 'INR'
            },
            terms: {
                delivery: 'Delivery within 14 working days from date of PO. Delivery charges extra at actuals if outside city limits.',
                payment: '100% advance along with Purchase Order. Payments to be made via NEFT/RTGS to provided bank details.',
                conditions: '1. This quotation is valid for 30 days.\n2. Warranty as per OEM terms.\n3. Goods once sold will not be taken back.\n4. Subject to local jurisdiction.'
            },
            totals: {
                subtotal: 0,
                discount: 0,
                gst: 0,
                grandTotal: 0
            }
        };

        // Clear state on fresh start or reload of Step 1
        if (window.location.pathname.includes('QuoteFlow_AI_Quotation_Builder.html') || window.location.pathname === '/' || window.location.pathname === '') {
            const urlParams = new URLSearchParams(window.location.search);
            
            // Check if it's a page reload
            const navigationEntries = performance.getEntriesByType("navigation");
            const isReload = navigationEntries.length > 0 && navigationEntries[0].type === "reload";

            // If it's a reload OR not explicitly in edit mode, clear the state
            if (isReload || !urlParams.has('edit')) {
                localStorage.removeItem(STORAGE_KEY);
                return defaultState;
            }
        }

        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : defaultState;
    };

    const saveState = (state) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    };

    const numberToWords = (num) => {
        if (num === 0) return 'Zero';
        const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const formatGroup = (n) => {
            let str = '';
            if (n > 99) { str += a[Math.floor(n / 100)] + ' Hundred '; n %= 100; }
            if (n > 19) { str += b[Math.floor(n / 10)] + ' '; n %= 10; }
            if (n > 0) { str += a[n] + ' '; }
            return str.trim();
        };
        let word = '';
        if (num >= 10000000) { word += formatGroup(Math.floor(num / 10000000)) + ' Crore '; num %= 10000000; }
        if (num >= 100000) { word += formatGroup(Math.floor(num / 100000)) + ' Lakh '; num %= 100000; }
        if (num >= 1000) { word += formatGroup(Math.floor(num / 1000)) + ' Thousand '; num %= 1000; }
        word += formatGroup(num);
        return word.trim();
    };

    // Header buttons (Help, Settings, Profile)
    const headerButtons = document.querySelectorAll('header button, header .rounded-full.p-1');
    headerButtons.forEach(btn => {
        if (!btn.hasAttribute('data-initialized')) {
            btn.setAttribute('data-initialized', 'true');
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const iconText = btn.querySelector('.material-symbols-outlined')?.textContent || '';
                if (iconText.includes('help')) {
                    showToast('QuoteFlow Guide: Paste request -> Review extracted fields -> Generate PDF', 'help');
                } else if (iconText.includes('settings')) {
                    showToast('Settings: Configured with GST (18%) and INR (₹) defaults', 'settings');
                } else {
                    showToast('Logged in as Workspace Administrator', 'account_circle');
                }
            });
        }
    });

    // --- Step 1: Input Request ---
    if (window.location.pathname.includes('QuoteFlow_AI_Quotation_Builder') || window.location.pathname.includes('Step_1') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
        
        // Upload File
        const uploadBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('Upload File'));
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = '.pdf,.doc,.docx,.txt,image/*';
                fileInput.onchange = (e) => {
                    if (e.target.files.length > 0) {
                        const file = e.target.files[0];
                        let state = getState();
                        state.rawInput = 'Extracted from file: ' + file.name;
                        saveState(state);
                        
                        showToast('File "' + file.name + '" uploaded! Extracting details...', 'upload_file');
                        setTimeout(() => window.location.href = 'Step_2_Review_Details.html', 1200);
                    }
                };
                fileInput.click();
            });
        }

        // Enter Manually
        const manualBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('Enter Manually'));
        if (manualBtn) {
            manualBtn.addEventListener('click', () => {
                localStorage.removeItem(STORAGE_KEY);
                window.location.href = 'Step_2_Review_Details.html';
            });
        }
        
        // Extract Details 
        const extractBtn = document.getElementById('extract-text-btn');
        if (extractBtn) {
            extractBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                const textarea = document.querySelector('textarea');
                if(!textarea || textarea.value.trim().length < 5) {
                    showToast('Please paste a customer inquiry message to extract details.', 'warning');
                    return;
                }
                
                const originalText = extractBtn.innerHTML;
                extractBtn.innerHTML = '<span class="material-symbols-outlined text-[20px] animate-spin">refresh</span> Extracting...';
                extractBtn.style.pointerEvents = 'none';

                // Clear old state to prevent ghost data from previous quotations, but keep the current rawInput
                const currentRawInput = textarea.value;
                localStorage.removeItem(STORAGE_KEY);
                let state = getState();
                state.rawInput = currentRawInput;
                saveState(state);

                const API_KEY = 'YOUR_GEMINI_API_KEY';
                const prompt = `Extract the customer details and line items from the following inquiry. Return ONLY a valid JSON object without any markdown wrapping (no \`\`\`json). Use this exact structure:
{
  "customerInfo": {
    "companyName": "string or empty",
    "contactPerson": "string or empty",
    "email": "string or empty",
    "phone": "string or empty",
    "billingAddress": "string or empty"
  },
  "items": [
    {
      "description": "string",
      "qty": number,
      "price": number (0 if not mentioned)
    }
  ]
}

Inquiry:
${textarea.value}`;

                try {
                    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${API_KEY}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }]
                        })
                    });

                    const data = await response.json();
                    
                    if (data.candidates && data.candidates[0].content.parts[0].text) {
                        let rawText = data.candidates[0].content.parts[0].text;
                        
                        // Robust JSON extraction
                        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            rawText = jsonMatch[0];
                        }
                        
                        const cleanedText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
                        const extracted = JSON.parse(cleanedText);
                        
                        let state = getState();
                        state.rawInput = textarea.value;
                        
                        if (extracted.customerInfo) {
                            state.customerInfo = { ...state.customerInfo, ...extracted.customerInfo };
                        }
                        if (extracted.items && Array.isArray(extracted.items) && extracted.items.length > 0) {
                            state.items = extracted.items.map(i => ({
                                description: i.description || 'Item',
                                qty: i.qty || 1,
                                price: i.price || 0,
                                discount: 0,
                                tax: 18,
                                total: (i.qty || 1) * (i.price || 0)
                            }));
                        }
                        
                        saveState(state);
                        window.location.href = 'Step_2_Review_Details.html';
                    } else {
                        throw new Error('Invalid response from AI');
                    }
                } catch (error) {
                    console.error('Extraction fallback to local regex parser:', error);
                    // Fallback local parsing logic
                    let state = getState();
                    state.rawInput = textarea.value;
                    const text = textarea.value;
                    
                    // Simple regex item extractor
                    const lines = text.split('\n');
                    const extractedItems = [];
                    lines.forEach(line => {
                        const match1 = line.match(/(?:[\*\-•]?\s*)(\d+)\s*[x×]\s*(.+)/i);
                        const match2 = line.match(/(?:[\*\-•]?\s*)(.+)\s*:\s*(\d+)/i);
                        const match3 = line.match(/\|\s*([^\|]+?)\s*\|\s*(\d+)\s*\|/i);

                        let qty = null, desc = null;
                        
                        if (match1) {
                            qty = parseInt(match1[1]);
                            desc = match1[2];
                        } else if (match2) {
                            qty = parseInt(match2[2]);
                            desc = match2[1];
                        } else if (match3 && !match3[1].toLowerCase().includes('product') && !match3[1].toLowerCase().includes('item')) {
                            desc = match3[1];
                            qty = parseInt(match3[2]);
                        }
                        
                        if (desc && qty) {
                            extractedItems.push({ description: desc.trim(), qty: qty, price: 0, discount: 0, tax: 18, total: 0 });
                        }
                    });

                    if (extractedItems.length > 0) {
                        state.items = extractedItems;
                        
                        // Basic fallback customer details
                        const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
                        if (emailMatch) state.customerInfo.email = emailMatch[1];
                        
                        const phoneMatch = text.match(/(\+?\d{1,3}[\s-]?\d{4,5}[\s-]?\d{4,5})/);
                        if (phoneMatch) state.customerInfo.phone = phoneMatch[1];
                        
                        const companyMatch = text.match(/(?:Company|Organization):\s*(.+)/i);
                        if (companyMatch) state.customerInfo.companyName = companyMatch[1].trim();

                        saveState(state);
                        window.location.href = 'Step_2_Review_Details.html';
                    } else {
                        // Restore button state
                        extractBtn.innerHTML = originalText;
                        extractBtn.style.pointerEvents = 'auto';
                        showToast('Extraction failed. Please adjust your text or Enter Manually.', 'error');
                    }
                }
            });
        }
        
        const textarea = document.querySelector('textarea');
        if (textarea) {
            let state = getState();
            if (state.rawInput) {
                textarea.value = state.rawInput;
            } else {
                textarea.value = '';
            }
            textarea.addEventListener('input', () => {
                let state = getState();
                state.rawInput = textarea.value;
                saveState(state);
            });
        }

        // Paste button inside textarea
        const pasteBtn = document.getElementById('paste-btn') || 
                         document.querySelector('.relative button') || 
                         Array.from(document.querySelectorAll('button')).find(b => b.querySelector('.material-symbols-outlined')?.textContent.trim() === 'content_paste');
        
        if (pasteBtn) {
            pasteBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                const targetArea = document.querySelector('textarea');
                if (!targetArea) return;

                try {
                    const text = await navigator.clipboard.readText();
                    if (text && text.trim().length > 0) {
                        targetArea.value = text;
                        targetArea.focus();
                        let state = getState();
                        state.rawInput = text;
                        saveState(state);
                        showToast('Pasted content from clipboard!', 'content_paste');
                    } else {
                        showToast('Clipboard is empty. Copy text first!', 'warning');
                    }
                } catch (err) {
                    console.warn('Clipboard permission or API restriction:', err);
                    targetArea.focus();
                    showToast('Please press Ctrl+V to paste your message.', 'info');
                }
            });
        }

        // --- Option B: Import Existing Quotation PDF Handler ---
        const pdfDropzone = document.getElementById('pdf-dropzone');
        const pdfFileInput = document.getElementById('pdf-file-input');
        const selectedPdfCard = document.getElementById('selected-pdf-card');
        const selectedPdfName = document.getElementById('selected-pdf-name');
        const selectedPdfSize = document.getElementById('selected-pdf-size');
        const removePdfBtn = document.getElementById('remove-pdf-btn');
        const extractPdfBtn = document.getElementById('extract-pdf-btn');
        const pdfProgressContainer = document.getElementById('pdf-progress-container');
        
        // Modal elements
        const confirmModal = document.getElementById('overwrite-confirm-modal');
        const modalCancelBtn = document.getElementById('modal-cancel-btn');
        const modalContinueBtn = document.getElementById('modal-continue-btn');

        let selectedPdfFile = null;

        const formatBytes = (bytes) => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
        };

        const handleFileSelection = (file) => {
            if (!file) return;

            // PDF Type Validation
            if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                showToast('Please upload a valid PDF file.', 'error');
                return;
            }

            // File Size Limit Validation (10MB)
            if (file.size > 10 * 1024 * 1024) {
                showToast('This PDF is too large to process. Please upload a smaller file.', 'warning');
                return;
            }

            selectedPdfFile = file;
            if (selectedPdfName) selectedPdfName.textContent = file.name;
            if (selectedPdfSize) selectedPdfSize.textContent = formatBytes(file.size);

            if (selectedPdfCard) selectedPdfCard.classList.remove('hidden');
            if (extractPdfBtn) {
                extractPdfBtn.disabled = false;
                extractPdfBtn.className = 'w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 text-base';
            }
            showToast(`PDF selected: ${file.name}`, 'picture_as_pdf');
        };

        const clearPdfSelection = () => {
            selectedPdfFile = null;
            if (pdfFileInput) pdfFileInput.value = '';
            if (selectedPdfCard) selectedPdfCard.classList.add('hidden');
            if (extractPdfBtn) {
                extractPdfBtn.disabled = true;
                extractPdfBtn.className = 'w-full sm:w-auto bg-gray-200 text-gray-400 font-semibold py-3.5 px-8 rounded-xl cursor-not-allowed transition-all flex items-center justify-center gap-2 text-base';
            }
        };

        if (pdfDropzone && pdfFileInput) {
            pdfDropzone.addEventListener('click', () => pdfFileInput.click());

            pdfFileInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files.length > 0) {
                    handleFileSelection(e.target.files[0]);
                }
            });

            pdfDropzone.addEventListener('dragover', (e) => {
                e.preventDefault();
                pdfDropzone.classList.add('border-indigo-500', 'bg-indigo-50/70');
            });

            ['dragleave', 'dragend'].forEach(evt => {
                pdfDropzone.addEventListener(evt, () => {
                    pdfDropzone.classList.remove('border-indigo-500', 'bg-indigo-50/70');
                });
            });

            pdfDropzone.addEventListener('drop', (e) => {
                e.preventDefault();
                pdfDropzone.classList.remove('border-indigo-500', 'bg-indigo-50/70');
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleFileSelection(e.dataTransfer.files[0]);
                }
            });
        }

        if (removePdfBtn) {
            removePdfBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                clearPdfSelection();
                showToast('Removed selected PDF', 'info');
            });
        }

        const executePDFExtraction = async () => {
            if (!selectedPdfFile) return;

            if (pdfProgressContainer) pdfProgressContainer.classList.remove('hidden');
            if (extractPdfBtn) {
                extractPdfBtn.disabled = true;
                extractPdfBtn.innerHTML = '<span class="material-symbols-outlined text-[20px] animate-spin">refresh</span> Extracting PDF...';
            }

            // Clear old state to prevent ghost data from previous quotations
            localStorage.removeItem(STORAGE_KEY);

            try {
                const response = await fetch('/api/extract-pdf-quotation', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/pdf'
                    },
                    body: selectedPdfFile
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    if (result.isScanned) {
                        showToast('This PDF appears to be scanned or image-based. AI vision/OCR extraction may be required.', 'warning');
                    } else {
                        showToast(result.error || 'We couldn\'t extract the quotation details. Please try again.', 'error');
                    }
                    if (pdfProgressContainer) pdfProgressContainer.classList.add('hidden');
                    if (extractPdfBtn) {
                        extractPdfBtn.disabled = false;
                        extractPdfBtn.innerHTML = '<span class="material-symbols-outlined text-[20px]">auto_awesome</span> Extract Quotation PDF';
                    }
                    return;
                }

                // AI Data Mapping into QuoteFlow_Data
                const aiData = result.data || {};
                let state = getState();

                state.rawInput = `Imported from PDF: ${selectedPdfFile.name}`;

                // Map Customer Info
                if (aiData.customerInfo) {
                    state.customerInfo = {
                        companyName: aiData.customerInfo.companyName || state.customerInfo.companyName || '',
                        contactPerson: aiData.customerInfo.contactPerson || state.customerInfo.contactPerson || '',
                        email: aiData.customerInfo.email || state.customerInfo.email || '',
                        phone: aiData.customerInfo.phone || state.customerInfo.phone || '',
                        billingAddress: aiData.customerInfo.billingAddress || state.customerInfo.billingAddress || '',
                        gstin: aiData.customerInfo.gstin || state.customerInfo.gstin || ''
                    };
                }

                // Map Quotation Info
                if (aiData.quotationInfo) {
                    state.quotationInfo = {
                        no: aiData.quotationInfo.no || `QT-${Date.now().toString().slice(-4)}`,
                        date: aiData.quotationInfo.date || state.quotationInfo.date,
                        validUntil: aiData.quotationInfo.validUntil || state.quotationInfo.validUntil,
                        currency: (aiData.quotationInfo.currency && ['INR','USD','EUR'].includes(aiData.quotationInfo.currency)) ? aiData.quotationInfo.currency : 'INR'
                    };
                }

                // Map Line Items & Recalculate Totals accurately
                if (aiData.items && Array.isArray(aiData.items) && aiData.items.length > 0) {
                    let subtotal = 0;
                    state.items = aiData.items.map(i => {
                        const qty = parseFloat(i.qty) || 1;
                        const price = parseFloat(i.price) || 0;
                        const discount = parseFloat(i.discount) || 0;
                        const tax = parseFloat(i.tax) || 18;
                        const itemTotal = (qty * price) * (1 - (discount / 100));
                        subtotal += itemTotal;
                        return {
                            description: i.description || 'Item',
                            qty: qty,
                            price: price,
                            discount: discount,
                            tax: tax,
                            total: itemTotal
                        };
                    });

                    const gst = subtotal * 0.18;
                    const grandTotal = subtotal + gst;
                    state.totals = {
                        subtotal: subtotal,
                        discount: 0,
                        gst: gst,
                        grandTotal: grandTotal
                    };
                }

                // Map Terms
                if (aiData.terms) {
                    state.terms = {
                        delivery: aiData.terms.delivery || state.terms.delivery,
                        payment: aiData.terms.payment || state.terms.payment,
                        conditions: aiData.terms.conditions || state.terms.conditions
                    };
                }

                // Internal Source Metadata
                state.metadata = {
                    sourceType: 'pdf_import',
                    sourceFileName: selectedPdfFile.name,
                    importedAt: new Date().toISOString()
                };

                saveState(state);
                showToast('Quotation imported successfully. Review the extracted details before continuing.', 'check_circle');

                setTimeout(() => {
                    window.location.href = 'Step_2_Review_Details.html';
                }, 1000);

            } catch (err) {
                console.error('PDF extraction network error:', err);
                showToast('Network error during PDF extraction. Please try again.', 'error');
                if (pdfProgressContainer) pdfProgressContainer.classList.add('hidden');
                if (extractPdfBtn) {
                    extractPdfBtn.disabled = false;
                    extractPdfBtn.innerHTML = '<span class="material-symbols-outlined text-[20px]">auto_awesome</span> Extract Quotation PDF';
                }
            }
        };

        if (extractPdfBtn) {
            extractPdfBtn.addEventListener('click', () => {
                if (!selectedPdfFile) return;

                // Check unsaved state overwrite
                const existingStored = localStorage.getItem(STORAGE_KEY);
                if (existingStored) {
                    try {
                        const parsed = JSON.parse(existingStored);
                        if (parsed.rawInput || (parsed.items && parsed.items.length > 0 && parsed.customerInfo && parsed.customerInfo.companyName !== 'TechNova Innovations Pvt. Ltd.')) {
                            if (confirmModal) {
                                confirmModal.classList.remove('hidden');
                                return;
                            }
                        }
                    } catch(e) {}
                }

                executePDFExtraction();
            });
        }

        if (modalCancelBtn) {
            modalCancelBtn.addEventListener('click', () => {
                if (confirmModal) confirmModal.classList.add('hidden');
            });
        }

        if (modalContinueBtn) {
            modalContinueBtn.addEventListener('click', () => {
                if (confirmModal) confirmModal.classList.add('hidden');
                executePDFExtraction();
            });
        }
    }

    // --- Step 2: Review Details ---
    if (window.location.pathname.includes('Step_2')) {
        
        let currentState = getState();
        
        // Auto-clear legacy ghost data if it's the exact mock data
        if (currentState.customerInfo && currentState.customerInfo.companyName === 'TechNova Innovations Pvt. Ltd.') {
            localStorage.removeItem(STORAGE_KEY);
            currentState = getState();
        }

        const formatCurrency = (amount) => {
            const symbol = currentState.quotationInfo.currency === 'USD' ? '$' : currentState.quotationInfo.currency === 'EUR' ? '€' : '₹';
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: currentState.quotationInfo.currency || 'INR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount).replace(/[a-zA-Z]+/, '').trim().replace(/^[^0-9]+/, symbol);
        };

        const parseCurrency = (str) => {
            return parseFloat(str.toString().replace(/[^0-9.-]+/g,"")) || 0;
        };

        const updateStateFromDOM = () => {
            // Customer Info
            const compName = document.getElementById('client-company-name');
            const contactName = document.getElementById('client-contact-person');
            const email = document.getElementById('client-email');
            const phone = document.getElementById('client-phone');
            const gstin = document.getElementById('client-gstin');
            const billingAddress = document.getElementById('client-address');
            
            if (compName) currentState.customerInfo.companyName = compName.value;
            if (contactName) currentState.customerInfo.contactPerson = contactName.value;
            if (email) currentState.customerInfo.email = email.value;
            if (phone) currentState.customerInfo.phone = phone.value;
            if (gstin) currentState.customerInfo.gstin = gstin.value;
            if (billingAddress) currentState.customerInfo.billingAddress = billingAddress.value;

            // Quotation Info
            const qInputs = document.querySelectorAll('.sticky section:nth-of-type(1) input');
            if(qInputs.length >= 2) {
                currentState.quotationInfo.no = qInputs[0].value;
                currentState.quotationInfo.date = qInputs[1].value;
                if(qInputs[2]) currentState.quotationInfo.validUntil = qInputs[2].value;
            }
            const currencySelect = document.querySelector('.sticky section:nth-of-type(1) select');
            if(currencySelect) currentState.quotationInfo.currency = currencySelect.value;

            // Terms
            const termTextareas = document.querySelectorAll('section:nth-of-type(3) textarea');
            if(termTextareas.length >= 3) {
                currentState.terms.delivery = termTextareas[0].value;
                currentState.terms.payment = termTextareas[1].value;
                currentState.terms.conditions = termTextareas[2].value;
            }
            
            // Items
            currentState.items = [];
            const rows = document.querySelectorAll('#items-table tr');
            rows.forEach(row => {
                const descArea = row.querySelector('textarea');
                if (!descArea) return;
                const desc = descArea.value;
                const qtyInput = row.querySelector('td:nth-child(2) input');
                const qty = qtyInput ? (parseFloat(qtyInput.value) || 0) : 1;
                const priceInput = row.querySelector('td:nth-child(3) input');
                const price = priceInput ? parseCurrency(priceInput.value) : 0;
                const discountInput = row.querySelector('td:nth-child(4) input');
                const discount = discountInput ? (parseFloat(discountInput.value) || 0) : 0;
                const taxStr = row.querySelector('td:nth-child(5)')?.textContent.replace('%','') || '18';
                const tax = parseFloat(taxStr) || 18;
                const itemTotal = (qty * price) * (1 - (discount / 100));
                
                currentState.items.push({
                    description: desc,
                    qty: qty,
                    price: price,
                    discount: discount,
                    tax: tax,
                    total: itemTotal
                });
            });

            saveState(currentState);
        };

        const calculateTotals = () => {
            updateStateFromDOM();
            const rows = document.querySelectorAll('#items-table tr');
            let subtotal = 0;
            
            rows.forEach((row, index) => {
                const item = currentState.items[index];
                if(item) {
                    const totalCell = row.querySelector('td:last-child');
                    if (totalCell) totalCell.textContent = formatCurrency(item.total);
                    subtotal += item.total;
                }
            });

            const gst = subtotal * 0.18;
            const grandTotal = subtotal + gst;
            
            currentState.totals.subtotal = subtotal;
            currentState.totals.gst = gst;
            currentState.totals.grandTotal = grandTotal;
            saveState(currentState);

            // Update UI
            const spans = Array.from(document.querySelectorAll('span, p, div'));
            
            const subtotalLabel = spans.find(s => s.textContent.trim() === 'Subtotal');
            if (subtotalLabel && subtotalLabel.nextElementSibling) {
                subtotalLabel.nextElementSibling.textContent = formatCurrency(subtotal);
            }

            const step2GstVal = document.getElementById('step2-gst-val');
            if (step2GstVal) {
                step2GstVal.textContent = formatCurrency(gst);
            }
            
            // Grand Total in card
            const gtLabel = spans.find(s => s.textContent.trim().toLowerCase() === 'grand total' && s.nextElementSibling && s.nextElementSibling.querySelector('.font-headline-xl'));
            if (gtLabel && gtLabel.nextElementSibling) {
                const gtSpan = gtLabel.nextElementSibling.querySelector('.font-headline-xl');
                if (gtSpan) gtSpan.textContent = formatCurrency(grandTotal);
            }

            const step2GrandTotalWords = document.getElementById('step2-grand-total-words');
            if (step2GrandTotalWords) {
                const currencyName = currentState.quotationInfo.currency === 'INR' ? ' Rupees' : (currentState.quotationInfo.currency === 'USD' ? ' Dollars' : ' Euros');
                step2GrandTotalWords.textContent = numberToWords(Math.round(grandTotal)) + currencyName + ' Only';
            }
            
            // Sticky Total
            const stickyTotalEl = document.getElementById('sticky-total');
            if (stickyTotalEl) {
                stickyTotalEl.textContent = formatCurrency(grandTotal);
            }
        };

        const attachRowListeners = (row) => {
            const inputs = row.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.addEventListener('input', calculateTotals);
            });

            const copyBtn = Array.from(row.querySelectorAll('button')).find(b => b.innerHTML.includes('content_copy'));
            const deleteBtn = Array.from(row.querySelectorAll('button')).find(b => b.innerHTML.includes('delete'));

            if (copyBtn) {
                copyBtn.addEventListener('click', () => {
                    const newRow = row.cloneNode(true);
                    row.parentNode.insertBefore(newRow, row.nextSibling);
                    attachRowListeners(newRow);
                    calculateTotals();
                    showToast('Item row duplicated', 'content_copy');
                });
            }

            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    if (document.querySelectorAll('#items-table tr').length > 1) {
                        row.remove();
                        calculateTotals();
                        showToast('Item row deleted', 'delete');
                    } else {
                        showToast('Cannot delete the only item row.', 'warning');
                    }
                });
            }
        };

        // Populate DOM from state
        const populateStep2 = () => {
            // Customer Info
            const compName = document.getElementById('client-company-name');
            const contactName = document.getElementById('client-contact-person');
            const email = document.getElementById('client-email');
            const phone = document.getElementById('client-phone');
            const gstin = document.getElementById('client-gstin');
            const billingAddress = document.getElementById('client-address');

            if(compName) compName.value = currentState.customerInfo.companyName || '';
            if(contactName) contactName.value = currentState.customerInfo.contactPerson || '';
            if(email) email.value = currentState.customerInfo.email || '';
            if(phone) phone.value = currentState.customerInfo.phone || '';
            if(gstin) gstin.value = currentState.customerInfo.gstin || '';
            if(billingAddress) billingAddress.value = currentState.customerInfo.billingAddress || '';

            // Load clients for auto-fill dropdown
            if (compName && window.getUserClients) {
                const datalist = document.getElementById('client-list');
                const loadClients = async (retries = 3) => {
                    const clients = await window.getUserClients();
                    if (clients && clients.length > 0) {
                        datalist.innerHTML = '';
                        clients.forEach(client => {
                            const option = document.createElement('option');
                            option.value = client.companyName;
                            datalist.appendChild(option);
                        });

                        // Bind auto-fill logic
                        compName.addEventListener('change', (e) => {
                            const selected = clients.find(c => c.companyName === e.target.value);
                            if (selected) {
                                if(contactName && selected.contactPerson) contactName.value = selected.contactPerson;
                                if(email && selected.email) email.value = selected.email;
                                if(phone && selected.phone) phone.value = selected.phone;
                                if(gstin && selected.gstin) gstin.value = selected.gstin;
                                if(billingAddress && selected.billingAddress) billingAddress.value = selected.billingAddress;
                                showToast('Client details auto-filled!');
                            }
                        });
                    } else if (retries > 0) {
                        setTimeout(() => loadClients(retries - 1), 1000);
                    }
                };
                loadClients();
            }

            // Quotation Info
            const qInputs = document.querySelectorAll('.sticky section:nth-of-type(1) input');
            if(qInputs.length >= 2) {
                if (!currentState.quotationInfo.no && window.getNextQuoteNumber) {
                    qInputs[0].value = 'Generating...';
                    window.getNextQuoteNumber().then(num => {
                        currentState.quotationInfo.no = num;
                        qInputs[0].value = num;
                        saveState(currentState);
                    });
                } else {
                    qInputs[0].value = currentState.quotationInfo.no || '';
                }
                
                qInputs[1].value = currentState.quotationInfo.date || '';
                if(qInputs[2]) qInputs[2].value = currentState.quotationInfo.validUntil || '';
            }
            const currencySelect = document.querySelector('.sticky section:nth-of-type(1) select');
            if(currencySelect) currencySelect.value = currentState.quotationInfo.currency || 'INR';

            // Terms
            const termTextareas = document.querySelectorAll('section:nth-of-type(3) textarea');
            if(termTextareas.length >= 3) {
                termTextareas[0].value = currentState.terms.delivery || '';
                termTextareas[1].value = currentState.terms.payment || '';
                termTextareas[2].value = currentState.terms.conditions || '';
            }

            // Items Table
            const tableBody = document.getElementById('items-table');
            if(tableBody) {
                tableBody.innerHTML = '';
                currentState.items.forEach(item => {
                    const rowHtml = `
                    <tr class="group relative bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 transition-all">
                    <td class="py-2 px-2 rounded-l-xl">
                    <div class="flex items-start gap-3">
                    <div class="mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                    <button class="w-7 h-7 rounded-full flex items-center justify-center bg-gray-50 border border-gray-200 text-gray-600 hover:text-primary active:shadow-inner transition-all mb-1" title="Duplicate"><span class="material-symbols-outlined text-[14px]">content_copy</span></button>
                    <button class="w-7 h-7 rounded-full flex items-center justify-center bg-gray-50 border border-gray-200 text-gray-600 hover:text-red-600 active:shadow-inner transition-all" title="Delete"><span class="material-symbols-outlined text-[14px]">delete</span></button>
                    </div>
                    <div class="flex-1"><textarea class="w-full bg-gray-50 text-gray-900 font-body-md text-body-md rounded-xl py-1.5 px-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" rows="1">${item.description}</textarea></div>
                    </div>
                    </td>
                    <td class="py-2 px-2 text-right"><input class="w-16 text-right bg-gray-50 rounded-xl py-1.5 px-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50" type="number" value="${item.qty}"></td>
                    <td class="py-2 px-2 text-right"><div class="flex items-center justify-end gap-1"><span class="currency-symbol">₹</span><input class="w-24 text-right bg-gray-50 rounded-xl py-1.5 px-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50" type="text" value="${item.price}"></div></td>
                    <td class="py-2 px-2 text-right"><div class="flex items-center justify-end gap-1"><input class="w-16 text-right bg-gray-50 rounded-xl py-1.5 px-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50" type="text" value="${item.discount}"><span>%</span></div></td>
                    <td class="py-2 px-2 text-right text-gray-600">${item.tax}%</td>
                    <td class="py-2 px-2 text-right font-label-md font-bold text-gray-900">${formatCurrency(item.total)}</td>
                    </tr>`;
                    tableBody.insertAdjacentHTML('beforeend', rowHtml);
                });
            }
        };

        populateStep2();

        // Attach listeners to rows
        document.querySelectorAll('#items-table tr').forEach(attachRowListeners);
        
        // Initial calculation
        calculateTotals();

        // Watch currency change
        const currencySelect = document.querySelector('.sticky section:nth-of-type(1) select');
        if(currencySelect) {
            currencySelect.addEventListener('change', () => {
                const sym = currencySelect.value === 'USD' ? '$' : currencySelect.value === 'EUR' ? '€' : '₹';
                document.querySelectorAll('.currency-symbol').forEach(el => el.textContent = sym);
                calculateTotals();
                showToast(`Currency changed to ${currencySelect.value}`, 'payments');
            });
        }

        // Add Item & Add Blank Row
        const addRowBtns = Array.from(document.querySelectorAll('button')).filter(btn => btn.textContent.includes('Add Item') || btn.textContent.includes('Add Blank Row'));
        addRowBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tableBody = document.getElementById('items-table');
                if (tableBody) {
                    const rowHtml = `
                    <tr class="group relative bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 transition-all">
                    <td class="py-2 px-2 rounded-l-xl">
                    <div class="flex items-start gap-3">
                    <div class="mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                    <button class="w-7 h-7 rounded-full flex items-center justify-center bg-gray-50 border border-gray-200 text-gray-600 hover:text-primary active:shadow-inner transition-all mb-1" title="Duplicate"><span class="material-symbols-outlined text-[14px]">content_copy</span></button>
                    <button class="w-7 h-7 rounded-full flex items-center justify-center bg-gray-50 border border-gray-200 text-gray-600 hover:text-red-600 active:shadow-inner transition-all" title="Delete"><span class="material-symbols-outlined text-[14px]">delete</span></button>
                    </div>
                    <div class="flex-1"><textarea class="w-full bg-gray-50 text-gray-900 font-body-md text-body-md rounded-xl py-1.5 px-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" rows="1" placeholder="New Item Description..."></textarea></div>
                    </div>
                    </td>
                    <td class="py-2 px-2 text-right"><input class="w-16 text-right bg-gray-50 rounded-xl py-1.5 px-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50" type="number" value="1"></td>
                    <td class="py-2 px-2 text-right"><div class="flex items-center justify-end gap-1"><span class="currency-symbol">₹</span><input class="w-24 text-right bg-gray-50 rounded-xl py-1.5 px-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50" type="text" value="0"></div></td>
                    <td class="py-2 px-2 text-right"><div class="flex items-center justify-end gap-1"><input class="w-16 text-right bg-gray-50 rounded-xl py-1.5 px-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50" type="text" value="0"><span>%</span></div></td>
                    <td class="py-2 px-2 text-right text-gray-600">18%</td>
                    <td class="py-2 px-2 text-right font-label-md font-bold text-gray-900">₹0</td>
                    </tr>`;
                    tableBody.insertAdjacentHTML('beforeend', rowHtml);
                    attachRowListeners(tableBody.lastElementChild);
                    calculateTotals();
                    showToast('New item row added', 'add');
                }
            });
        });

        // Catalog Modal Logic
        const openCatalogBtn = document.getElementById('open-catalog-modal-btn');
        const closeCatalogBtn = document.getElementById('close-catalog-btn');
        const catalogModal = document.getElementById('catalog-modal');
        const catalogModalList = document.getElementById('catalog-modal-list');

        if (openCatalogBtn && catalogModal) {
            openCatalogBtn.addEventListener('click', async () => {
                catalogModal.classList.remove('opacity-0', 'pointer-events-none');
                catalogModal.querySelector('div').classList.remove('scale-95');
                
                catalogModalList.innerHTML = '<div class="text-center py-4 text-gray-400"><span class="material-symbols-outlined animate-spin text-[24px]">refresh</span></div>';

                if (window.getUserCatalog) {
                    const catalog = await window.getUserCatalog();
                    catalogModalList.innerHTML = '';
                    if (catalog.length === 0) {
                        catalogModalList.innerHTML = '<div class="text-center py-4 text-gray-500 text-sm">Your catalog is empty. Add items from the Dashboard.</div>';
                    } else {
                        catalog.forEach(item => {
                            const btn = document.createElement('button');
                            btn.className = 'flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left w-full group';
                            btn.innerHTML = `
                                <div class="flex flex-col">
                                    <span class="text-sm font-bold text-gray-900">${item.description}</span>
                                    <span class="text-xs text-gray-500">₹${item.price} • ${item.tax}% Tax</span>
                                </div>
                                <span class="material-symbols-outlined text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">add_circle</span>
                            `;
                            btn.addEventListener('click', () => {
                                const tableBody = document.getElementById('items-table');
                                if (tableBody) {
                                    const rowHtml = `
                                    <tr class="group relative bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 transition-all">
                                    <td class="py-2 px-2 rounded-l-xl">
                                    <div class="flex items-start gap-3">
                                    <div class="mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                                    <button class="w-7 h-7 rounded-full flex items-center justify-center bg-gray-50 border border-gray-200 text-gray-600 hover:text-primary active:shadow-inner transition-all mb-1" title="Duplicate"><span class="material-symbols-outlined text-[14px]">content_copy</span></button>
                                    <button class="w-7 h-7 rounded-full flex items-center justify-center bg-gray-50 border border-gray-200 text-gray-600 hover:text-red-600 active:shadow-inner transition-all" title="Delete"><span class="material-symbols-outlined text-[14px]">delete</span></button>
                                    </div>
                                    <div class="flex-1"><textarea class="w-full bg-gray-50 text-gray-900 font-body-md text-body-md rounded-xl py-1.5 px-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" rows="1">${item.description}</textarea></div>
                                    </div>
                                    </td>
                                    <td class="py-2 px-2 text-right"><input class="w-16 text-right bg-gray-50 rounded-xl py-1.5 px-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50" type="number" value="1"></td>
                                    <td class="py-2 px-2 text-right"><div class="flex items-center justify-end gap-1"><span class="currency-symbol">₹</span><input class="w-24 text-right bg-gray-50 rounded-xl py-1.5 px-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50" type="text" value="${item.price}"></div></td>
                                    <td class="py-2 px-2 text-right"><div class="flex items-center justify-end gap-1"><input class="w-16 text-right bg-gray-50 rounded-xl py-1.5 px-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50" type="text" value="0"><span>%</span></div></td>
                                    <td class="py-2 px-2 text-right text-gray-600">${item.tax}%</td>
                                    <td class="py-2 px-2 text-right font-label-md font-bold text-gray-900">₹0</td>
                                    </tr>`;
                                    tableBody.insertAdjacentHTML('beforeend', rowHtml);
                                    attachRowListeners(tableBody.lastElementChild);
                                    
                                    const sym = currencySelect ? (currencySelect.value === 'USD' ? '$' : currencySelect.value === 'EUR' ? '€' : '₹') : '₹';
                                    tableBody.lastElementChild.querySelector('.currency-symbol').textContent = sym;
                                    
                                    calculateTotals();
                                    closeCatalogBtn.click();
                                    showToast('Item added from catalog', 'inventory_2');
                                }
                            });
                            catalogModalList.appendChild(btn);
                        });
                    }
                }
            });

            closeCatalogBtn.addEventListener('click', () => {
                catalogModal.classList.add('opacity-0', 'pointer-events-none');
                catalogModal.querySelector('div').classList.add('scale-95');
            });

            catalogModal.addEventListener('click', (e) => {
                if (e.target === catalogModal) closeCatalogBtn.click();
            });
        }

        // Save Draft
        const saveDraftBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('Save Draft'));
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', async () => {
                updateStateFromDOM();
                
                if (window.saveClient && currentState.customerInfo.companyName) {
                    await window.saveClient(currentState.customerInfo);
                }

                const originalText = saveDraftBtn.innerHTML;
                saveDraftBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">check</span> Saved!';
                showToast('Draft saved successfully!', 'save');
                setTimeout(() => {
                    saveDraftBtn.innerHTML = originalText;
                }, 2000);
            });
        }
        
        // Continue to Summary
        const continueBtn = Array.from(document.querySelectorAll('a')).find(a => a.textContent.includes('Continue to Summary'));
        if (continueBtn) {
            continueBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                updateStateFromDOM();
                
                // Save client details for future auto-fill
                if (window.saveClient && currentState.customerInfo.companyName) {
                    await window.saveClient(currentState.customerInfo);
                }

                window.location.href = continueBtn.href;
            });
        }

        // Back to Input button
        const backBtns = Array.from(document.querySelectorAll('a, button')).filter(el => el.textContent.includes('Back to Input'));
        backBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                updateStateFromDOM();
                window.location.href = 'QuoteFlow_AI_Quotation_Builder.html?edit=true';
            });
        });

        // Edit Customer Info Pencil Button
        const custSection = document.querySelector('section');
        if (custSection) {
            const editCustBtn = Array.from(custSection.querySelectorAll('button')).find(b => b.querySelector('.material-symbols-outlined')?.textContent.trim() === 'edit');
            if (editCustBtn) {
                editCustBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const firstInput = custSection.querySelector('input');
                    if (firstInput) {
                        firstInput.focus();
                        firstInput.select();
                    }
                    custSection.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
                    showToast('Editing Customer Information enabled', 'edit');
                    const icon = editCustBtn.querySelector('.material-symbols-outlined');
                    if (icon) {
                        icon.textContent = 'check';
                        icon.classList.add('text-green-600');
                        setTimeout(() => {
                            icon.textContent = 'edit';
                            icon.classList.remove('text-green-600');
                            custSection.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
                        }, 2500);
                    }
                });
            }
        }

        // AI Sparkle Buttons Interactivity
        document.querySelectorAll('.material-symbols-outlined').forEach(icon => {
            if (icon.textContent.trim() === 'auto_awesome') {
                icon.style.cursor = 'pointer';
                icon.addEventListener('click', () => {
                    const inputContainer = icon.closest('.relative');
                    const input = inputContainer ? inputContainer.querySelector('input, textarea') : null;
                    if (input) {
                        showToast(`AI field auto-verified: ${input.value || 'Field ready'}`, 'auto_awesome');
                        input.focus();
                    }
                });
            }
        });
    }

    // --- Step 3: Summary PDF ---
    if (window.location.pathname.includes('Step_3')) {
        let currentState = getState();
        
        const formatCurr = (amount) => {
            const symbol = currentState.quotationInfo.currency === 'USD' ? '$' : currentState.quotationInfo.currency === 'EUR' ? '€' : '₹';
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: currentState.quotationInfo.currency || 'INR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount).replace(/[a-zA-Z]+/, '').trim().replace(/^[^0-9]+/, symbol);
        };

        const populateSummary = () => {
            // Summary Card (left column)
            const sumRef = document.getElementById('summary-quote-ref');
            if (sumRef) sumRef.textContent = currentState.quotationInfo.no || 'Pending';

            const clientName = currentState.customerInfo.companyName || currentState.customerInfo.contactPerson || 'Walk-in Customer';
            const sumClient = document.getElementById('summary-client-name');
            if (sumClient) sumClient.textContent = clientName;

            const sumCount = document.getElementById('summary-items-count');
            if (sumCount && currentState.items) sumCount.textContent = `${currentState.items.length} ${currentState.items.length === 1 ? 'item' : 'items'}`;

            const sumTotal = document.getElementById('summary-grand-total');
            if (sumTotal && currentState.totals) sumTotal.textContent = formatCurr(currentState.totals.grandTotal);

            // PDF Document Details (right column)
            const pdfNo = document.getElementById('pdf-doc-no');
            if (pdfNo && currentState.quotationInfo.no) pdfNo.innerHTML = `<span class="font-semibold text-gray-800">Quote #:</span> ${currentState.quotationInfo.no}`;

            const pdfDate = document.getElementById('pdf-doc-date');
            if (pdfDate && currentState.quotationInfo.date) pdfDate.innerHTML = `<span class="font-semibold text-gray-800">Date:</span> ${currentState.quotationInfo.date}`;

            const pdfValid = document.getElementById('pdf-doc-valid');
            if (pdfValid && currentState.quotationInfo.validUntil) pdfValid.innerHTML = `<span class="font-semibold text-gray-800">Valid Until:</span> ${currentState.quotationInfo.validUntil}`;

            const pdfClient = document.getElementById('pdf-bill-name');
            if (pdfClient) pdfClient.textContent = clientName;

            const pdfAddress = document.getElementById('pdf-bill-address');
            if (pdfAddress) {
                const addr = currentState.customerInfo.billingAddress ? currentState.customerInfo.billingAddress.replace(/\n/g, '<br>') : '';
                const person = currentState.customerInfo.contactPerson || '';
                const email = currentState.customerInfo.email || '';
                const phone = currentState.customerInfo.phone || '';
                const gstin = currentState.customerInfo.gstin ? ` | GSTIN: ${currentState.customerInfo.gstin}` : '';
                pdfAddress.innerHTML = `${addr}${addr ? '<br>' : ''}Attn: ${person}${email ? ' | ' + email : ''}${phone ? ' | ' + phone : ''}${gstin}`;
            }

            // PDF Items List
            const pdfItemsList = document.getElementById('pdf-items-list');
            if (pdfItemsList && currentState.items && currentState.items.length > 0) {
                pdfItemsList.innerHTML = '';
                currentState.items.forEach(item => {
                    const rowHtml = `
                    <div class="grid grid-cols-12 items-center px-4 py-2.5 hover:bg-gray-50 text-xs text-gray-800 transition-colors">
                        <div class="col-span-6 font-medium">${item.description}</div>
                        <div class="col-span-2 text-right text-gray-600">${item.qty}</div>
                        <div class="col-span-2 text-right text-gray-600">${formatCurr(item.price)}</div>
                        <div class="col-span-2 text-right font-bold text-gray-900">${formatCurr(item.total)}</div>
                    </div>`;
                    pdfItemsList.insertAdjacentHTML('beforeend', rowHtml);
                });
            }

            // PDF Totals
            const pdfSub = document.getElementById('pdf-subtotal');
            if (pdfSub && currentState.totals) pdfSub.textContent = formatCurr(currentState.totals.subtotal);

            const pdfTax = document.getElementById('pdf-tax');
            if (pdfTax && currentState.totals) pdfTax.textContent = formatCurr(currentState.totals.gst);

            const pdfGrand = document.getElementById('pdf-grand-total');
            if (pdfGrand && currentState.totals) pdfGrand.textContent = formatCurr(currentState.totals.grandTotal);

            // PDF Terms
            const pdfTerms = document.getElementById('pdf-terms-text');
            if (pdfTerms && currentState.terms) {
                pdfTerms.textContent = `${currentState.terms.delivery}\n${currentState.terms.payment}\n${currentState.terms.conditions}`;
            }

            // Load Custom Company Settings if available
            if (window.getUserSettings) {
                window.getUserSettings().then(settings => {
                    if (settings && settings.companyName) {
                        const nameEl = document.getElementById('pdf-company-name');
                        const logoTextEl = document.getElementById('pdf-company-logo-text');
                        const detailsEl = document.getElementById('pdf-company-details');

                        if (nameEl) nameEl.textContent = settings.companyName;
                        if (logoTextEl) logoTextEl.textContent = settings.companyName.substring(0, 2).toUpperCase();
                        
                        if (detailsEl) {
                            const addr = settings.address ? settings.address.replace(/\n/g, '<br>') : '';
                            const email = settings.email || '';
                            const phone = settings.phone || '';
                            const gstin = settings.gstin ? `GSTIN: ${settings.gstin}` : '';
                            
                            let detailsHtml = addr;
                            if (detailsHtml && (email || phone || gstin)) detailsHtml += '<br>';
                            detailsHtml += [email, phone, gstin].filter(Boolean).join(' | ');
                            
                            detailsEl.innerHTML = detailsHtml || 'Company Details Not Provided';
                        }
                    }
                });
            }
        };

        try { populateSummary(); } catch(e) { console.error('Error populating summary', e); }

        // PDF Zoom
        let zoomLevel = 1;
        const pdfContainer = document.getElementById('pdf-paper-sheet');
        const zoomInBtn = document.querySelector('button[title="Zoom In"]');
        const zoomOutBtn = document.querySelector('button[title="Zoom Out"]');

        if (pdfContainer) {
            pdfContainer.style.transformOrigin = "top center";
            pdfContainer.style.transition = "transform 0.2s ease-out";
            
            if (zoomInBtn) {
                zoomInBtn.addEventListener('click', () => {
                    if (zoomLevel < 1.3) {
                        zoomLevel += 0.1;
                        pdfContainer.style.transform = `scale(${zoomLevel})`;
                        showToast(`Zoom level: ${Math.round(zoomLevel * 100)}%`, 'zoom_in');
                    }
                });
            }
            if (zoomOutBtn) {
                zoomOutBtn.addEventListener('click', () => {
                    if (zoomLevel > 0.7) {
                        zoomLevel -= 0.1;
                        pdfContainer.style.transform = `scale(${zoomLevel})`;
                        showToast(`Zoom level: ${Math.round(zoomLevel * 100)}%`, 'zoom_out');
                    }
                });
            }
        }

        // Download PDF functionality
        const downloadPdfBtn = document.getElementById('download-pdf-btn');
        if (downloadPdfBtn) {
            downloadPdfBtn.addEventListener('click', () => {
                const element = document.getElementById('pdf-paper-sheet');
                if (!element) return;
                
                // Temporarily remove transform for accurate PDF generation
                const oldTransform = element.style.transform;
                element.style.transform = 'none';
                
                const opt = {
                    margin:       0,
                    filename:     `Quote_${currentState.quotationInfo.no || 'Draft'}_${currentState.customerInfo.companyName || 'Client'}.pdf`.replace(/\s+/g, '_'),
                    image:        { type: 'jpeg', quality: 0.98 },
                    html2canvas:  { scale: 2, useCORS: true, logging: false },
                    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
                };

                const originalBtnText = downloadPdfBtn.innerHTML;
                downloadPdfBtn.innerHTML = '<span class="material-symbols-outlined text-[18px] animate-spin">refresh</span> Generating...';
                downloadPdfBtn.disabled = true;

                // html2pdf is included globally in Step 3
                if (window.html2pdf) {
                    window.html2pdf().set(opt).from(element).save().then(() => {
                        element.style.transform = oldTransform;
                        downloadPdfBtn.innerHTML = originalBtnText;
                        downloadPdfBtn.disabled = false;
                        showToast('PDF downloaded successfully!', 'download_done');
                    }).catch(err => {
                        console.error('PDF generation error:', err);
                        element.style.transform = oldTransform;
                        downloadPdfBtn.innerHTML = originalBtnText;
                        downloadPdfBtn.disabled = false;
                        showToast('Failed to generate PDF.', 'error');
                    });
                } else {
                    element.style.transform = oldTransform;
                    downloadPdfBtn.innerHTML = originalBtnText;
                    downloadPdfBtn.disabled = false;
                    showToast('PDF library not loaded.', 'error');
                }
            });
        }

        // Save to Cloud button
        const saveCloudBtn = document.getElementById('save-cloud-btn');
        if (saveCloudBtn) {
            saveCloudBtn.addEventListener('click', async () => {
                const origHtml = saveCloudBtn.innerHTML;
                saveCloudBtn.innerHTML = '<span class="material-symbols-outlined text-[20px] animate-spin">refresh</span><span>Saving...</span>';
                saveCloudBtn.disabled = true;

                if (window.saveQuoteToCloud) {
                    const success = await window.saveQuoteToCloud(currentState);
                    if (success) {
                        saveCloudBtn.innerHTML = '<span class="material-symbols-outlined text-[20px]">check_circle</span><span>Saved!</span>';
                        saveCloudBtn.classList.remove('text-indigo-600', 'border-indigo-200');
                        saveCloudBtn.classList.add('text-green-600', 'border-green-200', 'bg-green-50');
                        showToast('Quotation successfully saved to Firestore!', 'cloud_done');
                    } else {
                        saveCloudBtn.innerHTML = origHtml;
                        saveCloudBtn.disabled = false;
                        showToast('Failed to save. Ensure you are logged in.', 'error');
                    }
                } else {
                    saveCloudBtn.innerHTML = origHtml;
                    saveCloudBtn.disabled = false;
                    showToast('Database connection not available.', 'error');
                }
            });
        }

        // Share button
        const shareBtn = document.getElementById('share-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', async () => {
                if (navigator.share) {
                    try {
                        await navigator.share({
                            title: `Quotation ${currentState.quotationInfo.no}`,
                            text: `View quotation for ${currentState.customerInfo.companyName}`,
                            url: window.location.href
                        });
                    } catch(err) {}
                } else {
                    navigator.clipboard.writeText(window.location.href);
                    showToast('Quotation link copied to clipboard!', 'share');
                }
            });
        }

        // Print button
        const printBtn = document.getElementById('print-btn');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                window.print();
            });
        }

        // Download PDF button
        const downloadBtn = document.getElementById('download-btn');
        const successMsg = document.getElementById('success-message');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                const orig = downloadBtn.innerHTML;
                downloadBtn.innerHTML = '<span class="material-symbols-outlined text-[18px] animate-spin">refresh</span> Processing...';
                downloadBtn.disabled = true;
                setTimeout(() => {
                    downloadBtn.innerHTML = orig;
                    downloadBtn.disabled = false;
                    if (successMsg) successMsg.classList.remove('hidden');
                    window.print();
                }, 1000);
            });
        }
    }

});
