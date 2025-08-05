document.addEventListener('DOMContentLoaded', () => {
    const addUnitButton = document.getElementById('addUnitButton');
    const workshop = document.getElementById('workshop');
    const outWorkshop = document.getElementById('out-workshop');
    const waitingWorkshop = document.getElementById('waiting-workshop');
    const subsectionDropZones = document.querySelectorAll('.subsection-drop-zone');

    let draggedItem = null;
    let unitCount = 0;
    
    // متغير لتتبع آخر نقرة مزدوجة
    let lastTapTime = 0;
    const doubleTapDelay = 300; // 300 مللي ثانية بين النقرتين

    // دالة لفرز الوحدات أبجديًا
    function sortUnitsAlphabetically(container) {
        const units = Array.from(container.querySelectorAll('.draggable-unit'));
        units.sort((a, b) => {
            const textA = a.textContent.trim().toLowerCase();
            const textB = b.textContent.trim().toLowerCase();
            return textA.localeCompare(textB, 'ar', { sensitivity: 'base' });
        });
        units.forEach(unit => {
            container.appendChild(unit);
        });
    }

    // دالة مساعدة لتحديث لون الوحدة بناءً على منطقة الإسقاط
    function updateUnitColor(unit, dropZoneElement) {
        if (dropZoneElement.id === 'out-workshop') {
            unit.style.backgroundColor = 'var(--danger-red)';
        } else if (dropZoneElement.id === 'waiting-workshop') {
            unit.style.backgroundColor = 'var(--accent-orange)';
        } else {
            unit.style.backgroundColor = 'var(--primary-blue)';
        }
    }

    // دالة لمعالجة إفلات الوحدة
    function dropItem(targetDropZone) {
        if (draggedItem && draggedItem.parentElement !== targetDropZone) {
            if (draggedItem.parentElement) {
                draggedItem.parentElement.removeChild(draggedItem);
            }
            
            targetDropZone.appendChild(draggedItem);
            updateUnitColor(draggedItem, targetDropZone);
            sortUnitsAlphabetically(targetDropZone);

            // إزالة تأثير السحب وتفريغ المتغير
            draggedItem.classList.remove('dragging');
            draggedItem = null;
        }
    }

    // تهيئة مناطق الإسقاط (للمستخدم العادي بالنقر مرة واحدة)
    function setupDropZone(element) {
        // أحداث الماوس القديمة
        element.addEventListener('dragover', (e) => {
            e.preventDefault();
            element.classList.add('drag-over');
        });
        element.addEventListener('dragleave', () => {
            element.classList.remove('drag-over');
        });
        element.addEventListener('drop', (e) => {
            e.preventDefault();
            element.classList.remove('drag-over');
            if (draggedItem && draggedItem.parentElement !== element) {
                dropItem(element);
            }
        });

        // حدث اللمس لإفلات الوحدة
        element.addEventListener('touchstart', (e) => {
            if (draggedItem) {
                e.preventDefault(); // منع سلوك اللمس الافتراضي
                dropItem(element);
            }
        });
    }
    
    // قائمة بجميع مناطق الإسقاط الصالحة
    const allDropZones = [waitingWorkshop, outWorkshop, ...Array.from(subsectionDropZones), workshop];

    // تطبيق تهيئة مناطق الإسقاط على جميع المناطق
    allDropZones.forEach(zone => {
        setupDropZone(zone);
    });

    // دالة إنشاء وحدة جديدة
    function createDraggableUnit(initialText = null) {
        const newUnit = document.createElement('div');
        newUnit.className = 'draggable-unit';
        newUnit.textContent = initialText || `وحدة رقم ${++unitCount}`; 
        newUnit.draggable = true;

        // أحداث السحب بالماوس
        newUnit.addEventListener('dragstart', (e) => {
            draggedItem = newUnit;
            e.dataTransfer.setData('text/plain', '');
            e.dataTransfer.effectAllowed = 'move';
            setTimeout(() => newUnit.classList.add('dragging'), 0);
        });

        newUnit.addEventListener('dragend', () => {
            newUnit.classList.remove('dragging');
            draggedItem = null;
        });

        // أحداث اللمس (هنا التغيير الرئيسي)
        newUnit.addEventListener('touchstart', (e) => {
            e.preventDefault(); // منع السلوك الافتراضي (التمرير أو التحديد)
            const currentTime = new Date().getTime();
            const tapDifference = currentTime - lastTapTime;

            if (tapDifference < doubleTapDelay && tapDifference > 0) {
                // حدثت نقرتان بسرعة، هذا هو النقر المزدوج
                e.stopPropagation(); // منع انتقال الحدث إلى أي عنصر آخر

                if (draggedItem) {
                    // إذا كان هناك عنصر آخر مسحوب بالفعل، قم بإفلاته أولاً
                    draggedItem.classList.remove('dragging');
                    draggedItem = null;
                }

                // "التقاط" الوحدة الجديدة
                draggedItem = newUnit;
                draggedItem.classList.add('dragging');

                // إظهار رسالة أو أيقونة لتوضيح أن الوحدة أصبحت "ممسوكة" (اختياري)
            }
            lastTapTime = currentTime;
        });

        // دبل كليك لتعديل النص
        newUnit.addEventListener('dblclick', () => {
            // منطق تعديل النص كما هو
            const currentText = newUnit.textContent;
            const inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.value = currentText;
            inputField.className = 'edit-unit-input';

            newUnit.textContent = '';
            newUnit.appendChild(inputField);

            inputField.focus();

            const saveChanges = () => {
                newUnit.textContent = inputField.value.trim() || currentText;
                if (newUnit.contains(inputField)) {
                    newUnit.removeChild(inputField);
                }
                sortUnitsAlphabetically(newUnit.parentElement);
            };

            inputField.addEventListener('blur', saveChanges);
            inputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    saveChanges();
                    inputField.blur();
                }
            });
        });

        waitingWorkshop.appendChild(newUnit); 
        newUnit.style.backgroundColor = 'var(--accent-orange)';
    }
    
    // زر الإضافة
    addUnitButton.addEventListener('click', () => createDraggableUnit());

    // إضافة المربعات الأولية
    const totalInitialUnits = 236;
    const numberedUnitsStart = 3001;
    const numberedUnitsEnd = 3221;

    for (let i = 0; i < totalInitialUnits; i++) {
        let unitText;
        if (i < (numberedUnitsEnd - numberedUnitsStart + 1)) {
            unitText = `${numberedUnitsStart + i}`;
        } else {
            unitText = `وحدة رقم ${unitCount + 1}`;
            unitCount++;
        }
        createDraggableUnit(unitText);
    }
    
    // الفرز النهائي بعد إضافة جميع المربعات
    sortUnitsAlphabetically(waitingWorkshop);
});vvvv
