document.addEventListener('DOMContentLoaded', () => {
    // العناصر الرئيسية
    const waitingWorkshop = document.getElementById('waiting-workshop');
    const waitingUnitsContainer = document.getElementById('waiting-units');
    const workshopSections = {
        cargo: document.getElementById('cargo'),
        tipper: document.getElementById('tipper'),
        tanker: document.getElementById('tanker'),
        silo: document.getElementById('silo'),
        rehb: document.getElementById('rehb'),
        overhaul: document.getElementById('overhaul'),
        sparePart: document.getElementById('spare-part')
    };
    const outWorkshop = document.getElementById('out-workshop');
    
    // عناصر الحوارات
    const workshopDialog = document.getElementById('workshopDialog');
    const confirmDialog = document.getElementById('confirmDialog');
    const confirmMessage = document.getElementById('confirmMessage');
    
    // عناصر الإحصائيات
    const waitingCount = document.getElementById('waiting-count');
    const workshopCount = document.getElementById('workshop-count');
    const sparePartCount = document.getElementById('spare-part-count');
    const outCount = document.getElementById('out-count');
    
    // المتغيرات
    let selectedUnit = null;
    let targetSection = null;
    
    // تهيئة الوحدات
    function initializeUnits() {
        // إنشاء الوحدات حسب التسلسل المطلوب
        const unitNumbers = generateUnitNumbers();
        
        // إنشاء جميع الوحدات في منطقة الانتظار
        unitNumbers.forEach(num => {
            createUnit(num, waitingUnitsContainer);
        });
        
        updateAllCounts();
    }
    
    // توليد أرقام الوحدات حسب المطلوب
    function generateUnitNumbers() {
        return [
            // 3001-3221 (221 وحدة)
            ...Array.from({length: 221}, (_, i) => 3001 + i),
            // 3234 (وحدة واحدة)
            3234,
            // 3562-3565 (4 وحدات)
            ...Array.from({length: 4}, (_, i) => 3562 + i),
            // 1551-1560 (10 وحدات)
            ...Array.from({length: 10}, (_, i) => 1551 + i)
        ];
    }
    
    // إنشاء وحدة جديدة
    function createUnit(number, container) {
        const unit = document.createElement('div');
        unit.className = 'draggable-unit';
        unit.textContent = number;
        unit.draggable = true;
        
        // إعداد أحداث الوحدة
        setupUnitEvents(unit);
        
        container.appendChild(unit);
        return unit;
    }
    
    // إعداد أحداث الوحدة
    function setupUnitEvents(unit) {
        // حدث السحب
        unit.addEventListener('dragstart', (e) => {
            selectedUnit = unit;
            e.dataTransfer.setData('text/plain', unit.textContent);
        });
        
        // حدث النقر
        unit.addEventListener('click', (e) => {
            e.stopPropagation();
            handleUnitClick(unit, e.shiftKey);
        });
        
        // حدث النقر المطول (لأجهزة اللمس)
        let pressTimer;
        unit.addEventListener('touchstart', (e) => {
            pressTimer = setTimeout(() => {
                handleUnitClick(unit, true);
            }, 800);
        });
        
        unit.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
        });
    }
    
    // التعامل مع نقر الوحدة
    function handleUnitClick(unit, isShiftPressed) {
        selectedUnit = unit;
        const currentParent = unit.parentElement.parentElement;
        
        if (currentParent.id === 'waiting-workshop') {
            showWorkshopDialog();
        } 
        else if (currentParent.id === 'spare-part') {
            showWorkshopDialog();
        }
        else if (isShiftPressed) {
            showConfirmDialog('هل أنت متأكد من نقل هذه الوحدة خارج الورشة؟', () => {
                moveUnit(unit, outWorkshop.querySelector('.units-grid'));
            });
        }
        else if (Object.values(workshopSections).some(section => section === currentParent)) {
            moveToSparePart(unit);
        }
        else if (currentParent.id === 'out-workshop') {
            moveToWaiting(unit);
        }
    }
    
    // عرض حوار اختيار قسم الورشة
    function showWorkshopDialog() {
        // إعداد أحداث الأزرار
        document.querySelectorAll('#workshopDialog button[data-section]').forEach(btn => {
            btn.onclick = (e) => {
                const sectionId = e.target.dataset.section;
                targetSection = workshopSections[sectionId].querySelector('.units-grid');
                workshopDialog.close();
                moveUnit(selectedUnit, targetSection);
            };
        });
        
        document.getElementById('cancelWorkshopMove').onclick = () => {
            workshopDialog.close();
            selectedUnit = null;
        };
        
        workshopDialog.showModal();
    }
    
    // عرض حوار التأكيد
    function showConfirmDialog(message, confirmAction) {
        confirmMessage.textContent = message;
        
        document.getElementById('confirmYes').onclick = () => {
            confirmAction();
            confirmDialog.close();
            selectedUnit = null;
        };
        
        document.getElementById('confirmNo').onclick = () => {
            confirmDialog.close();
            selectedUnit = null;
        };
        
        confirmDialog.showModal();
    }
    
    // نقل الوحدة إلى قسم انتظار الإسبير
    function moveToSparePart(unit) {
        moveUnit(unit, workshopSections.sparePart.querySelector('.units-grid'));
    }
    
    // نقل الوحدة إلى منطقة الانتظار
    function moveToWaiting(unit) {
        moveUnit(unit, waitingUnitsContainer);
    }
    
    // نقل الوحدة
    function moveUnit(unit, targetContainer) {
        if (unit && targetContainer && unit.parentElement !== targetContainer) {
            targetContainer.appendChild(unit);
            updateUnitColor(unit, targetContainer.parentElement);
            updateAllCounts();
        }
    }
    
    // تحديث لون الوحدة حسب المنطقة
    function updateUnitColor(unit, parentElement) {
        const colors = {
            'waiting-workshop': 'var(--accent-orange)',
            'cargo': 'var(--primary-blue)',
            'tipper': 'var(--primary-blue)',
            'tanker': 'var(--primary-blue)',
            'silo': 'var(--primary-blue)',
            'rehb': 'var(--primary-blue)',
            'overhaul': 'var(--primary-blue)',
            'spare-part': 'var(--secondary-green)',
            'out-workshop': 'var(--danger-red)'
        };
        
        unit.style.backgroundColor = colors[parentElement.id] || 'var(--primary-blue)';
    }
    
    // تحديث جميع العدادت
    function updateAllCounts() {
        // تحديث العدادت الرئيسية
        waitingCount.textContent = waitingUnitsContainer.children.length;
        sparePartCount.textContent = workshopSections.sparePart.querySelector('.units-grid').children.length;
        outCount.textContent = outWorkshop.querySelector('.units-grid').children.length;
        
        // تحديث عداد الورشة الكلي
        let workshopTotal = 0;
        Object.values(workshopSections).forEach(section => {
            if (section.id !== 'spare-part') {
                workshopTotal += section.querySelector('.units-grid').children.length;
            }
        });
        workshopCount.textContent = workshopTotal;
        
        // تحديث العدادت في العناوين
        document.querySelectorAll('.count-badge').forEach(badge => {
            const container = badge.closest('.drop-zone, .subsection-drop-zone');
            if (container) {
                const unitsGrid = container.querySelector('.units-grid');
                badge.textContent = unitsGrid ? unitsGrid.children.length : 0;
            }
        });
    }
    
    // إعداد أحداث السحب والإفلات
    function setupDropZones() {
        document.querySelectorAll('.drop-zone, .subsection-drop-zone').forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('drag-over');
            });
            
            zone.addEventListener('dragleave', () => {
                zone.classList.remove('drag-over');
            });
            
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');
                
                if (selectedUnit) {
                    const targetGrid = zone.querySelector('.units-grid') || zone;
                    moveUnit(selectedUnit, targetGrid);
                }
            });
        });
    }
    
    // تهيئة التطبيق
    initializeUnits();
    setupDropZones();
});
