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
        // الوحدات من 3001 إلى 3221 (221 وحدة)
        for (let i = 3001; i <= 3221; i++) {
            createUnit(i.toString(), waitingWorkshop);
        }
        
        // الوحدة 3234
        createUnit('3234', waitingWorkshop);
        
        // الوحدات من 3562 إلى 3565 (4 وحدات)
        for (let i = 3562; i <= 3565; i++) {
            createUnit(i.toString(), waitingWorkshop);
        }
        
        // الوحدات من 1551 إلى 1560 (10 وحدات)
        for (let i = 1551; i <= 1560; i++) {
            createUnit(i.toString(), waitingWorkshop);
        }
        
        updateAllCounts();
    }
    
    // إنشاء وحدة جديدة
    function createUnit(text, parent) {
        const unit = document.createElement('div');
        unit.className = 'draggable-unit';
        unit.textContent = text;
        
        // حدث النقر على الوحدة
        unit.addEventListener('click', (e) => {
            e.stopPropagation();
            handleUnitClick(unit);
        });
        
        parent.appendChild(unit);
        updateUnitColor(unit, parent);
    }
    
    // تحديث لون الوحدة حسب المنطقة
    function updateUnitColor(unit, parent) {
        if (parent.id === 'out-workshop') {
            unit.style.backgroundColor = 'var(--danger-red)';
        } else if (parent.id === 'waiting-workshop') {
            unit.style.backgroundColor = 'var(--accent-orange)';
        } else {
            unit.style.backgroundColor = 'var(--primary-blue)';
        }
    }
    
    // التعامل مع نقر الوحدة
    function handleUnitClick(unit) {
        selectedUnit = unit;
        const currentParent = unit.parentElement;
        
        if (currentParent.id === 'waiting-workshop') {
            // النقل من الانتظار إلى الورشة
            showWorkshopDialog();
        } 
        else if (currentParent.id === 'spare-part') {
            // النقل من انتظار الإسبير إلى الورشة
            showWorkshopDialog();
        }
        else if (Array.from(workshopSections).some(section => section === currentParent)) {
            // النقل من الورشة إلى انتظار الإسبير
            moveToSparePart();
        }
        else if (currentParent.id === 'out-workshop') {
            // النقل من خارج الورشة إلى الانتظار
            moveToWaiting();
        }
    }
    
    // عرض حوار اختيار قسم الورشة
    function showWorkshopDialog() {
        workshopDialog.querySelectorAll('button[data-section]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                targetSection = document.getElementById(e.target.dataset.section);
                workshopDialog.close();
                moveUnit(selectedUnit, targetSection);
            }, { once: true });
        });
        
        document.getElementById('cancelWorkshopMove').addEventListener('click', () => {
            workshopDialog.close();
            selectedUnit = null;
            targetSection = null;
        }, { once: true });
        
        workshopDialog.showModal();
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
            confirmDialog.querySelector('#confirmMessage').textContent = 'هل أنت متأكد من نقل هذه الوحدة خارج الورشة؟';
            
            document.getElementById('confirmYes').addEventListener('click', () => {
                performMove(unit, target);
                confirmDialog.close();
            }, { once: true });
            
            document.getElementById('confirmNo').addEventListener('click', () => {
                confirmDialog.close();
            }, { once: true });
            
            confirmDialog.showModal();
        } else {
            performMove(unit, target);
        }
    }
    
    // تنفيذ نقل الوحدة
    function performMove(unit, target) {
        target.appendChild(unit);
        updateUnitColor(unit, target);
        updateAllCounts();
        selectedUnit = null;
        targetSection = null;
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
        counter.textContent = zone.querySelectorAll('.draggable-unit').length;
    }
    
    // تحديث عداد الورشة الكلي
    function updateWorkshopCount() {
        let total = 0;
        workshopSections.forEach(section => {
            total += section.querySelectorAll('.draggable-unit').length;
        });
        workshopCount.textContent = total;
    }
    
    // تهيئة التطبيق
    initializeUnits();
    
    // منع الانتقال الافتراضي عند النقر على مناطق الإسقاط
    document.querySelectorAll('.drop-zone, .subsection-drop-zone').forEach(zone => {
        zone.addEventListener('click', (e) => {
            if (e.target === zone) {
                e.stopPropagation();
            }
        });
    });
});
