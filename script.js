document.addEventListener('DOMContentLoaded', () => {
    // العناصر الرئيسية
    const waitingWorkshop = document.getElementById('waiting-workshop');
    const workshopSections = document.querySelectorAll('.subsection-drop-zone');
    const outWorkshop = document.getElementById('out-workshop');
    const workshopDialog = document.getElementById('workshopDialog');
    const confirmDialog = document.getElementById('confirmDialog');
    
    // الإحصائيات
    const waitingCount = document.getElementById('waiting-count');
    const workshopCount = document.getElementById('workshop-count');
    const sparePartCount = document.getElementById('spare-part-count');
    const outCount = document.getElementById('out-count');
    
    // المتغيرات
    let selectedUnit = null;
    let targetSection = null;
    
    // تهيئة الوحدات
    function initializeUnits() {
        // مسح أي وحدات موجودة مسبقاً
        document.querySelectorAll('.draggable-unit').forEach(unit => unit.remove());
        
        // إنشاء الوحدات حسب التسلسل المطلوب
        const unitNumbers = [
            // 3001-3221 (221 وحدة)
            ...Array.from({length: 221}, (_, i) => 3001 + i),
            // 3234 (وحدة واحدة)
            3234,
            // 3562-3565 (4 وحدات)
            ...Array.from({length: 4}, (_, i) => 3562 + i),
            // 1551-1560 (10 وحدات)
            ...Array.from({length: 10}, (_, i) => 1551 + i)
        ];
        
        // إنشاء جميع الوحدات في منطقة الانتظار
        unitNumbers.forEach(num => {
            createUnit(num.toString(), waitingWorkshop);
        });
        
        updateAllCounts();
    }
    
    // إنشاء وحدة جديدة
    function createUnit(text, parent) {
        const unit = document.createElement('div');
        unit.className = 'draggable-unit';
        unit.textContent = text;
        unit.draggable = true;
        
        // حدث السحب
        unit.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', unit.textContent);
            selectedUnit = unit;
        });
        
        // حدث النقر على الوحدة
        unit.addEventListener('click', (e) => {
            if (e.shiftKey) {
                // نقل مباشر خارج الورشة مع الضغط على Shift
                showConfirmDialog('هل أنت متأكد من نقل هذه الوحدة خارج الورشة؟', () => {
                    moveUnit(unit, outWorkshop);
                });
            } else {
                handleUnitClick(unit);
            }
        });
        
        parent.appendChild(unit);
        updateUnitColor(unit, parent);
        return unit;
    }
    
    // تحديث لون الوحدة حسب المنطقة
    function updateUnitColor(unit, parent) {
        if (parent.id === 'out-workshop') {
            unit.style.backgroundColor = 'var(--danger-red)';
        } else if (parent.id === 'waiting-workshop') {
            unit.style.backgroundColor = 'var(--accent-orange)';
        } else if (parent.id === 'spare-part') {
            unit.style.backgroundColor = 'var(--secondary-green)';
        } else {
            unit.style.backgroundColor = 'var(--primary-blue)';
        }
    }
    
    // التعامل مع نقر الوحدة
    function handleUnitClick(unit) {
        selectedUnit = unit;
        const currentParent = unit.parentElement;
        
        if (currentParent.id === 'waiting-workshop') {
            showWorkshopDialog();
        } 
        else if (currentParent.id === 'spare-part') {
            showWorkshopDialog();
        }
        else if (Array.from(workshopSections).some(section => section === currentParent)) {
            moveToSparePart();
        }
        else if (currentParent.id === 'out-workshop') {
            moveToWaiting();
        }
    }
    
    // عرض حوار اختيار قسم الورشة
    function showWorkshopDialog() {
        workshopDialog.querySelectorAll('button[data-section]').forEach(btn => {
            btn.onclick = (e) => {
                targetSection = document.getElementById(e.target.dataset.section);
                workshopDialog.close();
                moveUnit(selectedUnit, targetSection);
            };
        });
        
        document.getElementById('cancelWorkshopMove').onclick = () => {
            workshopDialog.close();
        };
        
        workshopDialog.showModal();
    }
    
    // عرض حوار التأكيد
    function showConfirmDialog(message, confirmAction) {
        confirmDialog.querySelector('#confirmMessage').textContent = message;
        
        document.getElementById('confirmYes').onclick = () => {
            confirmAction();
            confirmDialog.close();
        };
        
        document.getElementById('confirmNo').onclick = () => {
            confirmDialog.close();
        };
        
        confirmDialog.showModal();
    }
    
    // نقل الوحدة إلى قسم انتظار الإسبير
    function moveToSparePart() {
        const sparePart = document.getElementById('spare-part');
        moveUnit(selectedUnit, sparePart);
    }
    
    // نقل الوحدة إلى منطقة الانتظار
    function moveToWaiting() {
        moveUnit(selectedUnit, waitingWorkshop);
    }
    
    // نقل الوحدة مع التأكيد إذا كانت إلى خارج الورشة
    function moveUnit(unit, target) {
        if (target.id === 'out-workshop') {
            showConfirmDialog('هل أنت متأكد من نقل هذه الوحدة خارج الورشة؟', () => {
                performMove(unit, target);
            });
        } else {
            performMove(unit, target);
        }
    }
    
    // تنفيذ نقل الوحدة
    function performMove(unit, target) {
        target.appendChild(unit);
        updateUnitColor(unit, target);
        updateAllCounts();
    }
    
    // تحديث جميع العدادت
    function updateAllCounts() {
        updateCount(waitingWorkshop, waitingCount);
        updateWorkshopCount();
        updateCount(document.getElementById('spare-part'), sparePartCount);
        updateCount(outWorkshop, outCount);
        
        // تحديث العدادت في العناوين
        document.querySelectorAll('.drop-zone, .subsection-drop-zone').forEach(zone => {
            const badge = zone.querySelector('.count-badge');
            if (badge) {
                badge.textContent = zone.querySelectorAll('.draggable-unit').length;
            }
        });
    }
    
    // تحديث عداد منطقة محددة
    function updateCount(zone, counter) {
        if (counter) {
            counter.textContent = zone.querySelectorAll('.draggable-unit').length;
        }
    }
    
    // تحديث عداد الورشة الكلي
    function updateWorkshopCount() {
        let total = 0;
        workshopSections.forEach(section => {
            total += section.querySelectorAll('.draggable-unit').length;
        });
        workshopCount.textContent = total;
    }
    
    // أحداث السحب والإفلات لمناطق الإسقاط
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
                moveUnit(selectedUnit, zone);
            }
        });
    });// تهيئة الوحدات
function initializeUnits() {
    const waitingUnitsContainer = document.getElementById('waiting-units');
    
    // إنشاء الوحدات حسب التسلسل المطلوب
    const unitNumbers = [
        // 3001-3221 (221 وحدة)
        ...Array.from({length: 221}, (_, i) => 3001 + i),
        // 3234 (وحدة واحدة)
        3234,
        // 3562-3565 (4 وحدات)
        ...Array.from({length: 4}, (_, i) => 3562 + i),
        // 1551-1560 (10 وحدات)
        ...Array.from({length: 10}, (_, i) => 1551 + i)
    ];
    
    // إنشاء جميع الوحدات في منطقة الانتظار
    unitNumbers.forEach(num => {
        const unit = document.createElement('div');
        unit.className = 'draggable-unit';
        unit.textContent = num;
        unit.draggable = true;
        
        unit.addEventListener('click', (e) => {
            if (e.shiftKey) {
                showConfirmDialog('هل أنت متأكد من نقل هذه الوحدة خارج الورشة؟', () => {
                    moveUnit(unit, outWorkshop);
                });
            } else {
                showWorkshopDialog(unit);
            }
        });
        
        waitingUnitsContainer.appendChild(unit);
    });
    
    updateAllCounts();
}
    
    // تهيئة التطبيق
    initializeUnits();
});

